'use client';

import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { gsap, motionEnabled, MM, readConditions, useGSAP } from '@/lib/gsap';
import { distance, scale, scrub } from '@/lib/motion';

interface ParallaxProps {
  children: ReactNode;
  /** Maximum travel in px each way; capped so the scaled image never shows an edge. */
  amount?: number;
  /** Classes for the clipping frame, e.g. `mask-arch aspect-[4/5]`. */
  className?: string;
}

const SCALE = scale.parallaxCover;

/**
 * Moves its content ±`amount` px inside an overflow-hidden frame as the frame crosses
 * the viewport. The content is over-scaled (scale.parallaxCover) so edges never show. Desktop only.
 */
export function Parallax({ children, amount = distance.parallax, className }: ParallaxProps) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!frame.current || !inner.current || !motionEnabled()) return;
      const mm = gsap.matchMedia();
      mm.add(MM, (ctx) => {
        if (!readConditions(ctx).isDesktop) return;
        // Over-scaling leaves (SCALE - 1) / 2 of the height spare on each side.
        const travel = () => Math.min(amount, (frame.current!.offsetHeight * (SCALE - 1)) / 2);
        gsap.fromTo(
          inner.current,
          { y: () => -travel() },
          {
            y: () => travel(),
            ease: 'none',
            scrollTrigger: { trigger: frame.current, start: 'top bottom', end: 'bottom top', scrub: scrub.parallax, invalidateOnRefresh: true },
          },
        );
      });
    },
    { scope: frame, dependencies: [amount] },
  );

  return (
    <div ref={frame} className={cn('relative overflow-hidden', className)}>
      <div ref={inner} className="h-full w-full" style={{ transform: `scale(${SCALE})` }}>
        {children}
      </div>
    </div>
  );
}
