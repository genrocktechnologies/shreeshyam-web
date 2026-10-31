import type { Config } from 'tailwindcss';
import { distance, dur, ease, hero, scale, ui } from './src/lib/motion';

const ms = (v: number) => `${v}ms`;
const ARCH = 'round 999px 999px 28px 28px';

/** Tokens from docs/design-system.md ("Marigold Thread"). Components use only these colours. */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        rani: {
          50: '#FFF0F6',
          100: '#FFD9E8',
          200: '#FFB3D0',
          300: '#FF80B1',
          400: '#F2489A',
          500: '#E0237A', // brand primary
          600: '#C2185F',
          700: '#9C1149',
          800: '#740D37',
          900: '#4A0823',
        },
        marigold: {
          50: '#FFFBEB',
          100: '#FFF2C2',
          200: '#FFE485',
          300: '#FFD447',
          400: '#FFC21A', // brand accent
          500: '#F5A800',
          600: '#C98500',
          700: '#9A6300',
        },
        plum: { 700: '#5A2140', 800: '#3E1530', 900: '#2B0E21' },
        ivory: { DEFAULT: '#FFFCF6', 100: '#FFF8EC' },
        ink: { DEFAULT: '#2B1A22', muted: '#6B5560', faint: '#A8949E' },
        success: '#1F8A5B',
        danger: '#C62828',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        'display-hi': ['var(--font-display-hi)', 'var(--font-body)', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      // Fluid sizes: mobile → desktop values from the type scale. Hindi line-heights are
      // raised in globals.css under :lang(hi).
      fontSize: {
        display: ['clamp(2.5rem, 1.75rem + 3.2vw, 4.75rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        h2: ['clamp(1.875rem, 1.5rem + 1.6vw, 3rem)', { lineHeight: '1.1' }],
        h3: ['clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem)', { lineHeight: '1.3' }],
        body: ['clamp(1.0625rem, 1.04rem + 0.1vw, 1.125rem)', { lineHeight: '1.65' }],
        small: ['0.875rem', { lineHeight: '1.5' }],
        eyebrow: ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.14em' }],
        accent: ['clamp(1.375rem, 1.1rem + 1.2vw, 2rem)', { lineHeight: '1.3' }],
        stat: ['clamp(3rem, 2.1rem + 3.9vw, 5.5rem)', { lineHeight: '1' }],
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
        soft: '0 12px 32px -14px rgb(224 35 122 / 0.22)',
        lift: '0 20px 44px -16px rgb(224 35 122 / 0.32)',
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
        'arch-open': {
          from: { clipPath: `inset(100% 0 0 0 ${ARCH})` },
          to: { clipPath: `inset(0 0 0 0 ${ARCH})` },
        },
        settle: { from: { transform: `scale(${scale.imageFrom})` }, to: { transform: 'none' } },
        'fade-up': { from: { opacity: '0', transform: `translateY(${distance.reveal}px)` }, to: { opacity: '1', transform: 'none' } },
        'scale-in': { from: { opacity: '0', transform: `scale(${scale.cta})` }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        'hero-arch': `arch-open ${dur.slow}s ${ease.growth} ${hero.image}s both`,
        'hero-settle': `settle ${dur.slow}s ${ease.growth} ${hero.image}s both`,
        'hero-eyebrow': `fade-up ${dur.base}s ${ease.growth} ${hero.eyebrow}s both`,
        // The h1 is the largest above-the-fold element on mobile (LCP), so it rises via
        // CSS from first paint instead of waiting for JS + SplitText.
        'hero-title': `fade-up ${dur.base}s ${ease.growth} ${hero.title}s both`,
        'hero-ctas': `scale-in ${dur.base}s ${ease.growth} ${hero.ctas}s both`,
      },
      minHeight: { tap: '48px' },
      minWidth: { tap: '48px' },
    },
  },
  plugins: [],
};

export default config;
