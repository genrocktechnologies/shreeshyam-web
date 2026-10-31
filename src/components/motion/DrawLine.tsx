'use client';

import { useRef } from 'react';
import { cx } from '@/lib/cx';
import { gsap, motionEnabled, MM, readConditions, useGSAP, whenNear } from '@/lib/gsap';
import { dur, REVEAL_START, stagger } from '@/lib/motion';

interface DrawLineProps {
  /** `y` grows top → bottom, `x` grows left → right. */
  axis?: 'x' | 'y';
  /** Position in a group, offsetting the start by stagger.base each. */
  index?: number;
  className?: string;
}

/**
 * A thin rule that draws itself (scale 0 → 1) when scrolled into view, e.g. the marigold
 * dividers in the stats band. Style it (size, colour) with className. Reduced motion:
 * a fade. No JS: fully drawn.
 */
export function DrawLine({ axis = 'y', index = 0, className }: DrawLineProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !motionEnabled()) return;
      const prop = axis === 'y' ? 'scaleY' : 'scaleX';
      const scrollTrigger = { trigger: el, start: REVEAL_START, once: true };
      const mm = gsap.matchMedia();
      mm.add(MM, (ctx) =>
        whenNear(el, ctx, () => {
          if (readConditions(ctx).reduce) {
            gsap.fromTo(el, { [prop]: 1, opacity: 0 }, { opacity: 1, duration: dur.reduce, scrollTrigger });
            return;
          }
          gsap.fromTo(
            el,
            { [prop]: 0, transformOrigin: axis === 'y' ? '50% 0%' : '0% 50%' },
            { [prop]: 1, duration: dur.divider, delay: index * stagger.base, ease: 'growth', scrollTrigger },
          );
        })
      );
    },
    { scope: ref, dependencies: [axis, index] },
  );

  return <span ref={ref} aria-hidden="true" data-draw-line={axis} className={cx('pointer-events-none block', className)} />;
}
