/**
 * Crawls the live https://shreeshyamfoundation.in/ site and captures its content
 * verbatim as the source of truth for the rebuild.
 *
 *   pnpm exec tsx scripts/crawl.ts
 *
 * Outputs
 *   content/<slug>.json            meta, ordered sections, forms, images, links
 *   content/_crawl.json            crawl summary + status of every link/asset found
 *   assets/original/<slug>/        every image / SVG / icon used by the page
 *   docs/screenshots/<slug>-{1440,390}.png
 *
 * Text is only whitespace-normalised (runs of spaces/newlines collapsed); nothing
 * is rewritten, translated or inferred. Missing values are recorded as null.
 */
import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const ORIGIN = 'https://shreeshyamfoundation.in';
const SEEDS = [
  'index.php',
  'about-us.php',
  'our-mission.php',
  'our-vision.php',
  'team.php',
  'gallery.php',
  'milestone.php',
  'women-empowerment-loan.php',
  'micro-business-loan.php',
  'agriculture-rural-livelihood-loan.php',
  'livestock-loan.php',
  'our-policy.php',
  'career.php',
  'registration.php',
  'registration-process.php',
  'contact-us.php',
  'privacy-policy.php',
];
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
] as const;
const MAX_ATTEMPTS = 3;

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const ASSET_DIR = path.join(ROOT, 'assets', 'original');
const SHOT_DIR = path.join(ROOT, 'docs', 'screenshots');

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp|tiff?)$/i;
const NON_PAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp|tiff?|css|js|json|xml|txt|pdf|docx?|xlsx?|zip|mp4|webm|mp3|woff2?|ttf|otf|eot)$/i;
const ICON_FONT = /(remixicon|fontawesome|fa-(solid|regular|brands)|webfonts\/fa|icomoon|flaticon)/i;

// ---------------------------------------------------------------------------
// URL helpers

function isSameSite(u: URL): boolean {
  return u.hostname.replace(/^www\./, '') === new URL(ORIGIN).hostname;
}

/** Normalised page URL used as the crawl key, or null if the link is not a crawlable page. */
function toPageUrl(href: string, base: string): string | null {
  let u: URL;
  try {
    u = new URL(href, base);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(u.protocol) || !isSameSite(u)) return null;
  if (NON_PAGE_EXT.test(u.pathname)) return null;
  u.hash = '';
  u.protocol = 'https:';
  u.hostname = new URL(ORIGIN).hostname;
  if (u.pathname === '/' || u.pathname === '') u.pathname = '/index.php';
  return u.toString();
}

function slugFor(pageUrl: string): string {
  const u = new URL(pageUrl);
  let slug = u.pathname.replace(/^\/+/, '').replace(/\.(php|html?)$/i, '').replace(/\/+$/, '');
  slug = slug.replace(/[\/\\]+/g, '__') || 'index';
  if (u.search) slug += '--' + u.search.slice(1).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  return slug.toLowerCase();
}

function fileNameFor(assetUrl: string): string {
  const u = new URL(assetUrl);
  const base = decodeURIComponent(path.posix.basename(u.pathname)) || 'index';
  return base.replace(/[<>:"|?*\\/]/g, '_');
}

// ---------------------------------------------------------------------------
// In-page helpers (executed in the browser)

async function slowScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const step = Math.max(150, Math.round(window.innerHeight / 4));
    let y = 0;
    for (let i = 0; i < 2000; i++) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (y >= max) break;
      y = Math.min(y + step, max);
      window.scrollTo(0, y);
      await sleep(120);
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await sleep(800);
  });
}

/** Waits until every animated counter shows its target value and all counter text is stable. */
async function waitForCounters(page: Page): Promise<{ count: number; settled: boolean }> {
  const COUNTER_SEL =
    '[data-percentage], [data-count], [data-target], [data-to], [data-counter], .counter, .odometer, .count-up, .countup';
  const count = await page.locator(COUNTER_SEL).count();
  if (!count) return { count, settled: true };
  const settled = await page
    .waitForFunction(
      (sel) =>
        Array.from(document.querySelectorAll(sel)).every((el) => {
          const target = ['data-percentage', 'data-count', 'data-target', 'data-to', 'data-counter']
            .map((a) => el.getAttribute(a))
            .find((v) => v != null && v.trim() !== '' && !isNaN(parseFloat(v)));
          if (target == null) return true;
          const shown = parseFloat((el.textContent || '').replace(/[^\d.\-]/g, ''));
          return !isNaN(shown) && shown === parseFloat(target);
        }),
      COUNTER_SEL,
      { timeout: 20_000, polling: 250 },
    )
    .then(() => true)
    .catch(() => false);
  // Then require the text to be unchanged across ~1.5s.
  let prev = '';
  for (let stable = 0, i = 0; stable < 5 && i < 60; i++) {
    const now = await page.locator(COUNTER_SEL).allTextContents().then((t) => t.join('|'));
    stable = now === prev ? stable + 1 : 0;
    prev = now;
    await page.waitForTimeout(300);
  }
  return { count, settled };
}

/**
 * Runs inside the page and returns everything we capture. Kept self-contained
 * (no closures over Node scope) because it is serialised into the browser.
 */
function extractInPage() {
  const SKIP = 'script, style, noscript, template, .slick-cloned';
  const STATE_CLASS = /^(slick-|aos-|active$|open$|show$|current$|is-|swiper-slide-)/;

  const norm = (s: string | null | undefined) =>
    (s ?? '')
      .replace(/ /g, ' ')
      .split('\n')
      .map((l) => l.replace(/[ \t\r\f\v]+/g, ' ').trim())
      .filter(Boolean)
      .join('\n');

  const isRendered = (el: Element) => (el as HTMLElement).getClientRects().length > 0;
  const text = (el: Element | null | undefined): string => {
    if (!el) return '';
    // innerText keeps <br>/block line breaks but returns nothing for hidden nodes
    // (closed dropdowns, inactive slides), so fall back to textContent.
    return (isRendered(el) && norm((el as HTMLElement).innerText)) || norm(el.textContent);
  };
  const skipped = (el: Element) => !!el.closest(SKIP);
  const qsa = (root: ParentNode, sel: string) => Array.from(root.querySelectorAll(sel)).filter((e) => !skipped(e));
  const abs = (u: string | null | undefined) => {
    if (u == null) return null;
    try {
      return new URL(u, document.baseURI).toString();
    } catch {
      return null;
    }
  };
  const classes = (el: Element) =>
    Array.from(el.classList)
      .filter((c) => !STATE_CLASS.test(c))
      .join(' ');
  const iconClasses = (root: Element) =>
    Array.from(new Set(qsa(root, 'i[class], span[class*="icon"], span[class^="ri-"], span[class*=" fa-"]').map((i) => classes(i)).filter((c) => /(^|\s)(ri-|fa-|fa\s|fas|far|fab|bi-|icon)/.test(c)))).filter(Boolean);
  const ownText = (el: Element) =>
    norm(
      Array.from(el.childNodes)
        .map((n) => {
          if (n.nodeType === Node.TEXT_NODE) return n.textContent;
          if (n.nodeType === Node.ELEMENT_NODE && /^(B|STRONG|I|EM|SPAN|SMALL|A|U|SUP|SUB|MARK|BR|LABEL)$/.test((n as Element).tagName)) {
            const e = n as Element;
            if (e.tagName === 'BR') return '\n';
            if (e.matches('a.optech-default-btn, a[class*="btn"]')) return '';
            return e.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol, div, table') ? '' : e.textContent;
          }
          return '';
        })
        .join(''),
    );

  const linkInfo = (a: HTMLAnchorElement) => {
    const raw = a.getAttribute('href');
    const label = text(a) || norm(a.getAttribute('aria-label')) || norm(a.getAttribute('title')) || norm(a.getAttribute('data-text')) || '';
    let kind = 'external';
    const r = (raw ?? '').trim();
    if (raw == null) kind = 'no-href';
    else if (r === '' || r === '#') kind = 'empty-anchor';
    else if (/^javascript:/i.test(r)) kind = 'javascript';
    else if (r.startsWith('#')) kind = 'in-page-anchor';
    else if (/^mailto:/i.test(r)) kind = 'mailto';
    else if (/^tel:/i.test(r)) kind = 'tel';
    else {
      try {
        const u = new URL(r, document.baseURI);
        if (u.hostname.replace(/^www\./, '') === location.hostname.replace(/^www\./, '')) kind = 'internal';
      } catch {
        kind = 'invalid';
      }
    }
    return {
      label,
      href: raw,
      url: kind === 'internal' || kind === 'external' ? abs(raw) : null,
      kind,
      target: a.getAttribute('target'),
      icons: iconClasses(a),
      hasVisibleText: !!text(a),
    };
  };

  const imgInfo = (img: HTMLImageElement) => ({
    kind: 'img' as const,
    src: img.getAttribute('src'),
    url: abs(img.currentSrc || img.getAttribute('src') || img.getAttribute('data-src')),
    dataSrc: img.getAttribute('data-src'),
    srcset: img.getAttribute('srcset'),
    alt: img.hasAttribute('alt') ? img.getAttribute('alt') : null,
    altMissing: !img.hasAttribute('alt'),
    title: img.getAttribute('title'),
    width: img.naturalWidth || null,
    height: img.naturalHeight || null,
    className: classes(img) || null,
  });

  const bgImages = (root: Element) => {
    const out: { kind: 'css-background'; url: string; element: string; alt: null }[] = [];
    const els = [root, ...qsa(root, '*')];
    for (const el of els) {
      for (const pseudo of [null, '::before', '::after']) {
        const bg = getComputedStyle(el, pseudo).backgroundImage;
        if (!bg || bg === 'none') continue;
        for (const m of bg.matchAll(/url\((['"]?)(.*?)\1\)/g)) {
          const url = abs(m[2]);
          if (url && !url.startsWith('data:')) out.push({ kind: 'css-background', url, element: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${classes(el) ? '.' + classes(el).replace(/\s+/g, '.') : ''}${pseudo ?? ''}`, alt: null });
        }
      }
    }
    return out;
  };

  const imagesIn = (root: Element) => {
    const imgs = qsa(root, 'img').map((i) => imgInfo(i as HTMLImageElement));
    const sources = qsa(root, 'picture source[srcset], video[poster]').map((s) => ({
      kind: s.tagName === 'VIDEO' ? ('video-poster' as const) : ('picture-source' as const),
      url: abs(s.getAttribute('poster') ?? s.getAttribute('srcset')?.split(',')[0].trim().split(/\s+/)[0]),
      alt: null,
    }));
    const svgs = qsa(root, 'svg')
      .filter((s) => !s.parentElement?.closest('svg'))
      .map((s) => ({
        kind: 'inline-svg' as const,
        url: null,
        markup: s.outerHTML,
        alt: s.getAttribute('aria-label') ?? (s.querySelector('title')?.textContent || null),
        ariaHidden: s.getAttribute('aria-hidden'),
      }));
    return [...imgs, ...sources, ...bgImages(root), ...svgs];
  };

  // ----- sections ----------------------------------------------------------
  const header = document.querySelector('header');
  let sectionParent: Element = header?.parentElement ?? document.body;
  const rawSections: Element[] = [];
  const collect = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      if (child.matches('script, style, noscript, template, link, meta')) continue;
      // Descend into wrappers that contain the header/footer instead of being them.
      if (!child.matches('header, footer') && child.querySelector(':scope header, :scope footer')) {
        collect(child);
        continue;
      }
      const hasText = !!norm(child.textContent);
      const hasMedia = !!child.querySelector('img, svg, picture, video, iframe') || bgImages(child).length > 0;
      if (hasText || hasMedia) rawSections.push(child);
    }
  };
  collect(sectionParent);

  const kindOf = (el: Element) => {
    const c = el.className?.toString() ?? '';
    if (el.matches('header') || /header/.test(c)) return 'header';
    if (el.matches('footer') || /footer/.test(c)) return 'footer';
    if (/hero|banner|slider/.test(c)) return 'hero';
    if (/breadcrumb/.test(c)) return 'breadcrumb';
    if (/preloader/.test(c)) return 'preloader';
    if (/progress-wrap|paginacontainer|scroll-top|back-to-top/.test(c)) return 'scroll-to-top';
    return 'content';
  };

  const FAQ_SEL = '[class*="accordion-item"], details, [class*="faq-item"]';
  const TEAM_SEL = '[class*="team-wrap"], [class*="team-item"], [class*="team-member"], [class*="team-card"]';
  const COUNTER_SEL = '[data-percentage], [data-count], [data-target], [data-to], [data-counter], .counter, .odometer, .count-up, .countup';
  const CARD_TOKEN = /(^|-)(card|wrap\d*|box\d*|item)$/;
  const CARD_EXCLUDE = /(progress-wrap|preloader|header-info|social-icon|sub-menu|nav-item|menu-item|accordion|counter-wrap|team-wrap|init-wrap|flex-wrap|text-nowrap|hero-slider$|slider-wrap|captcha|outer-box|inner-box|footer)/;

  const isTestimonial = (el: Element) =>
    /testimonial|review/.test(el.className.toString()) || !!el.querySelector('[class*="testimonial"], [class*="rating"], blockquote');

  const sections = rawSections.map((sec, index) => {
    const headings = qsa(sec, 'h1, h2, h3, h4, h5, h6').map((h) => ({ level: Number(h.tagName[1]), text: text(h) }));

    // Ordered content stream.
    const blocks: any[] = [];
    const BLOCK = 'h1, h2, h3, h4, h5, h6, p, ul, ol, table, blockquote, dl';
    const walker = document.createTreeWalker(sec, NodeFilter.SHOW_ELEMENT);
    const seenInBlock = new Set<Element>();
    const consumedInline = new Set<Element>();
    for (let n = walker.currentNode as Element | null; n; n = walker.nextNode() as Element | null) {
      const el = n;
      if (skipped(el) || el.closest('form, select')) continue;
      if (Array.from(seenInBlock).some((b) => b !== el && b.contains(el))) continue;
      const tag = el.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) {
        blocks.push({ type: 'heading', level: Number(tag[1]), text: text(el) });
        seenInBlock.add(el);
      } else if (tag === 'p') {
        blocks.push({ type: 'paragraph', text: text(el), html: el.innerHTML.trim() });
        seenInBlock.add(el);
      } else if (tag === 'ul' || tag === 'ol') {
        const items = (list: Element): any[] =>
          Array.from(list.children)
            .filter((li) => li.tagName === 'LI' && !skipped(li))
            .map((li) => {
              const nested = li.querySelector(':scope > ul, :scope > ol');
              const clone = li.cloneNode(true) as Element;
              clone.querySelectorAll(':scope > ul, :scope > ol').forEach((x) => x.remove());
              const a = li.querySelector(':scope > a, :scope > * > a') as HTMLAnchorElement | null;
              return {
                text: nested ? norm(clone.textContent) : text(li),
                href: a?.getAttribute('href') ?? null,
                ...(nested ? { children: items(nested) } : {}),
              };
            });
        blocks.push({ type: 'list', ordered: tag === 'ol', className: classes(el) || null, items: items(el) });
        seenInBlock.add(el);
      } else if (tag === 'table') {
        blocks.push({
          type: 'table',
          rows: Array.from((el as HTMLTableElement).rows).map((r) => Array.from(r.cells).map((c) => ({ header: c.tagName === 'TH', text: text(c) }))),
        });
        seenInBlock.add(el);
      } else if (tag === 'blockquote') {
        blocks.push({ type: 'blockquote', text: text(el) });
        seenInBlock.add(el);
      } else if (tag === 'dl') {
        blocks.push({ type: 'definition-list', items: qsa(el, 'dt').map((dt) => ({ term: text(dt), description: text(dt.nextElementSibling) })) });
        seenInBlock.add(el);
      } else if (!consumedInline.has(el) && !el.matches('a.optech-default-btn, a[class*="btn"], button, label, option, svg, svg *, i')) {
        const t = ownText(el);
        if (t && !el.closest(BLOCK)) {
          blocks.push({ type: 'text', tag, className: classes(el) || null, text: t });
          // Inline children were included in this text; don't emit them again.
          el.querySelectorAll('b, strong, i, em, span, small, a, u, sup, sub, mark').forEach((c) => {
            if (!c.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol, div, table')) consumedInline.add(c);
          });
        }
      }
    }

    const faqs = qsa(sec, FAQ_SEL)
      .filter((el) => !el.parentElement?.closest(FAQ_SEL))
      .map((item) => {
        const q = item.querySelector('[class*="header"], [class*="question"], summary, button, h1, h2, h3, h4, h5, h6');
        const a = item.querySelector('[class*="body"], [class*="answer"], [class*="content"], [class*="collapse"]');
        return { question: text(q) || norm(q?.textContent), answer: text(a) || norm(a?.textContent), answerHtml: a?.innerHTML.trim() ?? null };
      });

    const team = qsa(sec, TEAM_SEL)
      .filter((el) => !el.parentElement?.closest(TEAM_SEL))
      .map((m) => {
        const img = m.querySelector('img') as HTMLImageElement | null;
        const nameEl = m.querySelector('h1, h2, h3, h4, h5, h6');
        const roleEls = qsa(m, 'p, span[class*="role"], span[class*="designation"], [class*="designation"]').filter((e) => e !== nameEl);
        return {
          name: text(nameEl) || norm(nameEl?.textContent) || null,
          role: roleEls.map((e) => text(e) || norm(e.textContent)).filter(Boolean).join('\n') || null,
          photo: img ? { src: img.getAttribute('src'), url: abs(img.currentSrc || img.getAttribute('src')), alt: img.hasAttribute('alt') ? img.getAttribute('alt') : null } : null,
          links: qsa(m, 'a[href]').map((a) => linkInfo(a as HTMLAnchorElement)),
        };
      });

    const stats = qsa(sec, COUNTER_SEL).map((c) => {
      const holder =
        c.closest('[class*="counter-data"], [class*="counter-item"], [class*="counter-box"], [class*="stat"], [class*="funfact"]') ?? c.parentElement?.parentElement ?? c;
      const valueEl = c.parentElement && c.parentElement !== holder && norm(c.parentElement.textContent).length <= 20 ? c.parentElement : c;
      const value = norm(valueEl.textContent).replace(/\s+/g, '');
      const label = norm(
        Array.from(holder.querySelectorAll('*'))
          .filter((e) => !e.contains(valueEl) && !valueEl.contains(e) && e.children.length === 0)
          .map((e) => e.textContent)
          .join('\n'),
      );
      return {
        value,
        number: parseFloat(norm(c.textContent).replace(/[^\d.\-]/g, '')),
        target: c.getAttribute('data-percentage') ?? c.getAttribute('data-count') ?? c.getAttribute('data-target') ?? c.getAttribute('data-to') ?? null,
        label: label || null,
        icons: iconClasses(holder),
        images: qsa(holder, 'img').map((i) => imgInfo(i as HTMLImageElement)),
      };
    });

    const cardEls = qsa(sec, '[class]')
      .filter((el) => Array.from(el.classList).some((c) => CARD_TOKEN.test(c)) && !CARD_EXCLUDE.test(el.className.toString()))
      .filter((el) => !el.closest('form, nav, header, footer') || kindOf(sec) !== 'content')
      .filter((el) => !el.closest(FAQ_SEL) && !el.closest(TEAM_SEL))
      .filter((el) => !!el.querySelector('h1, h2, h3, h4, h5, h6, img, p'));
    const topCards = cardEls.filter((el) => !cardEls.some((o) => o !== el && o.contains(el)));
    const toCard = (card: Element) => ({
      className: classes(card),
      headings: qsa(card, 'h1, h2, h3, h4, h5, h6').map((h) => ({ level: Number(h.tagName[1]), text: text(h) })),
      paragraphs: qsa(card, 'p').map((p) => text(p)),
      listItems: qsa(card, 'li').map((li) => text(li)),
      images: qsa(card, 'img').map((i) => imgInfo(i as HTMLImageElement)),
      backgrounds: bgImages(card).map((b) => b.url),
      icons: iconClasses(card),
      links: qsa(card, 'a[href]').map((a) => linkInfo(a as HTMLAnchorElement)),
    });
    const testimonials = topCards.filter(isTestimonial).map((t) => {
      const name = t.querySelector('h1, h2, h3, h4, h5, h6, [class*="name"], cite');
      const quote = qsa(t, 'p, blockquote').filter((e) => e !== name);
      const role = t.querySelector('[class*="designation"], [class*="role"], [class*="position"], span:not([class*="icon"])');
      return {
        quote: quote.map((q) => text(q)).join('\n') || null,
        name: text(name) || null,
        role: role && role !== name ? text(role) || null : null,
        rating: t.querySelectorAll('[class*="rating"] i, [class*="rating"] svg, .fa-star, .ri-star-fill').length || null,
        photo: (() => {
          const img = t.querySelector('img') as HTMLImageElement | null;
          return img ? imgInfo(img) : null;
        })(),
      };
    });
    const cards = topCards.filter((c) => !isTestimonial(c)).map(toCard);

    const ctas = qsa(sec, 'a[class*="btn"], a[class*="button"], a[role="button"], button, input[type="submit"], input[type="button"]')
      .filter((el) => !el.closest('form'))
      // Slider dots/arrows are widget controls, not calls to action.
      .filter((el) => !el.closest('.slick-dots, .slick-arrow, .swiper-pagination, [class*="slider-nav"], [class*="-arrow"]') && el.getAttribute('role') !== 'tab')
      .map((el) =>
        el.tagName === 'A'
          ? { ...linkInfo(el as HTMLAnchorElement), element: 'a', className: classes(el) }
          : { label: text(el) || norm((el as HTMLInputElement).value) || norm(el.getAttribute('aria-label')), href: null, element: el.tagName.toLowerCase(), type: el.getAttribute('type'), onclick: el.getAttribute('onclick'), className: classes(el) },
      );

    return {
      index,
      kind: kindOf(sec),
      tag: sec.tagName.toLowerCase(),
      id: sec.id || null,
      className: classes(sec) || null,
      headings,
      blocks,
      cards,
      faqs,
      testimonials,
      team,
      stats,
      ctas,
      links: qsa(sec, 'a').map((a) => linkInfo(a as HTMLAnchorElement)),
      images: imagesIn(sec),
      icons: iconClasses(sec),
      iframes: qsa(sec, 'iframe').map((f) => ({ src: f.getAttribute('src'), title: f.getAttribute('title') })),
    };
  });

  // ----- forms -------------------------------------------------------------
  const labelFor = (field: Element): { label: string | null; source: string | null } => {
    const id = field.getAttribute('id');
    if (id) {
      const l = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (l && norm(l.textContent)) return { label: norm(l.textContent), source: 'label[for]' };
    }
    const wrap = field.closest('label');
    if (wrap) {
      const clone = wrap.cloneNode(true) as Element;
      clone.querySelectorAll('input, select, textarea').forEach((x) => x.remove());
      if (norm(clone.textContent)) return { label: norm(clone.textContent), source: 'wrapping label' };
    }
    // Theme markup: <div class="field"><label for="">Name</label><input></div>
    for (let p: Element | null = field.parentElement, depth = 0; p && depth < 3 && !p.matches('form'); p = p.parentElement, depth++) {
      const labels = Array.from(p.querySelectorAll('label')).filter((l) => !l.htmlFor || l.htmlFor === '' || l.htmlFor === id);
      const fields = p.querySelectorAll('input:not([type="hidden"]), select, textarea');
      if (labels.length === 1 && fields.length === 1 && norm(labels[0].textContent)) return { label: norm(labels[0].textContent), source: 'sibling label' };
    }
    const aria = field.getAttribute('aria-label');
    if (aria) return { label: norm(aria), source: 'aria-label' };
    const by = field.getAttribute('aria-labelledby');
    if (by) {
      const t = by.split(/\s+/).map((i) => norm(document.getElementById(i)?.textContent)).join(' ').trim();
      if (t) return { label: t, source: 'aria-labelledby' };
    }
    return { label: null, source: null };
  };
  const fieldInfo = (f: Element) => {
    const el = f as HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement;
    const tag = f.tagName.toLowerCase();
    const { label, source } = labelFor(f);
    return {
      label,
      labelSource: source,
      tag,
      type: tag === 'input' ? (f.getAttribute('type') ?? 'text') : tag,
      name: f.getAttribute('name'),
      id: f.getAttribute('id'),
      required: f.hasAttribute('required'),
      placeholder: f.getAttribute('placeholder'),
      defaultValue: tag === 'select' || tag === 'textarea' ? null : f.getAttribute('value'),
      maxlength: f.getAttribute('maxlength'),
      minlength: f.getAttribute('minlength'),
      pattern: f.getAttribute('pattern'),
      accept: f.getAttribute('accept'),
      multiple: f.hasAttribute('multiple'),
      autocomplete: f.getAttribute('autocomplete'),
      oninput: f.getAttribute('oninput'),
      options:
        tag === 'select'
          ? Array.from(el.options).map((o) => ({ value: o.getAttribute('value'), label: norm(o.textContent), selected: o.defaultSelected, disabled: o.disabled }))
          : f.matches('input[type="radio"], input[type="checkbox"]')
            ? [{ value: f.getAttribute('value'), checked: f.hasAttribute('checked') }]
            : null,
    };
  };
  const forms = Array.from(document.querySelectorAll('form')).map((form, index) => ({
    index,
    id: form.id || null,
    name: form.getAttribute('name'),
    action: form.getAttribute('action'),
    actionUrl: abs(form.getAttribute('action') ?? document.URL),
    method: (form.getAttribute('method') ?? 'get').toLowerCase(),
    enctype: form.getAttribute('enctype'),
    onsubmit: form.getAttribute('onsubmit'),
    sectionIndex: rawSections.findIndex((s) => s.contains(form)),
    headingsBefore: (() => {
      const sec = rawSections.find((s) => s.contains(form));
      return sec ? qsa(sec, 'h1, h2, h3, h4, h5, h6').filter((h) => h.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).map((h) => text(h)) : [];
    })(),
    fields: Array.from(form.querySelectorAll('input, select, textarea')).filter((f) => !f.matches('[type="submit"], [type="button"], [type="reset"], [type="image"]')).map(fieldInfo),
    buttons: Array.from(form.querySelectorAll('button, input[type="submit"], input[type="button"], input[type="reset"], input[type="image"]')).map((b) => ({
      label: norm(b.textContent) || b.getAttribute('value') || b.getAttribute('aria-label'),
      type: b.getAttribute('type') ?? (b.tagName === 'BUTTON' ? 'submit' : null),
      name: b.getAttribute('name'),
      id: b.getAttribute('id'),
      onclick: b.getAttribute('onclick'),
    })),
    // Non-field text inside the form (captcha prompts, notes, consent text).
    texts: Array.from(form.querySelectorAll('*'))
      .filter((e) => !e.matches('label, option, select, textarea, button, script, style') && ownText(e))
      .map((e) => ({ tag: e.tagName.toLowerCase(), className: classes(e) || null, text: ownText(e) })),
  }));
  const orphanFields = Array.from(document.querySelectorAll('input, select, textarea'))
    .filter((f) => !f.closest('form'))
    .map(fieldInfo);

  // ----- meta --------------------------------------------------------------
  const metaAll = Array.from(document.querySelectorAll('meta')).map((m) => ({
    name: m.getAttribute('name'),
    property: m.getAttribute('property'),
    httpEquiv: m.getAttribute('http-equiv'),
    charset: m.getAttribute('charset'),
    content: m.getAttribute('content'),
  }));
  const metaBy = (key: string) => {
    const m = document.querySelector(`meta[name="${key}"], meta[property="${key}"]`);
    return m ? m.getAttribute('content') : null;
  };
  const og: Record<string, string | null> = {};
  const twitter: Record<string, string | null> = {};
  for (const m of metaAll) {
    const k = m.property ?? m.name ?? '';
    if (k.startsWith('og:')) og[k] = m.content;
    if (k.startsWith('twitter:')) twitter[k] = m.content;
  }
  const meta = {
    title: document.querySelector('title') ? norm(document.querySelector('title')!.textContent) : null,
    description: metaBy('description'),
    keywords: metaBy('keywords'),
    author: metaBy('author'),
    robots: metaBy('robots'),
    viewport: metaBy('viewport'),
    themeColor: metaBy('theme-color'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
    lang: document.documentElement.getAttribute('lang'),
    og,
    twitter,
    icons: Array.from(document.querySelectorAll('link[rel*="icon"], link[rel="manifest"], link[rel="mask-icon"]')).map((l) => ({
      rel: l.getAttribute('rel'),
      href: l.getAttribute('href'),
      url: abs(l.getAttribute('href')),
      sizes: l.getAttribute('sizes'),
      type: l.getAttribute('type'),
    })),
    all: metaAll,
  };

  // HTML comments in <body>: often hold disabled content and placeholders worth auditing.
  const comments: string[] = [];
  const cw = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
  for (let c = cw.nextNode(); c; c = cw.nextNode()) {
    const t = norm(c.textContent);
    if (t.length >= 20 && /<|[a-z]{3,}\s+[a-z]{3,}/i.test(t)) comments.push(t.length > 1500 ? t.slice(0, 1500) + ' …[truncated]' : t);
  }

  return {
    finalUrl: location.href,
    meta,
    sections,
    forms,
    orphanFields,
    allLinks: Array.from(document.querySelectorAll('a')).filter((a) => !skipped(a)).map((a) => linkInfo(a as HTMLAnchorElement)),
    headImages: [
      ...meta.icons.filter((i) => i.url).map((i) => ({ kind: 'head-icon', url: i.url, alt: null })),
      ...Object.entries(og)
        .filter(([k, v]) => /^og:image(:url|:secure_url)?$/.test(k) && v)
        .map(([, v]) => ({ kind: 'og-image', url: abs(v), alt: og['og:image:alt'] ?? null })),
      ...Object.entries(twitter)
        .filter(([k, v]) => /^twitter:image$/.test(k) && v)
        .map(([, v]) => ({ kind: 'twitter-image', url: abs(v), alt: twitter['twitter:image:alt'] ?? null })),
    ],
    htmlComments: comments,
  };
}

type Extracted = ReturnType<typeof extractInPage>;

// ---------------------------------------------------------------------------
// Assets

const assetCache = new Map<string, Promise<{ ok: boolean; status: number | null; contentType: string | null; body: Buffer | null; error?: string }>>();

function fetchAsset(context: BrowserContext, url: string) {
  if (!assetCache.has(url)) {
    assetCache.set(
      url,
      (async () => {
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          try {
            const res = await context.request.get(url, { timeout: 30_000 });
            const body = res.ok() ? await res.body() : null;
            return { ok: res.ok(), status: res.status(), contentType: res.headers()['content-type'] ?? null, body };
          } catch (e) {
            if (attempt === MAX_ATTEMPTS) return { ok: false, status: null, contentType: null, body: null, error: String(e) };
          }
        }
        return { ok: false, status: null, contentType: null, body: null };
      })(),
    );
  }
  return assetCache.get(url)!;
}

interface AssetRecord {
  url: string;
  localPath: string | null;
  status: number | null;
  contentType: string | null;
  bytes: number | null;
  kinds: string[];
  alts: (string | null)[];
  error?: string;
}

async function downloadAssets(context: BrowserContext, slug: string, data: Extracted, networkImages: Set<string>) {
  const dir = path.join(ASSET_DIR, slug);
  await fs.mkdir(dir, { recursive: true });
  const records = new Map<string, AssetRecord>();
  const usedNames = new Map<string, string>(); // file name -> url
  const localPathFor = (url: string) => {
    let name = fileNameFor(url);
    const owner = usedNames.get(name.toLowerCase());
    if (owner && owner !== url) {
      // Same file name from a different folder: prefix with the parent folder to keep both.
      const parent = path.posix.basename(path.posix.dirname(new URL(url).pathname)) || 'root';
      name = `${parent}__${name}`;
      for (let i = 2; usedNames.has(name.toLowerCase()) && usedNames.get(name.toLowerCase()) !== url; i++) name = `${parent}__${i}__${fileNameFor(url)}`;
    }
    usedNames.set(name.toLowerCase(), url);
    return name;
  };

  const register = (url: string | null | undefined, kind: string, alt: string | null) => {
    if (!url || url.startsWith('data:')) return;
    const rec = records.get(url) ?? { url, localPath: null, status: null, contentType: null, bytes: null, kinds: [], alts: [] };
    if (!rec.kinds.includes(kind)) rec.kinds.push(kind);
    rec.alts.push(alt);
    records.set(url, rec);
  };

  for (const s of data.sections) for (const img of s.images) if ('url' in img) register(img.url, img.kind, img.alt ?? null);
  for (const h of data.headImages) register(h.url, h.kind, h.alt ?? null);
  for (const u of networkImages) register(u, 'network', null);

  await Promise.all(
    Array.from(records.values()).map(async (rec) => {
      const r = await fetchAsset(context, rec.url);
      rec.status = r.status;
      rec.contentType = r.contentType;
      if (r.error) rec.error = r.error;
      if (r.ok && r.body) {
        const name = localPathFor(rec.url);
        await fs.writeFile(path.join(dir, name), r.body);
        rec.localPath = path.posix.join('assets/original', slug, name);
        rec.bytes = r.body.length;
      }
    }),
  );

  // Inline SVGs have no original file name; number them in document order.
  let n = 0;
  for (const s of data.sections) {
    for (const img of s.images as any[]) {
      if (img.kind === 'inline-svg') {
        const name = `inline-svg-${String(++n).padStart(2, '0')}.svg`;
        await fs.writeFile(path.join(dir, name), img.markup);
        img.localPath = path.posix.join('assets/original', slug, name);
        delete img.markup;
      } else if (img.url && records.get(img.url)) {
        img.localPath = records.get(img.url)!.localPath;
      }
    }
    for (const m of s.team as any[]) if (m.photo?.url) m.photo.localPath = records.get(m.photo.url)?.localPath ?? null;
    for (const t of s.testimonials as any[]) if (t.photo?.url) t.photo.localPath = records.get(t.photo.url)?.localPath ?? null;
    for (const c of s.cards as any[]) for (const i of c.images) i.localPath = records.get(i.url)?.localPath ?? null;
  }

  return Array.from(records.values());
}

async function saveIconFonts(fontUrls: Set<string>, context: BrowserContext) {
  const dir = path.join(ASSET_DIR, '_icon-fonts');
  await fs.mkdir(dir, { recursive: true });
  const saved: string[] = [];
  for (const url of fontUrls) {
    const r = await fetchAsset(context, url);
    if (r.ok && r.body) {
      await fs.writeFile(path.join(dir, fileNameFor(url)), r.body);
      saved.push(url);
    }
  }
  return saved;
}

// ---------------------------------------------------------------------------
// Page capture

interface PageResult {
  url: string;
  slug: string;
  status: number | null;
  ok: boolean;
  error?: string;
  links: string[];
}

async function preparePage(page: Page, url: string) {
  const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  await slowScroll(page);
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  const counters = await waitForCounters(page);
  return { res, counters };
}

async function screenshot(page: Page, file: string) {
  // AOS fade-ins are already triggered by the scroll; pin them to their end state so the
  // full-page capture (taken from the top) shows every block, then return to the top.
  await page.addStyleTag({ content: '[data-aos]{opacity:1!important;transform:none!important;transition:none!important}' }).catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled', timeout: 90_000 });
}

async function capture(browser: Browser, url: string, fontUrls: Set<string>): Promise<PageResult> {
  const slug = slugFor(url);
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    // tsx/esbuild may emit __name() helpers inside functions passed to evaluate().
    await context.addInitScript({ content: 'window.__name = window.__name || function (f) { return f; };' });
    try {
      const page = await context.newPage();
      const networkImages = new Set<string>();
      page.on('response', (r) => {
        const u = r.url();
        const type = r.request().resourceType();
        let parsed: URL;
        try {
          parsed = new URL(u);
        } catch {
          return;
        }
        if (!isSameSite(parsed)) return; // ignore third-party iframes (maps tiles etc.)
        if (type === 'image' || IMAGE_EXT.test(parsed.pathname)) networkImages.add(u);
        if (type === 'font' && ICON_FONT.test(u)) fontUrls.add(u);
      });

      const { res, counters } = await preparePage(page, url);
      const status = res?.status() ?? null;
      if (status != null && status >= 500 && attempt < MAX_ATTEMPTS) {
        // Server errors may be transient; only accept one as the live state after retrying.
        throw new Error(`HTTP ${status}`);
      }
      const data = await page.evaluate(extractInPage);
      await screenshot(page, path.join(SHOT_DIR, `${slug}-1440.png`));

      const mobile = await context.newPage();
      await mobile.setViewportSize({ width: VIEWPORTS[1].width, height: VIEWPORTS[1].height });
      await preparePage(mobile, url);
      await screenshot(mobile, path.join(SHOT_DIR, `${slug}-390.png`));

      const assets = await downloadAssets(context, slug, data, networkImages);

      const out = {
        url,
        slug,
        finalUrl: data.finalUrl,
        httpStatus: status,
        capturedAt: new Date().toISOString(),
        counters,
        meta: data.meta,
        sections: data.sections,
        forms: data.forms,
        orphanFields: data.orphanFields,
        assets,
        htmlComments: data.htmlComments,
        screenshots: VIEWPORTS.map((v) => `docs/screenshots/${slug}-${v.name}.png`),
      };
      await fs.writeFile(path.join(CONTENT_DIR, `${slug}.json`), JSON.stringify(out, null, 2) + '\n');

      const links = data.allLinks.map((l) => l.url).filter((u): u is string => !!u);
      const wordCount = data.sections.flatMap((s) => s.blocks).reduce((n, b: any) => n + (b.text ? b.text.split(/\s+/).length : 0), 0);
      console.log(
        `  ✓ ${slug.padEnd(36)} HTTP ${status}  sections=${data.sections.length} words≈${wordCount} forms=${data.forms.length} assets=${assets.filter((a) => a.localPath).length}/${assets.length} counters=${counters.count}${counters.settled ? '' : ' (NOT settled)'}`,
      );
      await context.close();
      return { url, slug, status, ok: true, links };
    } catch (e) {
      lastError = e;
      console.warn(`  ! ${slug} attempt ${attempt} failed: ${(e as Error).message.split('\n')[0]}`);
      await context.close().catch(() => {});
      await new Promise((r) => setTimeout(r, attempt * 5_000));
    }
  }
  return { url, slug, status: null, ok: false, error: String(lastError), links: [] };
}

// ---------------------------------------------------------------------------
// Link checking (for the audit). Never requests form handler endpoints.

async function checkLinks(browser: Browser, urls: string[], known: Map<string, number | null>) {
  const context = await browser.newContext();
  const results: Record<string, { status: number | null; finalUrl?: string; error?: string; via: string }> = {};
  const queue = [...urls];
  const worker = async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      const pageKey = toPageUrl(url, ORIGIN);
      if (pageKey && known.has(pageKey)) {
        results[url] = { status: known.get(pageKey) ?? null, via: 'crawl' };
        continue;
      }
      const cached = assetCache.get(url);
      if (cached) {
        const r = await cached;
        results[url] = { status: r.status, via: 'asset-download', ...(r.error ? { error: r.error } : {}) };
        continue;
      }
      try {
        let res = await context.request.head(url, { timeout: 20_000, maxRedirects: 10 }).catch(() => null);
        if (!res || res.status() === 405 || res.status() === 403 || res.status() >= 500) res = await context.request.get(url, { timeout: 20_000, maxRedirects: 10 });
        results[url] = { status: res.status(), finalUrl: res.url(), via: 'request' };
      } catch (e) {
        results[url] = { status: null, error: (e as Error).message.split('\n')[0], via: 'request' };
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  await context.close();
  return results;
}

// ---------------------------------------------------------------------------

async function main() {
  await Promise.all([CONTENT_DIR, ASSET_DIR, SHOT_DIR].map((d) => fs.mkdir(d, { recursive: true })));
  const browser = await chromium.launch();
  const fontUrls = new Set<string>();

  // Optional: `tsx scripts/crawl.ts index.php team.php` captures only those pages (no link following).
  const only = process.argv.slice(2);
  const queue = (only.length ? only : SEEDS).map((p) => toPageUrl(p, ORIGIN + '/')!);
  const discoveredFrom = new Map<string, string[]>(queue.map((u) => [u, ['seed']]));
  const results = new Map<string, PageResult>();
  const allLinkUrls = new Set<string>();

  console.log(`Crawling ${ORIGIN} (${queue.length} seed pages)`);
  while (queue.length) {
    const url = queue.shift()!;
    if (results.has(url)) continue;
    const r = await capture(browser, url, fontUrls);
    results.set(url, r);
    for (const l of r.links) {
      allLinkUrls.add(l);
      const p = toPageUrl(l, url);
      if (!p) continue;
      discoveredFrom.set(p, [...new Set([...(discoveredFrom.get(p) ?? []), r.slug])]);
      if (!only.length && !results.has(p) && !queue.includes(p)) {
        console.log(`  + discovered ${p} (linked from ${r.slug})`);
        queue.push(p);
      }
    }
  }

  const iconFonts = await saveIconFonts(fontUrls, await browser.newContext());

  // Collect every image URL too, so the audit can flag broken images.
  for (const r of results.values()) {
    if (!r.ok) continue;
    const json = JSON.parse(await fs.readFile(path.join(CONTENT_DIR, `${r.slug}.json`), 'utf8'));
    for (const a of json.assets) allLinkUrls.add(a.url);
  }
  const known = new Map([...results.values()].map((r) => [r.url, r.status]));
  console.log(`Checking ${allLinkUrls.size} unique link/asset URLs…`);
  const linkStatus = await checkLinks(browser, [...allLinkUrls].sort(), known);
  await browser.close();

  const summary = {
    origin: ORIGIN,
    crawledAt: new Date().toISOString(),
    pages: [...results.values()].map((r) => ({
      url: r.url,
      slug: r.slug,
      httpStatus: r.status,
      captured: r.ok,
      seed: SEEDS.includes(new URL(r.url).pathname.slice(1)),
      linkedFrom: discoveredFrom.get(r.url) ?? [],
      ...(r.error ? { error: r.error } : {}),
    })),
    iconFonts: iconFonts.map((u) => ({ url: u, localPath: `assets/original/_icon-fonts/${fileNameFor(u)}` })),
    linkStatus,
  };
  await fs.writeFile(path.join(CONTENT_DIR, '_crawl.json'), JSON.stringify(summary, null, 2) + '\n');

  const failed = summary.pages.filter((p) => !p.captured);
  const non200 = summary.pages.filter((p) => p.captured && p.httpStatus !== 200);
  console.log(`\nDone: ${summary.pages.length} pages, ${failed.length} failed to capture.`);
  if (non200.length) console.log(`Captured but non-200 on the live site: ${non200.map((p) => `${p.slug} (${p.httpStatus})`).join(', ')}`);
  if (failed.length) {
    for (const f of failed) console.error(`  ✗ ${f.slug}: ${f.error}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
