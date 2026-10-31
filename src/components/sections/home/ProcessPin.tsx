'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, motionEnabled, MM, readConditions, useGSAP } from '@/lib/gsap';
import { distance, pin, trigger } from '@/lib/motion';

const CLOSED = 'inset(100% 0% 0% 0% round 20px)';
const OPEN = 'inset(0% 0% 0% 0% round 20px)';

/**
 * Desktop storytelling for the Process section (motion-spec, Home §7), around
 * server-rendered markup:
 * - Sets `data-pinned`, which stacks the 3 steps in one grid cell (CSS) and swaps the
 *   plain thread for the numbered rail.
 * - Pins for `pin.process` extra screens. The rail fill runs from badge 01 down to the
 *   bottom of the section; as it reaches each badge (positions measured, so it lines up at
 *   any viewport), that badge fills, the step text cross-fades and the photo wipes up.
 * Below lg, under reduced motion, on low-end devices or without JS: a vertical stepper on
 * the thread with per-step reveals.
 */
export function ProcessPin({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section || !motionEnabled()) return;
      const mm = gsap.matchMedia();

      mm.add(MM, (ctx) => {
        if (!readConditions(ctx).isDesktop) return;
        section.dataset.pinned = '';
        const q = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, section);
        const texts = q('[data-step-text]');
        const images = q('[data-step-image]');
        const badges = q('[data-process-badge]');
        const nodes = q('[data-process-node]');
        const fill = section.querySelector<HTMLElement>('[data-process-fill]');
        const steps = texts.length;
        if (!fill || steps < 2) return;

        gsap.set(texts.slice(1), { opacity: 0, y: distance.reveal });
        gsap.set(images.slice(1), { clipPath: CLOSED });
        gsap.set(badges[0], { opacity: 1 });

        // Timeline unit = one step: the fill starts at badge 01 and reaches badge k at time k,
        // then runs on to the bottom of the section during the last step.
        const at = (k: number) => {
          // The rail column, not the fill: the fill's own box is scaled by this very tween.
          const rail = (fill.parentElement ?? fill).getBoundingClientRect();
          const node = nodes[k]?.getBoundingClientRect();
          return node ? (node.top + node.height / 2 - rail.top) / rail.height : 1;
        };
        const f = pin.stepFade;
        const tl = gsap.timeline({
          defaults: { ease: 'inOut' },
          scrollTrigger: {
            trigger: section,
            start: trigger.pinStart,
            end: () => `+=${window.innerHeight * pin.process}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        for (let k = 0; k < steps; k++) {
          tl.fromTo(fill, { scaleY: () => at(k) }, { scaleY: () => at(k + 1), duration: 1, ease: 'none', immediateRender: k === 0 }, k);
        }
        for (let k = 1; k < steps; k++) {
          tl.to(texts[k - 1], { opacity: 0, y: -distance.reveal, duration: f }, k - f)
            .to(texts[k], { opacity: 1, y: 0, duration: f }, k - f / 2)
            .to(images[k], { clipPath: OPEN, duration: f * 1.5 }, k - f)
            .to(badges[k], { opacity: 1, duration: f / 3 }, k - f / 6);
        }

        return () => {
          delete section.dataset.pinned;
        };
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="process" className={className}>
      {children}
    </section>
  );
}
