/**
 * WCAG contrast check for the colour pairs the design uses (CR-01, section 2).
 *
 *   pnpm exec tsx scripts/contrast.ts
 *
 * Reads the tokens from tailwind.config.ts, so a palette change is re-checked here.
 * Normal text needs 4.5:1, large text (≥ 24px, or ≥ 18.66px bold) 3:1. Exits 1 on a failure.
 */
import config from '../tailwind.config';

type Shades = Record<string, string>;
const colors = config.theme!.extend!.colors as Record<string, string | Shades>;

function token(name: string): string {
  const [group, shade] = name.split('-');
  const v = colors[group];
  if (typeof v === 'string') return v;
  const hex = v?.[shade ?? 'DEFAULT'];
  if (!hex) throw new Error(`Unknown colour token: ${name}`);
  return hex;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** [text, background, large text only?, where it is used]. */
const PAIRS: [string, string, boolean, string][] = [
  ['rani-500', 'white', true, 'h1, header name, large pink text on white'],
  ['rani-500', 'ivory', true, 'h1 on ivory'],
  ['rani-600', 'white', false, 'pink body text, links, card titles on white'],
  ['rani-600', 'ivory', false, 'pink text on ivory'],
  ['rani-600', 'blush', false, 'pink text < 24px on blush'],
  ['rani-500', 'blush', true, 'h1 / script line on the blush hero'],
  ['ink', 'white', false, 'body text'],
  ['ink', 'blush', false, 'body text on blush'],
  ['ink-muted', 'white', false, 'secondary text'],
  ['ink-muted', 'blush', false, 'secondary text on blush'],
  ['white', 'rani-500', false, 'top bar, footer and active nav pill text'],
  ['plum-900', 'marigold-400', false, 'text on yellow buttons and the stats panel'],
  ['plum-900', 'marigold-500', false, 'text on yellow hover'],
  ['rani-700', 'marigold-400', false, 'stat labels on the yellow stats panel'],
  ['rani-600', 'marigold-400', true, 'stat numbers (≥ 32px bold) on the yellow stats panel'],
  ['cocoa', 'ivory', false, 'second line of the header name'],
  ['cocoa', 'marigold-100', false, 'header name over the bar gradient'],
  ['ink', 'marigold-100', false, 'header tagline over the bar gradient'],
];

const hexOf = (name: string) => (name === 'white' ? '#FFFFFF' : token(name));
let failed = 0;
for (const [fg, bg, large, where] of PAIRS) {
  const r = ratio(hexOf(fg), hexOf(bg));
  const need = large ? 3 : 4.5;
  const ok = r >= need;
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✗'} ${fg.padEnd(12)} on ${bg.padEnd(13)} ${r.toFixed(2).padStart(5)}:1  (needs ${need}:1${large ? ', large' : ''})  ${where}`);
}
if (failed) {
  console.error(`${failed} pair(s) below WCAG AA.`);
  process.exit(1);
}
console.log('All pairs pass WCAG AA.');
