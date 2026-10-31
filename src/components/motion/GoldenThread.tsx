'use client';

import { useId, useRef } from 'react';
import { cn } from '@/lib/cn';
import { gsap, motionEnabled, MM, readConditions, useGSAP } from '@/lib/gsap';

interface GoldenThreadProps {
  /** SVG path data in the viewBox's coordinates. */
  d: string;
  viewBox?: string;
  /** Element whose scroll progress drives the drawing; defaults to the parent element. */
  trigger?: string;
  /** Stretch to the container (paths keep a constant stroke width). */
  preserveAspectRatio?: string;
  className?: string;
}

/**
 * One segment of the signature marigold thread. It draws from 0% to 100%, scrubbed to
 * its section's scroll. Desktop adds a soft blurred glow; mobile uses a lighter stroke.
 * Under reduced motion (or without JS) it is shown fully drawn.
 */
export function GoldenThread({ d, viewBox = '0 0 100 100', trigger, preserveAspectRatio = 'none', className }: GoldenThreadProps) {
  const ref = useRef<SVGSVGElement>(null);
  const glowId = useId().replace(/:/g, '');

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg || !motionEnabled()) return;
      const triggerEl = (trigger ? document.querySelector(trigger) : svg.parentElement) ?? svg;
      const mm = gsap.matchMedia();

      mm.add(MM, (ctx) => {
        gsap.set(svg, { opacity: 1 });
        if (readConditions(ctx).reduce) return;
        // The glow path is display:none below desktop; DrawSVG can't measure hidden paths.
        const paths = Array.from(svg.querySelectorAll('path')).filter((p) => getComputedStyle(p).display !== 'none');
        gsap.fromTo(
          paths,
          { drawSVG: '0%' },
          {
            drawSVG: '100%',
            ease: 'none',
            scrollTrigger: { trigger: triggerEl, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
          },
        );
      });
    },
    { scope: ref, dependencies: [d, trigger] },
  );

  return (
    <svg
      ref={ref}
      data-thread=""
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      aria-hidden="true"
      focusable="false"
      className={cn('pointer-events-none overflow-visible', className)}
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {/* Glow: a duplicated, blurred marigold-200 path at 40%, desktop only. */}
      <path
        d={d}
        fill="none"
        className="hidden stroke-marigold-200 opacity-40 lg:block"
        strokeWidth={6}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        filter={`url(#${glowId})`}
      />
      <path
        d={d}
        fill="none"
        className="stroke-marigold-400 [stroke-width:2px] lg:[stroke-width:2.5px]"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
