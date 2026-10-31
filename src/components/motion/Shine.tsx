'use client';

import { useRef } from 'react';
import { gsap, motionEnabled, MM, readConditions, useGSAP, whenNear } from '@/lib/gsap';
import { dur, trigger } from '@/lib/motion';

/**
 * One gentle light sweep across a frame, once, when it is well in view (the award photo,
 * motion-spec Home §8). Desktop only; nothing on phones, under reduced motion or without
 * JS (the band starts off-frame, so it is invisible unless animated). Place it inside a
 * `relative overflow-hidden` wrapper with the frame's corners.
 */
export function Shine() {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const band = ref.current;
      if (!band || !motionEnabled()) return;
      const mm = gsap.matchMedia();
      mm.add(MM, (ctx) =>
        whenNear(band, ctx, () => {
          if (!readConditions(ctx).isDesktop) return;
          gsap.fromTo(
            band,
            { xPercent: -100 },
            { xPercent: 350, duration: dur.shine, ease: 'inOut', scrollTrigger: { trigger: band.parentElement, start: trigger.shineStart, once: true } },
          );
        })
      );
    },
    { scope: ref },
  );

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 w-2/5 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-ivory/35 to-transparent"
    />
  );
}
