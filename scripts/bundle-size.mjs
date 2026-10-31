// Gzipped JS loaded by exported pages (the CLAUDE.md budget is < 180 KB first-load JS per route).
//   pnpm build && node scripts/bundle-size.mjs [out/en/page/index.html ...]
// With no arguments, checks every index.html in out/.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const OUT = path.resolve('out');
const BUDGET = 180 * 1024;

const pages = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(OUT, { recursive: true }).filter((f) => String(f).endsWith('index.html')).map((f) => path.join(OUT, String(f)));

const scriptRe = /\/_next\/static\/chunks\/[^"'\s\\]+\.js/g;
const gz = (rel) => {
  try {
    return zlib.gzipSync(fs.readFileSync(path.join(OUT, decodeURIComponent(rel)))).length;
  } catch {
    return 0;
  }
};

let failed = false;
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  // polyfills-*.js is loaded with `nomodule` (legacy browsers only); Next's First Load
  // figure leaves it out too.
  const chunks = [...new Set(html.match(scriptRe) ?? [])].filter((c) => !c.includes('/polyfills-'));
  const total = chunks.reduce((n, c) => n + gz(c), 0);
  const over = total > BUDGET;
  failed ||= over;
  console.log(`${over ? '✗' : '✓'} ${(total / 1024).toFixed(1).padStart(6)} KB  ${path.relative(OUT, page)}`);
  if (process.env.VERBOSE) for (const c of chunks) console.log(`      ${(gz(c) / 1024).toFixed(1).padStart(6)} KB  ${c}`);
}
if (failed) process.exit(1);
