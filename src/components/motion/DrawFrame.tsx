'use client';

import { useRef } from 'react';
import { gsap, motionEnabled, MM, readConditions, useGSAP, whenNear } from '@/lib/gsap';
import { dur, hero, REVEAL_START } from '@/lib/motion';

interface DrawFrameProps {
  /** viewBox of the frame (same aspect as the photo, so the stroke never distorts). */
  viewBox: string;
  /** The band's path in viewBox units. */
  d: string;
  strokeWidth: number;
  /** Above the fold: draw right after load. Otherwise: when scrolled into view, once. */
  onLoad?: boolean;
  className?: string;
}

/**
 * The marigold band of the CR-01 curved photo frame (CurvedFrame). It draws along the
 * curve (DrawSVG, stroke-dashoffset only) as the photo appears. Hidden under html.js-motion
 * until drawn; reduced motion fades it in; without JS it is simply there. Decorative.
 */
export function DrawFrame({ viewBox, d, strokeWidth, onLoad = false, className }: DrawFrameProps) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = ref.current;
      const path = svg?.querySelector('path');
      if (!svg || !path || !motionEnabled()) return;
      const scrollTrigger = onLoad ? undefined : { trigger: svg, start: REVEAL_START, once: true };
      const mm = gsap.matchMedia();
      mm.add(MM, (ctx) =>
        whenNear(svg, ctx, () => {
          if (readConditions(ctx).reduce) {
            gsap.to(svg, { opacity: 1, duration: dur.reduce, scrollTrigger });
            return;
          }
          gsap.set(svg, { opacity: 1 });
          gsap.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: dur.frame, delay: onLoad ? hero.frame : 0, ease: 'growth', scrollTrigger });
        }),
      );
    },
    { scope: ref, dependencies: [onLoad] },
  );

  return (
    <svg ref={ref} data-frame-band="" viewBox={viewBox} aria-hidden="true" focusable="false" className={className}>
      <path d={d} fill="none" strokeWidth={strokeWidth} strokeLinecap="round" className="stroke-marigold-400" />
    </svg>
  );
}
