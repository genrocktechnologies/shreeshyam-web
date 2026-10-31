/** Motion tokens from docs/motion-spec.md. */
export const ease = {
  growth: 'cubic-bezier(0.22, 1, 0.36, 1)', // default: confident, soft landing
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)', // scrubbed / pinned sequences
} as const;

export const dur = { fast: 0.35, base: 0.7, slow: 1.1, thread: 1.6 } as const;
export const stagger = { tight: 0.06, base: 0.1, loose: 0.16 } as const;
export const distance = { reveal: 28, parallax: 60 } as const; // px

/** Reveals fire once when the element's top passes 82% of the viewport. */
export const REVEAL_START = 'top 82%';

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
