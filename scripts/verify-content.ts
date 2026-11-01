/**
 * Phase 1 acceptance: every crawled text string must appear in messages/en.
 *
 *   pnpm exec tsx scripts/verify-content.ts
 *
 * Checks
 *   1. Coverage: each string crawled from the live site (content/*.json) appears verbatim
 *      (whitespace-normalised, <b> tags ignored) as a message in messages/en, or as a
 *      value in src/data/site.ts. Strings deliberately not carried over are listed in
 *      EXCLUDED with a reason, and every exclusion must still match a crawled string.
 *   2. ICU: every message formats without error.
 *   3. Keys: every message key referenced by the src/data adapters exists.
 *
 * Writes docs/content-verification.md and exits 1 on any failure.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createTranslator } from 'next-intl';
import * as data from '../src/data';

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const MESSAGES = path.join(ROOT, 'messages', 'en');
const REPORT = path.join(ROOT, 'docs', 'content-verification.md');

const ws = (s: string) => s.replace(/\s+/g, ' ').trim();
/** Rich-text tags allowed in messages: <b> (the old site's bold) and <accent> (Kalam accent word). */
const RICH_TAGS = ['b', 'accent'];
const plain = (s: string) => ws(s.replace(/<\/?(b|accent)>/g, ''));

/**
 * Crawled strings intentionally not in messages/en. Each needs a reason a reviewer can
 * check against CLAUDE.md / docs. Matched against the whitespace-normalised crawl text.
 */
const EXCLUDED: { text: string | RegExp; reason: string }[] = [
  // Widget chrome from the old theme, not content. Rules are checked in order, so the
  // captcha digits are matched before the generic numeral rule.
  { text: /^Captcha:-$|^98 \+ 0$|^\+$|^0$|^98$/, reason: 'Old math captcha. The new forms use a honeypot (site-plan, Forms).' },
  { text: /^[1-7]$/, reason: 'Slider dot numbers (testimonials 1–4, team 1–7); the new components render their own controls.' },
  { text: /^0[1-3]$/, reason: 'Process step numerals 01–03; ProcessStep renders the numeral from the step order.' },
  { text: '×', reason: 'Close icon glyph of the old mobile menu.' },
  // Superseded by client-confirmed facts (CLAUDE.md, content rule 4).
  { text: 'Monday – Saturday || 10:00 AM – 6:00 PM', reason: 'Contact-page office hours, superseded by the confirmed 9:00 AM – 9:00 PM (common.contact.hours).' },
  // Old nav label replaced by the site-plan navigation.
  { text: 'Products', reason: 'Old menu label; site-plan names the menu "Loans" (common.nav.loans).' },
  // Old form fields the new forms must never collect (CLAUDE.md, content rule 7).
  { text: /^(Aadhar No|PAN No|Upload Resume|Candidate Image)$/, reason: 'ID number or upload field; forms never collect these (content rule 7).' },
  // Old fields dropped by the shorter forms in site-plan.md (Forms).
  { text: /^(Father\/ Husband Name|Annual Income|DOB|Gender|PinCode)$/, reason: 'Old Register field not in the new 3-step form (site-plan, Forms).' },
  { text: /^-- select --$|^Male$|^Female$|^Others$/, reason: 'Options of the removed Gender field (site-plan, Forms).' },
  { text: /^Enter (Aadhar|PAN) No$|^Enter (Father\/ Husband Name|Annual Income|Pincode|Address|State|District|Name|Email Id|Phone No)$|^Full Name$|^Mobile Number$|^Email Address$|^Write Your Message$|^Captcha Value$|^What's Position Are You Apply For$/, reason: 'Old placeholder text. The new forms use visible labels, never placeholder-only (design-system, Form fields).' },
];

/**
 * Copy fixes applied to messages/en and confirmed by the client (docs/client-requests.md,
 * "Confirmed by client (31 Oct 2026)"). For a crawled string matching `from`, the fixed
 * text `to(text)` must be present in the messages. When `keys` is given, each of those
 * message keys must hold one of the fixed texts. That catches a fix that only exists
 * elsewhere by coincidence (e.g. "Contact Us" is also a nav label). To revert a fix,
 * restore the crawled text and delete its entry.
 */
const APPLIED: { id: string; from: RegExp; to: (crawled: string) => string; note: string; keys?: string[] }[] = [
  {
    id: 'A1',
    from: /^Q[1-6]\. /,
    to: (t) => t.replace(/^Q[1-6]\. /, ''),
    note: 'FAQ question numbering removed.',
  },
  {
    id: 'A2',
    from: / !!$/,
    to: (t) => t.replace(/ !!$/, ''),
    note: '"!!" removed from headings.',
  },
  {
    id: 'A3',
    from: /^(EmailId|Mobile No)$/,
    to: (t) => ({ EmailId: 'Email', 'Mobile No': 'Mobile number' })[t]!,
    note: 'Old form labels replaced.',
  },
  {
    id: 'A4',
    from: /Shree Shyam MicroFinance|Shree Shyam-Baba Micro Growth Foundation/,
    to: (t) => t.replace(/Shree Shyam MicroFinance|Shree Shyam-Baba Micro Growth Foundation/g, 'Shree Shyam Small Growth Foundation'),
    note: 'Organisation name standardised (client review 1, items 1–2).',
  },
  // Client review 1 (docs/client-review-1.md), answered "Yes" on 31 Oct 2026.
  {
    id: 'CR1-3',
    from: /^Vikram Sinha$/,
    to: () => 'Vikram Kumar Sinha',
    note: 'Item 3: Vikram Kumar Sinha in both places.',
    keys: ['team.members.vikramSinha.name'],
  },
  {
    id: 'CR1-4/5',
    from: /^(Sumit kumar|Satyam pushkar|Shishir kumar)$/,
    to: (t) => t.replace(/ ([a-z])/, (_, c: string) => ` ${c.toUpperCase()}`),
    note: 'Items 4–5: capital letters in team names.',
    keys: ['team.members.sumitKumar.name', 'team.members.satyamPushkar.name', 'team.members.shishirKumar.name'],
  },
  {
    id: 'CR1-7',
    from: /^Office Address: Near Chini Mill Road, In Front of Pani Tanki, /,
    to: (t) => t.replace('Near Chini Mill Road, In Front of Pani Tanki, ', ''),
    note: 'Item 7: privacy-policy address matches the address used everywhere else.',
    keys: ['privacy.sections.contactUs.l3'],
  },
  {
    id: 'CR1-8',
    from: /^0 to 12 Months$/,
    to: () => 'Up to 12 Months',
    note: 'Item 8: Micro Business Loan tenure.',
    keys: ['loans.products.microBusiness.facts.tenure.value'],
  },
  {
    id: 'CR1-9',
    from: /probation for 0-3 months,/,
    to: (t) => t.replace('probation for 0-3 months,', 'probation for up to 3 months,'),
    note: 'Item 9: HR probation period.',
    keys: ['hrPolicy.sections.probation.p1'],
  },
  {
    id: 'CR1-11',
    from: /opportunities\.\.$/,
    to: (t) => t.replace(/\.\.$/, '.'),
    note: 'Item 11: double full stop on the contact page.',
    keys: ['contact.intro'],
  },
  {
    id: 'CR1-12',
    from: /^Why Choose Shree Shyam Small Growth Foundation \?$/,
    to: () => 'Why Choose Shree Shyam Small Growth Foundation?',
    note: 'Item 12: space before "?".',
    keys: ['about.whyChoose.heading'],
  },
  {
    id: 'CR1-13',
    from: /^Copyright © 2026 Shree Shyam Small Growth Foundation \.$/,
    to: () => 'Copyright © {year} Shree Shyam Small Growth Foundation.',
    note: 'Item 13: no space before the full stop; the year comes from the build date.',
    keys: ['common.footer.copyright'],
  },
  {
    id: 'CR1-14',
    from: /^Integrity- /,
    to: (t) => t.replace(/^Integrity- /, 'Integrity – '),
    note: 'Item 14: same dash as the other core values.',
    keys: ['mission.coreValues.items.integrity'],
  },
  {
    id: 'CR1-15',
    from: /^Contact us$/,
    to: () => 'Contact Us',
    note: 'Item 15: contact page title capitalisation.',
    keys: ['contact.title'],
  },
  {
    id: 'CR1-16',
    from: /^Agriculture Livelihood Loan$/,
    to: () => 'Agriculture & Rural Livelihood Loan',
    note: 'Item 16: menu uses the loan page name.',
    keys: ['common.nav.loanProducts.agricultureLivelihood'],
  },
  {
    id: 'CR01-1',
    from: /^Membership (Benefits|Eligibility):$/,
    to: (t) => t.replace(/:$/, ''),
    note: 'Membership page list labels shown without the trailing colon, like the loan labels (P4-1). Reversible; for client review 2.',
    keys: ['howToJoin.benefits.label', 'howToJoin.eligibility.label'],
  },
  {
    id: 'P4-1',
    from: /^(Suitable For|Uses|Benefits|Common Features|Basic Eligibility|Required Documents)\s*:$/,
    to: (t) => t.replace(/\s*:$/, ''),
    note: 'Phase 4 default (approved, reversible; for client review 2): no trailing colon on loan-table labels used as headings.',
    keys: [
      'loans.products.microBusiness.lists.suitableFor.label',
      'loans.products.agricultureLivelihood.lists.uses.label',
      'loans.products.livestock.lists.benefits.label',
      'loans.products.livestock.lists.commonFeatures.label',
      'loans.products.livestock.lists.eligibility.label',
      'loans.products.livestock.lists.documents.label',
    ],
  },
];

// ---------------------------------------------------------------------------
// 1. Crawled strings

interface Crawled {
  text: string;
  where: Set<string>;
}

function collectCrawled(): Map<string, Crawled> {
  const out = new Map<string, Crawled>();
  // Line breaks separate items only inside table cells, list items, link text and form text;
  // elsewhere (e.g. "Financial Inclusion<br>Services") they are part of one string.
  const add = (raw: string | null | undefined, where: string, split = false) => {
    if (!raw) return;
    for (const line of split ? raw.split('\n') : [raw]) {
      const t = ws(line);
      if (!t || /^[\s\p{P}]*$/u.test(t)) continue;
      const e = out.get(t) ?? { text: t, where: new Set() };
      e.where.add(where);
      out.set(t, e);
    }
  };

  for (const file of fs.readdirSync(CONTENT).filter((f) => f.endsWith('.json') && !f.startsWith('_'))) {
    const page = JSON.parse(fs.readFileSync(path.join(CONTENT, file), 'utf8'));
    if (page.httpStatus !== 200) continue;
    const slug = file.replace('.json', '');
    add(page.meta.title, `${slug} <title>`);
    for (const s of page.sections) {
      if (s.kind === 'scroll-to-top' || s.kind === 'preloader') continue;
      const where = `${slug} ${s.kind}`;
      for (const b of s.blocks) {
        if (b.text) add(b.text, where);
        for (const i of b.items ?? []) {
          add(i.text, where, true);
          for (const c of i.children ?? []) add(c.text, where, true);
        }
        for (const r of b.rows ?? []) for (const c of r) add(c.text, where, true);
      }
      for (const f of s.faqs) (add(f.question, where), add(f.answer, where));
      for (const m of s.team) (add(m.name, where), add(m.role, where));
      for (const t of s.testimonials) (add(t.quote, where), add(t.name, where));
      for (const st of s.stats) (add(st.value, where), add(st.label, where));
      for (const c of s.cards) {
        for (const h of c.headings) add(h.text, where);
        for (const p of c.paragraphs) add(p, where);
      }
      for (const c of s.ctas) add(c.label, where);
      // Team-card links wrap the name and role: "Name\nRole".
      for (const l of s.links) if (l.hasVisibleText) add(l.label, where, true);
      for (const img of s.images) if (img.alt) add(img.alt, where);
    }
    for (const f of page.forms) {
      const where = `${slug} form`;
      for (const fld of f.fields) {
        add(fld.label, where);
        add(fld.placeholder, where);
        for (const o of fld.options ?? []) add(o.label, where);
      }
      for (const b of f.buttons) add(b.label, where);
      for (const t of f.texts) add(t.text, where, true);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Messages

type Tree = { [k: string]: string | Tree };

function loadMessages(): Tree {
  const tree: Tree = {};
  for (const f of fs.readdirSync(MESSAGES).filter((f) => f.endsWith('.json'))) {
    tree[f.replace('.json', '')] = JSON.parse(fs.readFileSync(path.join(MESSAGES, f), 'utf8'));
  }
  return tree;
}

function leaves(tree: Tree, prefix = ''): [string, string][] {
  return Object.entries(tree).flatMap(([k, v]) =>
    typeof v === 'string' ? ([[prefix + k, v]] as [string, string][]) : leaves(v, `${prefix}${k}.`),
  );
}

function getKey(tree: Tree, key: string): string | undefined {
  let node: Tree | string | undefined = tree;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

const hasKey = (tree: Tree, key: string) => getKey(tree, key) !== undefined;

/** All string values in an object graph (for src/data/site.ts). */
function strings(v: unknown): string[] {
  if (typeof v === 'string') return [v];
  if (Array.isArray(v)) return v.flatMap(strings);
  if (v && typeof v === 'object') return Object.values(v).flatMap(strings);
  return [];
}

/** Every `…Key` / `…Keys` string referenced by the data adapters. */
function adapterKeys(v: unknown, owner = ''): string[] {
  if (Array.isArray(v)) return v.flatMap((x) => adapterKeys(x, owner));
  if (!v || typeof v !== 'object') return [];
  return Object.entries(v).flatMap(([k, val]) => {
    if (/Keys?$/.test(k) && typeof val === 'string') return [val];
    if (/Keys$/.test(k) && Array.isArray(val)) return val.filter((x): x is string => typeof x === 'string');
    return adapterKeys(val, k);
  });
}

// ---------------------------------------------------------------------------

function main() {
  const crawled = collectCrawled();
  const messages = loadMessages();
  const msgLeaves = leaves(messages).filter(([k]) => !k.split('.').some((p) => p.startsWith('_')));
  const haystack = new Set([...msgLeaves.map(([, v]) => plain(v)), ...strings(data.site).map(ws)]);

  const found: Crawled[] = [];
  const fixed: (Crawled & { id: string; now: string })[] = [];
  const excluded: (Crawled & { reason: string })[] = [];
  const missing: Crawled[] = [];
  const usedExclusions = new Set<number>();
  const usedFixes = new Set<string>();

  for (const c of crawled.values()) {
    if (haystack.has(c.text)) {
      found.push(c);
      continue;
    }
    const fix = APPLIED.find((f) => f.from.test(c.text));
    if (fix) {
      const now = fix.to(c.text);
      usedFixes.add(fix.id);
      // A matching fix whose result isn't in the messages counts as missing.
      if (haystack.has(now)) fixed.push({ ...c, id: fix.id, now });
      else missing.push({ ...c, text: `${c.text}  [${fix.id} expected: "${now}"]` });
      continue;
    }
    const ex = EXCLUDED.findIndex((e) => (typeof e.text === 'string' ? e.text === c.text : e.text.test(c.text)));
    if (ex >= 0) {
      usedExclusions.add(ex);
      excluded.push({ ...c, reason: EXCLUDED[ex].reason });
    } else missing.push(c);
  }
  const staleExclusions = [
    ...EXCLUDED.filter((_, i) => !usedExclusions.has(i)),
    ...APPLIED.filter((f) => !usedFixes.has(f.id)).map((f) => ({ text: `${f.id} ${f.from}`, reason: f.note })),
  ];
  // Keyed fixes: the named message must hold one of this fix's results.
  for (const f of APPLIED.filter((x) => x.keys)) {
    const results = new Set(fixed.filter((c) => c.id === f.id).map((c) => c.now));
    for (const key of f.keys!) {
      const value = getKey(messages, key);
      if (value === undefined || !results.has(plain(value))) {
        missing.push({ text: `${key} should hold the ${f.id} fix (has: ${JSON.stringify(value)})`, where: new Set(['messages/en']) });
      }
    }
  }

  // 2. ICU: format every message (dummy values for arguments, handlers for the allowed
  // rich-text tags). next-intl reports problems through onError rather than throwing,
  // so errors are collected there; a try/catch alone would miss them.
  const icuErrors: string[] = [];
  let currentKey = '';
  const t = createTranslator({
    locale: 'en',
    messages: messages as never,
    onError: (e) => icuErrors.push(`${currentKey}: ${e.message}`),
  });
  for (const [key, value] of msgLeaves) {
    currentKey = key;
    const args: Record<string, unknown> = {};
    for (const tag of new Set([...value.matchAll(/<(\w+)>/g)].map((m) => m[1]))) {
      if (RICH_TAGS.includes(tag)) args[tag] = (c: unknown) => c;
      else icuErrors.push(`${key}: unknown rich-text tag <${tag}> (allowed: ${RICH_TAGS.join(', ')})`);
    }
    for (const m of value.matchAll(/\{\s*(\w+)\s*(?:,\s*(\w+))?/g)) args[m[1]] = m[2] === 'plural' || m[2] === 'number' ? 1 : 'X';
    try {
      (t.rich as (k: string, v: unknown) => unknown)(key, args);
    } catch (e) {
      icuErrors.push(`${key}: ${(e as Error).message}`);
    }
  }

  // 3. Adapter key references.
  const referenced = [...new Set(adapterKeys(data))];
  const badKeys = referenced.filter((k) => !hasKey(messages, k));
  // Alt text exists for every processed image.
  const missingAlt = (Object.keys(data.images) as data.ImageKey[]).map(data.altKeyFor).filter((k) => !hasKey(messages, k));

  // Report
  const row = (c: Crawled, extra = '') => `| ${c.text.replace(/\|/g, '\\|')} | ${[...c.where].slice(0, 3).join(', ')}${c.where.size > 3 ? ' …' : ''} |${extra}`;
  const md = [
    '# Content verification',
    '',
    'Generated by `scripts/verify-content.ts`. Every text string crawled from the live site (`content/*.json`) must appear verbatim in `messages/en` (whitespace normalised, `<b>` emphasis tags ignored) or in `src/data/site.ts`. The only exceptions are an approved copy fix (whose fixed text must then be present) or an intentional exclusion, both listed below.',
    '',
    '## Summary',
    '',
    `| Check | Result |`,
    `| --- | --- |`,
    `| Unique crawled strings | ${crawled.size} |`,
    `| Found in messages/en or site.ts | ${found.length} |`,
    `| Changed by an approved copy fix | ${fixed.length} |`,
    `| Intentionally excluded | ${excluded.length} |`,
    `| **Missing** | **${missing.length}** |`,
    `| Stale exclusion rules | ${staleExclusions.length} |`,
    `| ICU format errors | ${icuErrors.length} |`,
    `| Adapter keys checked / unresolved | ${referenced.length} / ${badKeys.length} |`,
    `| Images without alt text key | ${missingAlt.length} |`,
    '',
    '## Missing strings',
    '',
    missing.length ? ['| Text | Where |', '| --- | --- |', ...missing.map((c) => row(c))].join('\n') : '_None._',
    '',
    '## Approved copy fixes (applied — reversible)',
    '',
    'See docs/client-requests.md. The crawled text was replaced, and the fixed text is verified present.',
    '',
    '| Fix | Crawled | Now | Where |',
    '| --- | --- | --- | --- |',
    ...fixed.map((c) => `| ${c.id} | ${c.text.replace(/\|/g, '\\|')} | ${c.now.replace(/\|/g, '\\|')} | ${[...c.where].slice(0, 3).join(', ')} |`),
    '',
    '## Intentional exclusions',
    '',
    '| Text | Where | Reason |',
    '| --- | --- | --- |',
    ...excluded.map((c) => row(c, ` ${c.reason} |`)),
    '',
    ...(staleExclusions.length ? ['## Stale exclusion rules', '', ...staleExclusions.map((e) => `- \`${e.text}\` — ${e.reason}`), ''] : []),
    ...(icuErrors.length ? ['## ICU errors', '', ...icuErrors.map((e) => `- ${e}`), ''] : []),
    ...(badKeys.length ? ['## Unresolved adapter keys', '', ...badKeys.map((k) => `- \`${k}\``), ''] : []),
    ...(missingAlt.length ? ['## Missing alt text', '', ...missingAlt.map((k) => `- \`${k}\``), ''] : []),
  ].join('\n');
  fs.writeFileSync(REPORT, md);

  console.log(`Crawled strings: ${crawled.size}  found: ${found.length}  fixed: ${fixed.length}  excluded: ${excluded.length}  MISSING: ${missing.length}`);
  console.log(`ICU errors: ${icuErrors.length}  adapter keys: ${referenced.length} (${badKeys.length} unresolved)  missing alt: ${missingAlt.length}  stale exclusions: ${staleExclusions.length}`);
  for (const c of missing) console.log(`  ✗ missing: "${c.text}"  (${[...c.where].join(', ')})`);
  for (const e of icuErrors) console.log(`  ✗ ICU: ${e}`);
  for (const k of [...badKeys, ...missingAlt]) console.log(`  ✗ key: ${k}`);
  for (const e of staleExclusions) console.log(`  ✗ stale exclusion: ${e.text}`);
  console.log(`Report: ${path.relative(ROOT, REPORT)}`);

  if (missing.length || icuErrors.length || badKeys.length || missingAlt.length || staleExclusions.length) process.exit(1);
}

main();
