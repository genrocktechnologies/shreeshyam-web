'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, motionEnabled, MM, readConditions, SplitText, useGSAP, whenNear } from '@/lib/gsap';
import { dur, opacity, scrub, stagger, trigger } from '@/lib/motion';

interface ReadingHighlightProps {
  /** Paragraph(s). Rich text such as <strong> is kept. */
  children: ReactNode;
  className?: string;
}

/**
 * Scroll-linked reading highlight (About, desktop): each word goes from faint to full
 * ink as the block scrolls through the viewport. It animates opacity only (the
 * transform/opacity rule), which reads the same as ink-faint → ink. Below desktop,
 * on low-end devices and under reduced motion it is a plain Reveal, because a word
 * scrub is too heavy for phones.
 * Words are split with aria "none": screen readers still read the paragraph normally.
 */
export function ReadingHighlight({ children, className }: ReadingHighlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !motionEnabled()) return;
      const mm = gsap.matchMedia();

      mm.add(MM, (ctx) =>
        whenNear(el, ctx, () => {
          const { isDesktop, reduce } = readConditions(ctx);
          if (!isDesktop) {
            gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: reduce ? dur.reduce : dur.base, scrollTrigger: { trigger: el, start: trigger.reveal, once: true } });
            return;
          }
          gsap.set(el, { opacity: 1 });
          let split: SplitText | undefined;
          document.fonts.ready.then(() =>
            ctx.add(() => {
              if (!el.isConnected) return;
              split = SplitText.create(el.querySelectorAll('p'), { type: 'words', aria: 'none' });
              gsap.fromTo(
                split.words,
                { opacity: opacity.highlightFrom },
                {
                  opacity: 1,
                  ease: 'none',
                  stagger: stagger.highlight,
                  scrollTrigger: { trigger: el, start: trigger.highlightStart, end: trigger.highlightEnd, scrub: scrub.highlight },
                },
              );
            }),
          );
          return () => split?.revert();
        })
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-reveal="self" className={className}>
      {children}
    </div>
  );
}
