import type { Config } from 'tailwindcss';

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
      transitionTimingFunction: {
        growth: 'cubic-bezier(0.22, 1, 0.36, 1)',
        'in-out-soft': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      minHeight: { tap: '48px' },
      minWidth: { tap: '48px' },
    },
  },
  plugins: [],
};

export default config;
