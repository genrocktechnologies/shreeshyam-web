import { Fraunces, Kalam, Mukta, Tiro_Devanagari_Hindi } from 'next/font/google';

// Shared by app/[locale]/layout.tsx and app/not-found.tsx (both render the full document).
export const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz'],
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
  subsets: ['latin', 'devanagari'],
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
