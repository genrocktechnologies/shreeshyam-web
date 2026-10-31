'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { isLowEnd, media } from './motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase);
  CustomEase.create('growth', '0.22,1,0.36,1');
  CustomEase.create('inOut', '0.65,0,0.35,1');
  gsap.defaults({ ease: 'growth' });
}

/** Named eases registered above, matching `ease` in lib/motion.ts. */
export const EASE = { growth: 'growth', inOut: 'inOut' } as const;

/**
 * Conditions for `gsap.matchMedia().add(MM, ctx => …)`. Every motion branch except
 * `reduce` requires `prefers-reduced-motion: no-preference`.
 */
export const MM = {
  isDesktop: `${media.desktop} and ${media.noPreference}`,
  isTablet: `${media.tablet} and ${media.noPreference}`,
  isMobile: `${media.mobile} and ${media.noPreference}`,
  reduce: media.reduce,
} as const;

export interface MotionConditions {
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  reduce: boolean;
}

/** Reads matchMedia conditions, downgrading desktop/tablet to mobile on low-end devices. */
export function readConditions(ctx: gsap.Context): MotionConditions {
  const c = (ctx.conditions ?? {}) as Partial<MotionConditions>;
  const lowEnd = isLowEnd();
  return {
    isDesktop: !!c.isDesktop && !lowEnd,
    isTablet: !!c.isTablet && !lowEnd,
    isMobile: !!c.isMobile || (lowEnd && !c.reduce),
    reduce: !!c.reduce,
  };
}

/**
 * False when `html.js-motion` was never added (no JS) or was removed by the inline safety
 * timeout because motion booted too late. Content is already visible in that case, so
 * entrance animations must be skipped rather than hiding it again.
 */
export function motionEnabled(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('js-motion');
}

/** Marks motion as booted so the inline safety timeout keeps `html.js-motion`. */
export function markMotionReady() {
  if (typeof window !== 'undefined') (window as Window & { __motionReady?: boolean }).__motionReady = true;
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
