'use client';

import { useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { gsap, motionEnabled, MM, readConditions, useGSAP } from '@/lib/gsap';
import { dur, REVEAL_START, scale } from '@/lib/motion';

interface ImageRevealProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  children: ReactNode;
  /** `arch` = jharokha mask (999px 999px 28px 28px); `rounded` = 20px card radius. */
  shape?: 'arch' | 'rounded';
  trigger?: 'load' | 'scroll';
  delay?: number;
  className?: string;
}

const ROUND = { arch: 'round 999px 999px 28px 28px', rounded: 'round 20px' } as const;

/**
 * Opens the image's mask from the bottom up (clip-path inset 100% → 0) while the image
 * settles from scale.imageFrom to 1. Reduced motion: a plain fade.
 */
export function ImageReveal({ children, shape = 'arch', trigger = 'scroll', delay = 0, className, ...rest }: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !motionEnabled()) return;
      const media = el.firstElementChild;
      const scrollTrigger = trigger === 'scroll' ? { trigger: el, start: REVEAL_START, once: true } : undefined;
      const open = `inset(0% 0% 0% 0% ${ROUND[shape]})`;
      const mm = gsap.matchMedia();

      mm.add(MM, (ctx) => {
        if (readConditions(ctx).reduce) {
          gsap.fromTo(el, { opacity: 0, clipPath: open }, { opacity: 1, duration: dur.reduce, delay, scrollTrigger });
          return;
        }
        const tl = gsap.timeline({ delay, scrollTrigger, defaults: { duration: dur.slow, ease: 'growth' } });
        tl.fromTo(el, { clipPath: `inset(100% 0% 0% 0% ${ROUND[shape]})` }, { clipPath: open });
        if (media) tl.fromTo(media, { scale: scale.imageFrom }, { scale: 1, clearProps: 'transform' }, 0);
      });
    },
    { scope: ref, dependencies: [shape, trigger, delay] },
  );

  return (
    <div
      ref={ref}
      data-image-reveal={shape}
      {...rest}
      className={cn('overflow-hidden', shape === 'arch' ? 'rounded-arch' : 'rounded-2xl', className)}
    >
      {children}
    </div>
  );
}
