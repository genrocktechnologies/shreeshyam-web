/**
 * Motion tokens from docs/motion-spec.md. EVERY duration, distance, ease, scale and delay
 * used by the site lives here, so tuning the feel is a one-file change:
 * - GSAP code (src/components/motion, sections) imports these directly.
 * - CSS transitions/animations get them through tailwind.config.ts (classes such as
 *   `duration-press`, `ease-growth` and `animate-hero-arch`, plus `theme(...)` in
 *   globals.css).
 * Units: seconds for GSAP values, milliseconds in `ui` (CSS), px for distances.
 */

export const ease = {
  growth: 'cubic-bezier(0.22, 1, 0.36, 1)', // default: confident, soft landing
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)', // scrubbed / pinned sequences
  /** GSAP named ease for CountUp. */
  count: 'power2.out',
} as const;

/** GSAP durations (s). */
export const dur = {
  fast: 0.35,
  base: 0.7,
  slow: 1.1,
  thread: 1.6,
  /** Reduced-motion fade. */
  reduce: 0.2,
  count: 1.8,
  curtain: 0.5,
  /** Hero accent underline drawing under the Kalam word. */
  underline: 0.45,
  /** Golden-thread seed dot popping in. */
  seed: 0.5,
  /** Stats band: marigold dividers drawing vertically. */
  divider: 0.9,
} as const;

export const stagger = {
  tight: 0.06,
  base: 0.1,
  loose: 0.16,
  reduce: 0.03,
  /** Reading highlight: per-word offset inside the scrub (relative; the scrub sets the pace). */
  highlight: 0.1,
} as const;

/** Distances in px (splitRise is % of the line height). */
export const distance = {
  reveal: 28,
  parallax: 60,
  /** Hero text drifting up as the hero scrolls away. */
  drift: 72,
  splitRise: 105,
  magnetic: 6,
  megaSlide: 8,
  sheetSlide: 16,
} as const;

export const scale = {
  revealCard: 0.98,
  /** Hero CTAs grow in from this scale. */
  cta: 0.96,
  /** ImageReveal: image settles from this scale. */
  imageFrom: 1.15,
  /** Parallax: content is over-scaled so its edges never show. */
  parallaxCover: 1.12,
  seedFrom: 0,
} as const;

export const opacity = {
  /**
   * About reading highlight: words start this faint. 0.62 is the lowest that keeps ink
   * on ivory at WCAG AA 4.5:1 (computed 4.65:1), so text mid-scrub stays readable. Lower
   * values look more dramatic but fail contrast (axe: color-contrast, serious).
   */
  highlightFrom: 0.62,
  /**
   * Hero text opacity at the end of its drift. Kept at 1: any fade drops the eyebrow
   * (rani-600, ≈5.3:1) and the CTA labels below WCAG AA while they are still on screen
   * (axe color-contrast, serious). The drift is movement only.
   */
  driftTo: 1,
} as const;

/** ScrollTrigger scrub smoothing (s); `true` = locked to scroll. */
export const scrub = { thread: 0.6, highlight: 0.6, drift: 0.4, parallax: true } as const;

/** ScrollTrigger start/end positions. */
export const trigger = {
  reveal: 'top 82%',
  threadStart: 'top 70%',
  threadEnd: 'bottom 60%',
  /** Hero thread: draws from the seed as the hero scrolls out. */
  heroThreadStart: 'top top',
  heroThreadEnd: 'bottom 30%',
  highlightStart: 'top 75%',
  highlightEnd: 'bottom 60%',
  driftStart: 'top top',
  driftEnd: 'bottom top',
} as const;

export const spring = { stiffness: 300, damping: 20, rest: 0.01 } as const;

/** Hero load sequence: delays (s) from first paint/hydration. Total stays < 1.4s. */
export const hero = {
  eyebrow: 0,
  title: 0.1,
  image: 0.2,
  ctas: 0.55,
  seed: 0.8,
  /** Gap between the title's last line landing and the underline starting. */
  underlineGap: 0.05,
} as const;

/** Inner-page hero (PageHero) load sequence: delays (s). */
export const pageHero = { breadcrumb: 0, eyebrow: 0.05, title: 0.1, intro: 0.2 } as const;

/** Footer emblem watermark: slow drift (px, each way) while the footer scrolls into view. Desktop only. */
export const watermark = { drift: 40, scrub: 0.8 } as const;

/** CSS transitions (ms), exposed as Tailwind `duration-<name>` and theme('transitionDuration.<name>'). */
export const ui = {
  press: 300, // buttons, arrows, chevrons
  card: 250, // hover lift + shadow
  pill: 300, // language switch marker
  link: 300, // underline draw
  header: 350, // header shrink / hide
  bar: 300, // header bar colour, mobile action bar
  mega: 250, // mega panel slide
  megaFade: 200,
  megaStagger: 40,
  sheet: 320, // mobile sheet slide (also the close delay)
  sheetStagger: 40,
  sheetDelay: 80,
  sheetLink: 400,
  megaLink: 350,
  reduce: 200,
} as const;

/** Scroll thresholds (px) for header/action-bar behaviour. */
export const scroll = {
  /** Header turns solid and shrinks past this. */
  solidAfter: 40,
  headerHideAfter: 160,
  barHideAfter: 120,
  /** Ignore direction changes smaller than this. */
  tolerance: 6,
  /** Mega menu hover intent (ms). */
  hoverOpenMs: 80,
  hoverCloseMs: 160,
} as const;

/** Reveals fire once when the element's top passes 82% of the viewport. */
export const REVEAL_START = trigger.reveal;

/** Header height used to offset anchor scrolling. */
export const HEADER_OFFSET = 88;

export const media = {
  desktop: '(min-width: 1024px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  mobile: '(max-width: 767px)',
  finePointer: '(pointer: fine)',
  reduce: '(prefers-reduced-motion: reduce)',
  noPreference: '(prefers-reduced-motion: no-preference)',
} as const;

/**
 * Low-end devices (≤ 4 cores, or Save-Data on) get the mobile choreography even on
 * large screens. Client-only.
 */
export function isLowEnd(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return (typeof cores === 'number' && cores > 0 && cores <= 4) || saveData === true;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(media.reduce).matches;
}
