'use client';

import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { gsap, motionEnabled, MM, readConditions, useGSAP } from '@/lib/gsap';
import { dur, REVEAL_START } from '@/lib/motion';

interface ImageRevealProps {
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
 * settles from scale 1.15 to 1. Reduced motion: a plain fade.
 */
export function ImageReveal({ children, shape = 'arch', trigger = 'scroll', delay = 0, className }: ImageRevealProps) {
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
          gsap.fromTo(el, { opacity: 0, clipPath: open }, { opacity: 1, duration: 0.2, delay, scrollTrigger });
          return;
        }
        const tl = gsap.timeline({ delay, scrollTrigger, defaults: { duration: dur.slow, ease: 'growth' } });
        tl.fromTo(el, { clipPath: `inset(100% 0% 0% 0% ${ROUND[shape]})` }, { clipPath: open });
        if (media) tl.fromTo(media, { scale: 1.15 }, { scale: 1, clearProps: 'transform' }, 0);
      });
    },
    { scope: ref, dependencies: [shape, trigger, delay] },
  );

  return (
    <div
      ref={ref}
      data-image-reveal={shape}
      className={cn('overflow-hidden', shape === 'arch' ? 'rounded-arch' : 'rounded-2xl', className)}
    >
      {children}
    </div>
  );
}
