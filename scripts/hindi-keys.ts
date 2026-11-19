/**
 * Phase 7 acceptance: the Hindi message tree matches the English one.
 *
 *   pnpm exec tsx scripts/hindi-keys.ts
 *
 * For every namespace in src/i18n/routing.ts, compares messages/en/<ns>.json with
 * messages/hi/<ns>.json and fails (exit 1) on:
 *   - a key missing in Hindi, or an extra Hindi key (`_status` / `_note` excepted);
 *   - a Hindi file without `"_status": "draft-needs-review"` (or another status);
 *   - ICU arguments (`{name}`, plurals) or rich tags (`<b>`, `<accent>`) that differ;
 *   - Devanagari digits (numbers stay in Latin digits);
 *   - a Hindi message that doesn't format (ICU syntax).
 * It also lists Hindi strings identical to the English (allowed for names, brands and
 * figures; anything else is probably untranslated) and fails on any not in IDENTICAL_OK.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createTranslator } from 'next-intl';
import { namespaces } from '../src/i18n/routing';

const ROOT = path.resolve(__dirname, '..');
type Tree = { [k: string]: string | Tree };

/** Strings that stay identical in Hindi on purpose (names, brands, figures, codes). */
const IDENTICAL_OK = [
  /\.name$/, // people's names
  /^common\.siteName$/,
  /^common\.brand\.nameLine[12]$/,
  /^common\.alt\.logo$/,
  /^common\.social\./,
  /^common\.languages\./,
  /^common\.notFound\.hindiLink$/,
  /^common\.buttons\.whatsApp$/,
  /\.value$/, // stats and loan amounts ("1200+", "₹10,000 – ₹30,000")
  /^hrPolicy\.contact\.(organisation|directors\.names\..+)$/,
  /^privacy\.(heading|sections\.contactUs\.l1)$/,
  /^dev\.primitives\./, // component names in the motion playground
  /^home\.awards\.items\.\w+\.title$/, // award names (proper names)
];

const flatten = (t: Tree, prefix = '', out = new Map<string, string>()) => {
  for (const [k, v] of Object.entries(t)) {
    if (k.startsWith('_')) continue;
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out.set(key, v);
    else flatten(v, key, out);
  }
  return out;
};

const args = (s: string) => [...s.matchAll(/\{(\w+)/g)].map((m) => m[1]).sort().join(',');
const tags = (s: string) => [...s.matchAll(/<\/?([a-z]+)>/g)].map((m) => m[0]).sort().join('');

const problems: string[] = [];
const identical: string[] = [];
let total = 0;

for (const ns of namespaces) {
  const read = (locale: string) => JSON.parse(fs.readFileSync(path.join(ROOT, 'messages', locale, `${ns}.json`), 'utf8')) as Tree & { _status?: string };
  const enFile = path.join(ROOT, 'messages', 'en', `${ns}.json`);
  const hiFile = path.join(ROOT, 'messages', 'hi', `${ns}.json`);
  if (!fs.existsSync(hiFile)) {
    problems.push(`${ns}: messages/hi/${ns}.json is missing`);
    continue;
  }
  const hiRaw = read('hi');
  if (!hiRaw._status) problems.push(`${ns}: no "_status" (expected "draft-needs-review" until the client approves)`);
  const en = flatten(JSON.parse(fs.readFileSync(enFile, 'utf8')), ns);
  const hi = flatten(hiRaw, ns);
  total += en.size;

  for (const [key, e] of en) {
    const h = hi.get(key);
    if (h === undefined) {
      problems.push(`missing in hi: ${key}`);
      continue;
    }
    if (args(e) !== args(h)) problems.push(`ICU arguments differ: ${key} (en {${args(e)}} / hi {${args(h)}})`);
    if (tags(e) !== tags(h)) problems.push(`rich tags differ: ${key} (en ${tags(e)} / hi ${tags(h)})`);
    if (/[०-९]/.test(h)) problems.push(`Devanagari digits (use Latin digits): ${key}`);
    try {
      const values = Object.fromEntries(args(e).split(',').filter(Boolean).map((a) => [a, a === 'count' || a === 'current' || a === 'total' || a === 'number' || a === 'max' || a === 'year' ? 2 : 'x']));
      const fmt = createTranslator({ locale: 'hi', messages: { m: h } as never, onError: (err) => { throw err; } });
      if (tags(h)) fmt.markup('m' as never, { ...values, b: (c: string) => c, accent: (c: string) => c } as never);
      else fmt('m' as never, values as never);
    } catch (err) {
      problems.push(`ICU error: ${key}: ${(err as Error).message}`);
    }
    if (h === e && /[a-z]/i.test(e)) {
      if (IDENTICAL_OK.some((r) => r.test(key))) identical.push(key);
      else problems.push(`identical to English (untranslated?): ${key} = "${e}"`);
    }
  }
  for (const key of hi.keys()) if (!en.has(key)) problems.push(`extra key in hi (not in en): ${key}`);
}

console.log(`English keys: ${total}  Hindi problems: ${problems.length}  intentionally identical: ${identical.length}`);
for (const p of problems) console.log(`  ✗ ${p}`);
if (problems.length) process.exit(1);
console.log('0 missing keys: the en and hi trees match.');
