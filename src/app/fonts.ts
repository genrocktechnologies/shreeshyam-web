import { Fraunces, Kalam, Mukta, Tiro_Devanagari_Hindi } from 'next/font/google';

// Shared by app/[locale]/layout.tsx and app/not-found.tsx (both render the full document).
//
// Performance (mobile LCP budget): `subsets` controls what is PRELOADED. Every subset's
// @font-face (with its unicode-range) is still generated, so Devanagari files download
// on demand only when a page actually renders Devanagari text. Preloading Devanagari
// on every English page cost ~190 KB competing with the hero.

/** Display face. Only weight 600 is used, so a single static file replaces the opsz variable font. */
export const fraunces = Fraunces({
  subsets: ['latin'],
  weight: '600',
  variable: '--font-display',
  display: 'swap',
});
export const tiroHindi = Tiro_Devanagari_Hindi({
  weight: '400',
  subsets: ['devanagari', 'latin'],
  variable: '--font-display-hi',
  // 'optional': it isn't preloaded (only Hindi pages use it), so a late swap would shift
  // the hero headline (seen as CLS 0.27 on /hi/). If it misses the first ~100ms the
  // fallback stays for that view and the cached face is used on the next one.
  display: 'optional',
  preload: false,
});
export const mukta = Mukta({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});
/**
 * Accent script. Only 700 is used. The hero accent ("Every Family") sits inside the h1,
 * so a late swap reflowed the headline and moved the CTAs (CLS 0.26). It is therefore
 * preloaded (Latin only, ~1 small file) and 'optional': on a slow first visit the
 * fallback stays for that view instead of shifting the hero.
 */
export const kalam = Kalam({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-script',
  display: 'optional',
});

export const fontVariables = [fraunces.variable, tiroHindi.variable, mukta.variable, kalam.variable].join(' ');
