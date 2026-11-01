import type { Config } from 'tailwindcss';
import { distance, dur, ease, hero, rotate, scale, ui } from './src/lib/motion';

const ms = (v: number) => `${v}ms`;

/** Tokens from docs/design-system.md (CR-01 palette). Components use only these colours. */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        rani: {
          50: '#FFF1F7', // light pink surfaces
          100: '#FFD9E8',
          200: '#FFB3D0',
          300: '#FF80B1',
          400: '#F2489A',
          500: '#D71978', // primary magenta: top bar, active nav pill, icons, footer
          600: '#C21869', // pink text and hover
          700: '#9C1149',
          800: '#740D37',
          900: '#4A0823',
        },
        marigold: {
          50: '#FFFBEB',
          100: '#FFF2C2',
          200: '#FFE88A',
          300: '#FFDF5C',
          400: '#FFD52E', // CTA buttons, yellow frames, stats panel (fill only)
          500: '#F9C900', // hover and borders on yellow
          600: '#C98500',
          700: '#9A6300',
        },
        plum: { 700: '#5A2140', 800: '#3E1530', 900: '#2B0E21' },
        ivory: { DEFAULT: '#FFFCF6', 100: '#FFF8EC' },
        /** Soft pink section backgrounds (hero, About). Pink text < 24px on it uses rani-600 or ink. */
        blush: '#FCEAF2',
        /** Second line of the header name. */
        cocoa: '#683B20',
        ink: { DEFAULT: '#29232B', muted: '#6B5560', faint: '#A8949E' },
        success: '#1F8A5B',
        danger: '#C62828',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        'display-hi': ['var(--font-display-hi)', 'var(--font-body)', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
        'script-hi': ['var(--font-script-hi)', 'cursive'],
      },
      // Fluid sizes: mobile → desktop values from the type scale. Hindi line-heights are
      // raised in globals.css under :lang(hi).
      fontSize: {
        // CR-01 compact scale (Merriweather runs wide, Poppins large). Display (h1): 34px on
        // phones → capped at 56px, so the hero headline stays within 2–3 lines.
        display: ['clamp(2.125rem, 1.6rem + 2.2vw, 3.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        h2: ['clamp(1.625rem, 1.35rem + 1.1vw, 2.375rem)', { lineHeight: '1.2' }],
        h3: ['clamp(1.125rem, 1.07rem + 0.25vw, 1.3125rem)', { lineHeight: '1.35' }],
        body: ['clamp(1rem, 0.98rem + 0.1vw, 1.0625rem)', { lineHeight: '1.7' }],
        small: ['0.875rem', { lineHeight: '1.5' }],
        eyebrow: ['0.9375rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        accent: ['clamp(1.5rem, 1.2rem + 1.4vw, 2.375rem)', { lineHeight: '1.25' }],
        stat: ['clamp(2rem, 1.6rem + 1.6vw, 2.75rem)', { lineHeight: '1.1' }],
      },
      maxWidth: {
        container: '1240px',
        prose: '68ch',
      },
      borderRadius: {
        '2xl': '20px',
        // Signature jharokha arch for hero and feature photos.
        arch: '999px 999px 28px 28px',
      },
      boxShadow: {
        soft: '0 10px 30px -14px rgb(215 25 120 / 0.2)',
        lift: '0 18px 40px -16px rgb(215 25 120 / 0.3)',
      },
      // Motion: all values come from src/lib/motion.ts (one-file tuning).
      transitionTimingFunction: {
        growth: ease.growth,
        'in-out-soft': ease.inOut,
      },
      transitionDuration: Object.fromEntries(Object.entries(ui).map(([k, v]) => [k, ms(v)])),
      /** Read in globals.css via theme('motion.*'). */
      motion: {
        megaSlide: `${distance.megaSlide}px`,
        sheetSlide: `${distance.sheetSlide}px`,
        megaStagger: ms(ui.megaStagger),
        sheetStagger: ms(ui.sheetStagger),
        sheetDelay: ms(ui.sheetDelay),
      },
      // Hero load sequence runs as CSS (from first paint, before hydration) so the hero
      // photo, the LCP element, never waits for JavaScript.
      keyframes: {
        settle: { from: { transform: `scale(${scale.imageFrom})` }, to: { transform: 'none' } },
        'fade-up': { from: { opacity: '0', transform: `translateY(${distance.reveal}px)` }, to: { opacity: '1', transform: 'none' } },
        // Transform only: for LCP elements, which must be fully opaque and unclipped on the first frame.
        rise: { from: { transform: `translateY(${distance.reveal}px)` }, to: { transform: 'none' } },
        'scale-in': { from: { opacity: '0', transform: `scale(${scale.cta})` }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        'hero-settle': `settle ${dur.slow}s ${ease.growth} ${hero.image}s both`,
        'hero-eyebrow': `fade-up ${dur.base}s ${ease.growth} ${hero.eyebrow}s both`,
        // The h1 is the largest above-the-fold element on mobile (LCP), so it rises via
        // CSS from first paint instead of waiting for JS + SplitText.
        'hero-title': `rise ${dur.base}s ${ease.growth} ${hero.title}s both`,
        'hero-ctas': `scale-in ${dur.base}s ${ease.growth} ${hero.ctas}s both`,
      },
      rotate: { icon: `${rotate.icon}deg` },
      scale: { peek: String(scale.peek) },
      minHeight: { tap: '48px' },
      minWidth: { tap: '48px' },
    },
  },
  plugins: [],
};

export default config;
