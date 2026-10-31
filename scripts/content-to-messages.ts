/**
 * ONE-OFF generator: content/*.json (crawled) → messages/en/<page>.json.
 *
 *   pnpm exec tsx scripts/content-to-messages.ts [--force]
 *
 * After this has run, messages/ is the content source and is edited by hand. The script
 * refuses to overwrite existing page files unless --force is passed.
 *
 * Rules (CLAUDE.md, content rules):
 * - Text is copied verbatim. The only change is whitespace normalisation (runs of
 *   spaces/newlines → one space). Bold/strong emphasis is kept as <b>…</b> rich-text tags.
 * - Nothing is invented. Every value is located in the crawl by its heading, table label
 *   or position, and the script throws if anything expected is missing.
 * - Keys are stable and readable: camelCase from the content's own words.
 * - Hand-written UI strings (nav, buttons, form labels, errors, a11y, alt text) live in
 *   messages/en/common.json, which this script does not touch.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'messages', 'en');
const FORCE = process.argv.includes('--force');

// ---------------------------------------------------------------------------
// Crawl access

type Block = { type: string; level?: number; text?: string; html?: string; items?: { text: string; children?: { text: string }[] }[]; rows?: { header: boolean; text: string }[][] };
type Section = { index: number; kind: string; headings: { level: number; text: string }[]; blocks: Block[]; faqs: { question: string; answer: string }[]; team: { name: string; role: string }[]; testimonials: { quote: string; name: string }[]; stats: { value: string; label: string }[]; cards: { headings: { text: string }[]; paragraphs: string[] }[] };
type Page = { meta: { title: string | null }; sections: Section[] };

const pages = new Map<string, Page>();
function page(slug: string): Page {
  if (!pages.has(slug)) pages.set(slug, JSON.parse(fs.readFileSync(path.join(CONTENT, `${slug}.json`), 'utf8')));
  return pages.get(slug)!;
}

/** Whitespace normalisation: the only change allowed to crawled text. */
const ws = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

function must<T>(value: T | undefined | null, what: string): T {
  if (value === undefined || value === null || value === '') throw new Error(`Missing in crawl: ${what}`);
  return value;
}

/** The body section (not header/footer) that contains a heading with this exact text. */
function section(slug: string, heading: string): Section {
  return must(
    page(slug).sections.find((s) => (s.kind === 'content' || s.kind === 'hero') && s.headings.some((h) => ws(h.text) === heading)),
    `${slug}: section with heading "${heading}"`,
  );
}

function breadcrumbTitle(slug: string): string {
  const s = must(page(slug).sections.find((x) => x.kind === 'breadcrumb'), `${slug}: breadcrumb`);
  return ws(must(s.headings.find((h) => h.level === 1), `${slug}: h1`).text);
}

/** Blocks of a section, in order, with whitespace normalised. */
const blocks = (s: Section) => s.blocks.map((b) => ({ ...b, text: ws(b.text) }));

/** Paragraph HTML → message text, keeping <b>/<strong> as <b> rich-text tags. */
function rich(html: string | undefined, plain: string): string {
  if (!html || !/<(b|strong)\b/i.test(html)) return plain;
  const out = ws(
    html
      .replace(/<(b|strong)\b[^>]*>/gi, '<b>')
      .replace(/<\/(b|strong)>/gi, '</b>')
      .replace(/<(?!\/?b>)[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' '),
  )
    // Keep spaces outside the tag ("<b> Name </b> is" → "<b>Name</b> is").
    .replace(/<b>\s+/g, ' <b>')
    .replace(/\s+<\/b>/g, '</b> ')
    .replace(/\s+/g, ' ')
    .trim();
  if (out.replace(/<\/?b>/g, '') !== plain) throw new Error(`Rich text drifted from plain text:\n  ${out}\n  ${plain}`);
  return out;
}

// ---------------------------------------------------------------------------
// Keys

const STOP = new Set(['a', 'an', 'and', 'the', 'of', 'for', 'to', 'in', 'on', 'with', 'by', 'or', 'our', 'is', 'are', 'be', 'your', 'we', 'as', 'at', 'from', 'if', 'where', 'through']);

/** camelCase key from the first few meaningful words of a text. */
function keyOf(text: string, maxWords = 3): string {
  const words = text
    .replace(/^Q\d+\.\s*/, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/[’']/g, '')
    .split(/[^A-Za-z0-9]+/)
    .filter((w) => w && !/^\d+$/.test(w)) // keys must not start with a digit
    .map((w) => w.toLowerCase());
  const meaningful = words.filter((w) => !STOP.has(w));
  const picked = (meaningful.length ? meaningful : words).slice(0, maxWords);
  return picked.map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join('') || 'item';
}

/** Object with readable, unique keys, preserving order. */
function keyed<T>(items: T[], textOf: (item: T) => string, maxWords = 3): Record<string, T> {
  const out: Record<string, T> = {};
  for (const item of items) {
    let key = keyOf(textOf(item), maxWords);
    for (let n = 2; key in out; n++) key = `${keyOf(textOf(item), maxWords)}${n}`;
    out[key] = item;
  }
  return out;
}

const keyedStrings = (items: string[], maxWords = 3) => keyed(items, (s) => s, maxWords);

/**
 * Explicit keys for small fixed sets where word-derived keys read badly
 * (e.g. two FAQs both starting "How does the Foundation…"). Throws if the crawl's
 * item count differs, so a content change can't silently shift keys.
 */
function named<T>(items: T[], keys: string[], what: string): Record<string, T> {
  if (items.length !== keys.length) throw new Error(`${what}: expected ${keys.length} items, crawl has ${items.length}`);
  return Object.fromEntries(items.map((item, i) => [keys[i], item]));
}

/** Splits a table cell ("a\nb\nc") into its lines. */
const lines = (cell: string) => cell.split('\n').map(ws).filter(Boolean);

function table(s: Section) {
  const t = must(s.blocks.find((b) => b.type === 'table'), 'table');
  return t.rows!.map((r) => {
    const [label, value] = r;
    if (!label?.header || !value) throw new Error(`Unexpected table row: ${JSON.stringify(r)}`);
    return { label: ws(label.text), raw: value.text };
  });
}

function row(rows: ReturnType<typeof table>, label: string) {
  return must(rows.find((r) => r.label.replace(/\s*:\s*$/, '') === label), `table row "${label}"`);
}

// ---------------------------------------------------------------------------
// Pages

function home() {
  const hero = must(page('index').sections.find((s) => s.kind === 'hero'), 'index hero');
  const h = hero.headings.map((x) => ws(x.text));
  const services = section('index', 'Our Services for Financial Inclusion and Community Empowerment');
  const testimonials = section('index', 'What Our Members Say');
  const process = section('index', 'Our Process for Empowering Communities Through Financial Inclusion');
  const faq = section('index', 'Frequently Asked Questions');
  const stats = must(page('index').sections.find((s) => s.stats.length), 'index stats');
  const testimonialsLead = must(blocks(testimonials).find((b) => b.type === 'paragraph'), 'testimonials lead').text;

  return {
    meta: { title: ws(page('index').meta.title) },
    // Slide 1 of the old hero carousel.
    hero: { eyebrow: h[0], title: h[1] },
    // Slide 2 becomes the About section's eyebrow + heading (site-plan, Home §3).
    aboutIntro: { eyebrow: h[2], title: h[3] },
    stats: named(
      stats.stats.map((s) => ({ value: ws(s.value), label: ws(s.label) })),
      ['women', 'literacy', 'trust'],
      'stats',
    ),
    services: {
      heading: services.headings[0] && ws(services.headings[0].text),
      items: keyed(
        services.cards.map((c) => ({ title: ws(c.headings[0].text), text: ws(c.paragraphs[0]) })),
        (c) => c.title,
        2,
      ),
    },
    testimonials: {
      heading: 'What Our Members Say',
      lead: testimonialsLead,
      items: keyed(
        testimonials.testimonials.map((t) => ({ quote: ws(t.quote), name: ws(t.name) })),
        (t) => t.name,
        2,
      ),
    },
    process: {
      heading: 'Our Process for Empowering Communities Through Financial Inclusion',
      steps: named(
        process.cards.map((c) => ({ title: ws(c.headings[0].text), text: ws(c.paragraphs[0]) })),
        ['registration', 'support', 'monitoring'],
        'process steps',
      ),
    },
    faq: {
      heading: 'Frequently Asked Questions',
      items: named(
        faq.faqs.map((f) => ({ question: ws(f.question), answer: ws(f.answer) })),
        ['services', 'whoCanBenefit', 'financialInclusion', 'documents', 'entrepreneurship', 'membership'],
        'faqs',
      ),
    },
  };
}

function about() {
  const foundation = section('about-us', 'About the Foundation');
  const paras = blocks(foundation).filter((b) => b.type === 'paragraph');
  const why = section('about-us', 'Why Choose Shree Shyam Small Growth Foundation ?');
  return {
    meta: { title: ws(page('about-us').meta.title) },
    title: breadcrumbTitle('about-us'),
    // Shared with Home §3 (site-plan: one data source for repeated sections).
    foundation: {
      heading: 'About the Foundation',
      body1: rich(paras[0]?.html, must(paras[0]?.text, 'about p1')),
      body2: rich(paras[1]?.html, must(paras[1]?.text, 'about p2')),
    },
    whyChoose: {
      heading: 'Why Choose Shree Shyam Small Growth Foundation ?',
      items: keyed(
        why.cards.map((c) => ({ title: ws(c.headings[0].text), text: ws(c.paragraphs[0]) })),
        (c) => c.title,
        2,
      ),
    },
  };
}

function team() {
  const s = section('index', 'Our team Members');
  return {
    heading: 'Our team Members',
    // Crawled order is kept (site-plan, Team).
    members: keyed(
      s.team.map((m) => ({ name: ws(m.name), role: ws(m.role) })),
      (m) => m.name,
      2,
    ),
  };
}

function mission() {
  const s = section('our-mission', 'Our Mission');
  const b = blocks(s);
  const lists = b.filter((x) => x.type === 'list');
  return {
    meta: { title: ws(page('our-mission').meta.title) },
    title: breadcrumbTitle('our-mission'),
    heading: 'Our Mission',
    intro: must(b.find((x) => x.type === 'paragraph'), 'mission intro').text,
    goals: {
      heading: 'Our mission is to:',
      items: keyedStrings(must(lists[0], 'mission list').items!.map((i) => ws(i.text)), 3),
    },
    coreValues: {
      heading: 'Our Core Values',
      items: named(
        must(lists[1], 'core values list').items!.map((i) => ws(i.text)),
        ['integrity', 'trust', 'empowerment', 'innovation', 'respect', 'socialResponsibility'],
        'core values',
      ),
    },
  };
}

function vision() {
  const s = section('our-vision', 'Our Vision');
  const paras = blocks(s).filter((x) => x.type === 'paragraph');
  return {
    meta: { title: ws(page('our-vision').meta.title) },
    title: breadcrumbTitle('our-vision'),
    heading: 'Our Vision',
    statement: must(paras[0], 'vision p1').text,
    body: must(paras[1], 'vision p2').text,
  };
}

function milestones() {
  const s = section('milestone', 'A Proud Milestone, A Greater Responsibility');
  const paras = blocks(s).filter((x) => x.type === 'paragraph');
  return {
    meta: { title: ws(page('milestone').meta.title) },
    title: breadcrumbTitle('milestone'),
    // Shared with Home §7.
    award: {
      heading: 'A Proud Milestone, A Greater Responsibility',
      body1: rich(paras[0]?.html, must(paras[0]?.text, 'award p1')),
      body2: rich(paras[1]?.html, must(paras[1]?.text, 'award p2')),
    },
  };
}

const LOANS = [
  { id: 'womenEmpowerment', slug: 'women-empowerment-loan' },
  { id: 'microBusiness', slug: 'micro-business-loan' },
  { id: 'agricultureLivelihood', slug: 'agriculture-rural-livelihood-loan' },
  { id: 'livestock', slug: 'livestock-loan' },
] as const;

/** Single-value rows become facts; multi-line rows become labelled lists. */
const FACT_ROWS: Record<string, string> = { Purpose: 'purpose', 'Loan Amount': 'amount', Tenure: 'tenure' };
const LIST_KEYS: Record<string, string> = {
  'Key Features': 'keyFeatures',
  'Suitable For': 'suitableFor',
  Uses: 'uses',
  Benefits: 'benefits',
  'Common Features': 'commonFeatures',
  'Basic Eligibility': 'eligibility',
  'Required Documents': 'documents',
};

function loans() {
  const products: Record<string, unknown> = {};
  for (const { id, slug } of LOANS) {
    const name = breadcrumbTitle(slug);
    const s = section(slug, name);
    const intro = blocks(s).find((b) => b.type === 'paragraph')?.text;
    const facts: Record<string, { label: string; value: string }> = {};
    const lists: Record<string, { label: string; items: Record<string, string> }> = {};
    for (const r of table(s)) {
      const bare = r.label.replace(/\s*:\s*$/, '');
      if (FACT_ROWS[bare]) facts[FACT_ROWS[bare]] = { label: r.label, value: ws(r.raw) };
      else if (LIST_KEYS[bare]) lists[LIST_KEYS[bare]] = { label: r.label, items: keyedStrings(lines(r.raw), 3) };
      else throw new Error(`${slug}: unmapped table row "${r.label}"`);
    }
    products[id] = {
      meta: { title: ws(page(slug).meta.title) },
      name,
      ...(intro ? { intro } : {}),
      facts,
      lists,
    };
  }
  return { products };
}

function howToJoin() {
  const s = section('registration-process', 'Membership Registration');
  const rows = table(s);
  return {
    meta: { title: ws(page('registration-process').meta.title) },
    title: breadcrumbTitle('registration-process'),
    heading: 'Membership Registration',
    eyebrow: 'Join Our Mission',
    intro: must(blocks(s).find((b) => b.type === 'paragraph'), 'join intro').text,
    benefits: { label: row(rows, 'Membership Benefits').label, items: keyedStrings(lines(row(rows, 'Membership Benefits').raw), 3) },
    eligibility: { label: row(rows, 'Membership Eligibility').label, items: keyedStrings(lines(row(rows, 'Membership Eligibility').raw), 3) },
  };
}

function simpleFormPage(slug: string, heading: string) {
  section(slug, heading);
  return { meta: { title: ws(page(slug).meta.title) }, title: breadcrumbTitle(slug), heading };
}

function contact() {
  const s = section('contact-us', 'Get in Touch');
  const b = blocks(s);
  const paras = b.filter((x) => x.type === 'paragraph');
  return {
    meta: { title: ws(page('contact-us').meta.title) },
    title: breadcrumbTitle('contact-us'),
    heading: 'Get in Touch',
    intro: must(paras[0], 'contact intro').text,
    registeredOffice: 'Registered Office',
    officeTime: 'Office Time',
    // The crawled hours ("Monday – Saturday || 10:00 AM – 6:00 PM") are superseded by the
    // client-confirmed hours in src/data/site.ts + common.contact.hours.
    form: {
      heading: 'Send Us a Message',
      intro: must(paras.find((p) => p.text.startsWith('Have questions')), 'contact form intro').text,
    },
  };
}

function hrPolicy() {
  const s = section('our-policy', 'Human Resource Policy');
  const b = blocks(s);
  const out: Record<string, unknown> = {
    meta: { title: ws(page('our-policy').meta.title) },
    title: breadcrumbTitle('our-policy'),
    heading: 'Human Resource Policy',
    lead: '',
    sections: {} as Record<string, Record<string, unknown>>,
    contact: {} as Record<string, unknown>,
  };
  const sections = out.sections as Record<string, Record<string, unknown>>;
  let current: Record<string, unknown> | null = null;
  let p = 0;
  let l = 0;
  let inContact = false;
  const contact = out.contact as Record<string, unknown>;

  for (const block of b) {
    if (block.type === 'heading' && block.level === 2) continue;
    if (block.type === 'heading' && /^\d+\./.test(block.text)) {
      // "1. Introduction" → sections.introduction (the number is kept in the heading text).
      let key = keyOf(block.text, 2);
      while (key in sections) key += '2';
      current = { heading: block.text };
      sections[key] = current;
      p = 0;
      l = 0;
      continue;
    }
    if (block.type === 'heading' && block.text === 'Contact Details') {
      inContact = true;
      contact.heading = block.text;
      continue;
    }
    if (inContact) {
      if (block.type === 'paragraph') contact.organisation = block.text;
      else if (block.type === 'list') {
        // "Managing Director: Saurav Prakash", then "Directors:" followed by one name per
        // line (<br>-separated in the old markup, so split on the raw line breaks).
        for (const item of block.items!) {
          const [first, ...rest] = item.text.split('\n').map(ws).filter(Boolean);
          if (/^Directors:?$/.test(first)) contact.directors = { label: first, names: keyedStrings(rest, 2) };
          else if (/^Managing Director:/.test(first) && !rest.length) contact.managingDirector = first;
          else throw new Error(`hr-policy contact: unexpected item "${item.text}"`);
        }
      } else if (block.type === 'heading') contact.addressHeading = block.text;
      else if (block.type === 'text') contact.address = block.text;
      continue;
    }
    if (!current) {
      if (block.type === 'paragraph') out.lead = block.text;
      else if (block.type === 'text' && block.text) contact.address = block.text;
      continue;
    }
    if (block.type === 'paragraph') current[`p${++p}`] = block.text;
    else if (block.type === 'list') current[`list${++l}`] = keyedStrings(block.items!.map((i) => ws(i.text)), 3);
    else if (block.type === 'text' && block.text) {
      // The office address sits in a div before "Contact Details" in the old markup.
      contact.address = block.text;
    } else throw new Error(`hr-policy: unexpected block ${JSON.stringify(block).slice(0, 120)}`);
  }
  must(out.lead, 'hr lead');
  must(contact.address, 'hr contact address');
  return out;
}

function privacy() {
  const s = section('privacy-policy', 'Shree Shyam Small Growth Foundation');
  const rows = table(s);
  return {
    meta: { title: ws(page('privacy-policy').meta.title) },
    title: breadcrumbTitle('privacy-policy'),
    heading: 'Shree Shyam Small Growth Foundation',
    intro: must(blocks(s).find((b) => b.type === 'paragraph'), 'privacy intro').text,
    // Each old table row becomes a section; its lines are kept in order (l1, l2, …).
    sections: named(
      rows.map((r) => ({
        heading: r.label,
        ...Object.fromEntries(lines(r.raw).map((line, i) => [`l${i + 1}`, line])),
      })),
      [
        'informationWeCollect',
        'howWeUse',
        'informationSharing',
        'dataSecurity',
        'cookies',
        'yourRights',
        'thirdPartyServices',
        'childrensPrivacy',
        'policyChanges',
        'contactUs',
      ],
      'privacy sections',
    ),
  };
}

// ---------------------------------------------------------------------------

const OUTPUTS: Record<string, () => unknown> = {
  home,
  about,
  team,
  mission,
  vision,
  milestones,
  loans,
  howToJoin,
  register: () => simpleFormPage('registration', 'Register Now !!'),
  careers: () => simpleFormPage('career', 'Apply For Jobs !!'),
  contact,
  hrPolicy,
  privacy,
};

fs.mkdirSync(OUT, { recursive: true });
let written = 0;
for (const [name, build] of Object.entries(OUTPUTS)) {
  const file = path.join(OUT, `${name}.json`);
  if (fs.existsSync(file) && !FORCE) {
    console.log(`  - ${name}.json exists, skipped (messages/ is now the source; use --force to regenerate)`);
    continue;
  }
  fs.writeFileSync(file, JSON.stringify(build(), null, 2) + '\n');
  written++;
  console.log(`  ✓ messages/en/${name}.json`);
}
console.log(`${written} file(s) written.`);
