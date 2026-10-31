'use client';

import { useRef } from 'react';
import { cn } from '@/lib/cn';
import { gsap, motionEnabled, MM, readConditions, useGSAP } from '@/lib/gsap';
import { dur, ease, REVEAL_START } from '@/lib/motion';

interface CountUpProps {
  /** The value exactly as published, e.g. "1200+" or "98%". */
  value: string;
  duration?: number;
  className?: string;
}

const NUMBER = /^(\D*?)(\d+(?:\.\d+)?)(.*)$/;

/**
 * Counts from 0 to the target when scrolled into view, keeping any prefix/suffix.
 * The final value is server-rendered (SEO, no-JS) and reduced motion keeps it as is.
 * A pseudo-element holding the final value reserves the width, so counting never
 * shifts layout.
 */
export function CountUp({ value, duration = dur.count, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const match = value.match(NUMBER);
      if (!el || !match || !motionEnabled()) return;
      const [, prefix, digits, suffix] = match;
      const target = parseFloat(digits);
      const decimals = digits.split('.')[1]?.length ?? 0;
      const mm = gsap.matchMedia();

      mm.add(MM, (ctx) => {
        if (readConditions(ctx).reduce) return;
        const counter = { n: 0 };
        const render = () => {
          el.textContent = `${prefix}${counter.n.toFixed(decimals)}${suffix}`;
        };
        render();
        gsap.to(counter, {
          n: target,
          duration,
          ease: ease.count,
          onUpdate: render,
          scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
        });
        return () => {
          el.textContent = value;
        };
      });
    },
    { scope: ref, dependencies: [value, duration] },
  );

  return (
    <span
      data-final={value}
      className={cn(
        'inline-grid tabular-nums before:invisible before:content-[attr(data-final)] before:[grid-area:1/1]',
        className,
      )}
    >
      <span ref={ref} className="[grid-area:1/1]">
        {value}
      </span>
    </span>
  );
}
