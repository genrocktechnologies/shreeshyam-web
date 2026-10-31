'use client';

import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { gsap, motionEnabled, MM, readConditions, useGSAP } from '@/lib/gsap';
import { dur, hero } from '@/lib/motion';

/**
 * The hero <h1>. It rises via the CSS `animate-hero-title` keyframes from first paint
 * (it is the mobile LCP element, so it must not wait for JS). Once it has landed, the
 * Kalam accent word's marigold underline draws. Children arrive server-rendered (with
 * the <Accent> markup), so no message formatting ships to the client.
 */
export function HeroTitle({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const svg = ref.current?.querySelector<SVGSVGElement>('[data-accent-underline]');
      const path = svg?.querySelector('path');
      if (!svg || !path || !motionEnabled()) return;
      // The CSS rise started at first paint; draw once it has finished, whenever
      // hydration happened.
      const landsAt = hero.title + dur.base + hero.underlineGap;
      const delay = Math.max(0, landsAt - performance.now() / 1000);
      const mm = gsap.matchMedia();
      mm.add(MM, (ctx) => {
        if (readConditions(ctx).reduce) {
          gsap.to(svg, { opacity: 1, duration: dur.reduce });
          return;
        }
        gsap.set(svg, { opacity: 1 });
        gsap.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: dur.underline, delay, ease: 'growth' });
      });
    },
    { scope: ref },
  );

  return (
    <h1 ref={ref} className={cn('animate-hero-title', className)}>
      {children}
    </h1>
  );
}
