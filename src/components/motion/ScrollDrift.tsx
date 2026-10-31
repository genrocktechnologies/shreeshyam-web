'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, motionEnabled, MM, readConditions, useGSAP } from '@/lib/gsap';
import { distance, opacity, scrub, trigger } from '@/lib/motion';

interface ScrollDriftProps {
  children: ReactNode;
  /** Section whose scroll-out drives the drift; defaults to the closest <section>. */
  triggerSelector?: string;
  className?: string;
}

/**
 * Content drifts up slowly and fades a little as its section scrolls away (hero
 * choreography). Desktop and tablet only; mobile, low-end and reduced motion stay still.
 */
export function ScrollDrift({ children, triggerSelector, className }: ScrollDriftProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !motionEnabled()) return;
      const section = (triggerSelector ? document.querySelector(triggerSelector) : el.closest('section')) ?? el;
      const mm = gsap.matchMedia();
      mm.add(MM, (ctx) => {
        const c = readConditions(ctx);
        if (!(c.isDesktop || c.isTablet)) return;
        gsap.to(el, {
          y: -distance.drift,
          opacity: opacity.driftTo,
          ease: 'none',
          scrollTrigger: { trigger: section, start: trigger.driftStart, end: trigger.driftEnd, scrub: scrub.drift },
        });
      });
    },
    { scope: ref, dependencies: [triggerSelector] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
