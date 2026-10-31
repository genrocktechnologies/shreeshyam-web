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
  display: 'swap',
  preload: false,
});
export const mukta = Mukta({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});
export const kalam = Kalam({
  weight: ['400', '700'],
  subsets: ['latin', 'devanagari'],
  variable: '--font-script',
  display: 'swap',
  preload: false,
});

export const fontVariables = [fraunces.variable, tiroHindi.variable, mukta.variable, kalam.variable].join(' ');
