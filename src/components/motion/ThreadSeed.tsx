'use client';

import { useRef } from 'react';
import { cn } from '@/lib/cn';
import { gsap, motionEnabled, MM, readConditions, useGSAP } from '@/lib/gsap';
import { dur, hero, scale } from '@/lib/motion';

/**
 * The golden thread's seed (motion-spec story, step 1): a marigold dot with a soft halo
 * that pops in during the hero load. Centre it on the thread column with `.thread-col`.
 * Reduced motion / no JS: shown immediately.
 */
export function ThreadSeed({ delay = hero.seed, className }: { delay?: number; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !motionEnabled()) return;
      const mm = gsap.matchMedia();
      mm.add(MM, (ctx) => {
        if (readConditions(ctx).reduce) {
          gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: dur.reduce, delay });
          return;
        }
        gsap.fromTo(
          el,
          { opacity: 0, scale: scale.seedFrom, transformOrigin: '50% 50%' },
          { opacity: 1, scale: 1, duration: dur.seed, delay, ease: 'growth' },
        );
      });
    },
    { scope: ref, dependencies: [delay] },
  );

  return (
    <svg
      ref={ref}
      data-thread-seed=""
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn('pointer-events-none h-6 w-6 overflow-visible', className)}
    >
      <circle cx="12" cy="12" r="11" className="fill-marigold-200/60" />
      <circle cx="12" cy="12" r="5.5" className="fill-marigold-400" />
      <circle cx="10.5" cy="10.5" r="1.6" className="fill-marigold-100" />
    </svg>
  );
}
