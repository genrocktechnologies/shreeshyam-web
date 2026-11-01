import { Dancing_Script, Kalam, Merriweather, Poppins, Tiro_Devanagari_Hindi } from 'next/font/google';

// Shared by app/[locale]/layout.tsx and app/not-found.tsx (both render the full document).
// Faces from CR-01 (design-system, Typography): Merriweather display, Poppins body,
// Dancing Script accents; Hindi keeps Tiro Devanagari Hindi (display) and Kalam (accents).
//
// Performance (mobile LCP budget): `subsets` controls what is PRELOADED. Every subset's
// @font-face (with its unicode-range) is still generated, so Devanagari files download
// on demand only when a page actually renders Devanagari text. Hindi-only faces are never
// preloaded, so English pages don't spend bandwidth on them.

/** Display (h1, h2, card titles, stat numbers): 700, plus 900 for the header name. */
export const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['700', '900'],
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
/** Body, nav and buttons in both scripts (Poppins has a Devanagari subset). */
export const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});
/**
 * English script accents (the hero's "Together We Build a" line, slogans). Preloaded and
 * 'swap': with 'optional', a cold first visit kept the fallback sans for the whole view,
 * which broke the script look. A late swap can't shift the layout here: the hero line is
 * one unwrapped line with a fixed line-height (text-accent), and the slogans sit in boxes
 * sized by their neighbours.
 */
export const dancingScript = Dancing_Script({
  weight: ['600', '700'],
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
});
/** Hindi script accents: Dancing Script has no Devanagari. Hindi pages only, never preloaded. */
export const kalam = Kalam({
  weight: '700',
  subsets: ['devanagari', 'latin'],
  variable: '--font-script-hi',
  display: 'optional',
  preload: false,
});

export const fontVariables = [merriweather.variable, tiroHindi.variable, poppins.variable, dancingScript.variable, kalam.variable].join(' ');
