'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, motionEnabled, MM, readConditions, useGSAP, whenNear } from '@/lib/gsap';
import { dur, REVEAL_START, stagger } from '@/lib/motion';

/**
 * Draws the check marks of a checklist one after another when it scrolls into view
 * (motion-spec, Loan product pages). Marks are `svg[data-tick]` elements inside; their
 * paths draw with DrawSVG. Reduced motion: a fade. No JS: shown drawn.
 */
export function DrawTicks({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !motionEnabled()) return;
      const ticks = gsap.utils.toArray<SVGSVGElement>('svg[data-tick]', el);
      if (!ticks.length) return;
      const scrollTrigger = { trigger: el, start: REVEAL_START, once: true };
      const mm = gsap.matchMedia();
      mm.add(MM, (ctx) =>
        whenNear(el, ctx, () => {
          gsap.set(ticks, { opacity: 1 });
          if (readConditions(ctx).reduce) {
            gsap.fromTo(ticks, { opacity: 0 }, { opacity: 1, duration: dur.reduce, scrollTrigger });
            return;
          }
          gsap.fromTo(
            ticks.map((t) => t.querySelector('path')),
            { drawSVG: '0%' },
            { drawSVG: '100%', duration: dur.tick, ease: 'growth', stagger: stagger.base, scrollTrigger },
          );
        }),
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
