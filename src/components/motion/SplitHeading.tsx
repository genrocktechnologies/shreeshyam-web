'use client';

import { useLocale } from 'next-intl';
import { useRef, type ReactNode } from 'react';
import { gsap, motionEnabled, MM, readConditions, SplitText, useGSAP } from '@/lib/gsap';
import { dur, REVEAL_START, stagger } from '@/lib/motion';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'p';

interface SplitHeadingProps {
  children: ReactNode;
  as?: HeadingTag;
  /** `load` plays on mount (page heroes); `scroll` plays when scrolled into view. */
  trigger?: 'load' | 'scroll';
  delay?: number;
  className?: string;
}

/**
 * Masked line reveal for headings. English splits by lines; Hindi splits by words only,
 * because character splits break Devanagari conjuncts. The split is reverted when the
 * animation ends so the DOM and accessible name stay clean.
 */
export function SplitHeading({ children, as: Tag = 'h2', trigger = 'scroll', delay = 0, className }: SplitHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const byWords = useLocale() === 'hi';

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !motionEnabled()) return;
      const mm = gsap.matchMedia();
      const scrollTrigger = trigger === 'scroll' ? { trigger: el, start: REVEAL_START, once: true } : undefined;

      mm.add(MM, (ctx) => {
        if (readConditions(ctx).reduce) {
          gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2, delay, scrollTrigger });
          return;
        }

        let split: SplitText | undefined;
        // Line breaks depend on the web font, so wait for it before measuring. ctx.add keeps
        // the deferred tweens inside the context so they are reverted on unmount.
        document.fonts.ready.then(() => ctx.add(() => {
          if (!el.isConnected) return;
          split = SplitText.create(el, {
            type: byWords ? 'words' : 'lines',
            mask: byWords ? 'words' : 'lines',
            aria: 'auto',
          });
          gsap.set(el, { opacity: 1 });
          gsap.from(byWords ? split.words : split.lines, {
            yPercent: 105,
            duration: dur.base,
            ease: 'growth',
            stagger: stagger.tight,
            delay,
            scrollTrigger,
            onComplete: () => {
              split?.revert();
              split = undefined;
            },
          });
        }));

        return () => split?.revert();
      });
    },
    { scope: ref, dependencies: [byWords, trigger, delay] },
  );

  return (
    <Tag ref={ref} data-split="" className={className}>
      {children}
    </Tag>
  );
}
