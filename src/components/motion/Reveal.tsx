'use client';

import { useRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { gsap, motionEnabled, MM, readConditions, useGSAP, whenNear } from '@/lib/gsap';
import { distance, dur, REVEAL_START, stagger as staggerTokens } from '@/lib/motion';

interface RevealProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'> {
  children: ReactNode;
  /** Animate each direct child in turn instead of the wrapper as a whole. */
  stagger?: boolean | keyof typeof staggerTokens;
  /** Start scale for the entrance (e.g. 0.98 for service cards). */
  fromScale?: number;
  delay?: number;
  as?: ElementType;
  className?: string;
}

/**
 * Fades content up `distance.reveal` px when it scrolls into view (once). Under reduced
 * motion it is a 0.2s opacity fade. Start states live in CSS under `html.js-motion`.
 */
export function Reveal({ children, stagger, fromScale, delay = 0, as: Tag = 'div', className, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !motionEnabled()) return;
      const targets = stagger ? Array.from(el.children) : [el];
      const each = stagger ? staggerTokens[stagger === true ? 'base' : stagger] : 0;
      const mm = gsap.matchMedia();

      mm.add(MM, (ctx) =>
        whenNear(el, ctx, () => {
          const { reduce } = readConditions(ctx);
          const trigger = { trigger: el, start: REVEAL_START, once: true };
          if (reduce) {
            gsap.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: dur.reduce, stagger: each && staggerTokens.reduce, delay, scrollTrigger: trigger });
            return;
          }
          gsap.fromTo(
            targets,
            { opacity: 0, y: distance.reveal, scale: fromScale ?? 1 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: dur.base,
              ease: 'growth',
              stagger: each,
              delay,
              clearProps: 'transform',
              scrollTrigger: trigger,
            },
          );
        })
      );
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} {...rest} data-reveal={stagger ? 'stagger' : 'self'} className={className}>
      {children}
    </Tag>
  );
}
