'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, MM, readConditions, useGSAP } from '@/lib/gsap';
import { dur } from '@/lib/motion';

// Module scope survives route changes, so only the very first page load is skipped.
let firstLoad = true;

/**
 * Page-transition curtain (motion-spec): on each client-side navigation, a rani-600
 * panel covers the new page and slides up and away (0.5s). It is skipped on the first
 * load (never blocks first paint) and under reduced motion.
 */
export default function Template({ children }: { children: ReactNode }) {
  const curtain = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (firstLoad) {
      // Deferred so React Strict Mode's double effect run in dev also counts as the
      // first load.
      window.setTimeout(() => {
        firstLoad = false;
      });
      return;
    }
    const mm = gsap.matchMedia();
    mm.add(MM, (ctx) => {
      if (readConditions(ctx).reduce) return;
      gsap.fromTo(
        curtain.current,
        { yPercent: 0, autoAlpha: 1 },
        { yPercent: -100, duration: dur.base * 0.72, ease: 'inOut', onComplete: () => gsap.set(curtain.current, { autoAlpha: 0 }) },
      );
    });
  });

  return (
    <>
      {children}
      <div ref={curtain} aria-hidden="true" className="pointer-events-none invisible fixed inset-0 z-[90] bg-rani-600" />
    </>
  );
}
