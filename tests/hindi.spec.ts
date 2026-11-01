import { expect, test, type Page } from '@playwright/test';
import hiCommon from '../messages/hi/common.json';

/**
 * Phase 7 acceptance: every /hi/ page at 360 and 1440. lang="hi", no sideways overflow,
 * no clipped Devanagari, the right faces (Tiro Devanagari Hindi display, Poppins body,
 * Kalam script, Merriweather for Latin names marked lang="en"), headings split by words
 * only (never characters), and Latin digits.
 */
const ROUTES = ['', 'about/', 'about/vision-mission/', 'about/team/', 'about/milestones/', 'about/gallery/', 'loans/', 'loans/women-empowerment/', 'loans/micro-business/', 'loans/agriculture-livelihood/', 'loans/livestock/', 'membership/', 'contact/', 'careers/', 'hr-policy/', 'privacy-policy/'];

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);
}

for (const width of [360, 1440]) {
  for (const route of ROUTES) {
    test(`/hi/${route} at ${width}px: lang, no overflow, nothing clipped, fonts, Latin digits`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 768 ? 740 : 900 });
      await page.goto(`/hi/${route}`);
      await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
      await scrollThrough(page);

      expect(await page.evaluate(() => document.documentElement.scrollWidth), 'horizontal overflow').toBeLessThanOrEqual(width);

      // Devanagari text must not be cut off: every element that directly holds Devanagari
      // text fits inside the nearest ancestor (or itself) that hides overflow. Closed
      // accordion panels (inert) and screen-reader-only text are skipped; sections that
      // clip their decorations on purpose are fine as long as the text itself fits.
      const clipped = await page.evaluate(() => {
        const out: string[] = [];
        const hides = (cs: CSSStyleDeclaration) => ['hidden', 'clip'].includes(cs.overflowX) || ['hidden', 'clip'].includes(cs.overflowY);
        for (const el of Array.from(document.querySelectorAll<HTMLElement>('main *, header *, footer *'))) {
          const own = Array.from(el.childNodes).some((n) => n.nodeType === 3 && /[ऀ-ॿ]/.test(n.textContent ?? ''));
          if (!own || el.closest('.sr-only, [aria-hidden="true"], [inert], dialog:not([open])')) continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const cs = getComputedStyle(el);
          if (hides(cs) && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)) {
            out.push(`${el.tagName} clips its own text: "${(el.textContent ?? '').trim().slice(0, 40)}"`);
            continue;
          }
          // The nearest ancestor that clips (a scroll container ends the search: swipe rows
          // are reachable by scrolling, not cut off).
          let clip: HTMLElement | null = null;
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const pcs = getComputedStyle(p);
            if (['auto', 'scroll'].includes(pcs.overflowX) || ['auto', 'scroll'].includes(pcs.overflowY)) break;
            if (hides(pcs)) {
              clip = p;
              break;
            }
          }
          if (clip) {
            const c = clip.getBoundingClientRect();
            if (r.left < c.left - 1 || r.right > c.right + 1 || r.top < c.top - 1 || r.bottom > c.bottom + 1)
              out.push(`${el.tagName} "${(el.textContent ?? '').trim().slice(0, 40)}" cut by ${clip.tagName}.${String(clip.className).split(' ').slice(0, 2).join('.')}`);
          }
        }
        return out;
      });
      expect(clipped, 'clipped Devanagari').toEqual([]);

      const faces = await page.evaluate(() => {
        const ff = (el: Element | null) => (el ? getComputedStyle(el).fontFamily : '');
        return {
          h1: ff(document.querySelector('h1')),
          body: ff(document.body),
          lockup: ff(document.querySelector('#site-logo [lang="en"]')),
          script: ff(document.querySelector('main .font-script')),
        };
      });
      expect(faces.h1).toMatch(/^__Tiro_Devanagari_Hindi/);
      expect(faces.body).toMatch(/^__Poppins/);
      expect(faces.lockup).toMatch(/^__Merriweather/);
      if (faces.script) expect(faces.script).toMatch(/^__Kalam/);

      expect(await page.locator('body').innerText(), 'Devanagari digits').not.toMatch(/[०-९]/);
    });
  }
}

test('Hindi headings split by words, never characters', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/hi/about/');
  const heading = page.locator('#services h2');
  await heading.scrollIntoViewIfNeeded();
  // Mid-animation: SplitText has wrapped the heading's pieces.
  await page.waitForTimeout(120);
  const pieces = await heading.evaluate((h) =>
    Array.from(h.querySelectorAll('div, span'))
      .filter((el) => el.children.length === 0)
      .map((el) => el.textContent ?? ''),
  );
  for (const p of pieces) expect(p.trim().length === 0 || p.trim().length > 1 || /\s/.test(p), `split piece "${p}"`).toBe(true);
  // Every whole word of the heading survives as one piece.
  const words = (await heading.innerText()).split(/\s+/).filter(Boolean);
  if (pieces.length > 1) for (const w of words) expect(pieces.some((p) => p.includes(w)), w).toBe(true);
});

test('form validation messages are Hindi on /hi/ (drafts)', async ({ page }) => {
  await page.goto('/hi/contact/');
  await page.locator('form[data-hydrated]').waitFor();
  await page.locator('#contact-name').locator('xpath=ancestor::form').getByRole('button', { name: hiCommon.buttons.submit }).click();
  await expect(page.locator('#contact-name-error')).toHaveText(hiCommon.form.errors.required);
});
