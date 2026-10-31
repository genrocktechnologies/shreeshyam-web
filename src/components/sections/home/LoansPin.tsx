'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, motionEnabled, MM, readConditions, useGSAP } from '@/lib/gsap';
import { pin, trigger } from '@/lib/motion';

/**
 * Desktop choreography for the Loans section (motion-spec, Home §6), around
 * server-rendered markup:
 * - Sets `data-pinned` on the section, which switches the card grid to a horizontal
 *   track (CSS, `group-data-[pinned]/loans:`) and shows the thread's branch rail.
 * - Pins the section and scrubs the track sideways by its overflow, while the rail fills
 *   and its 4 branches open one by one as their card arrives.
 * Below lg, under reduced motion, on low-end devices or without JS, nothing is pinned:
 * the cards stay a grid (stacked on phones, with their own branches).
 */
export function LoansPin({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section || !motionEnabled()) return;
      const mm = gsap.matchMedia();

      mm.add(MM, (ctx) => {
        if (!readConditions(ctx).isDesktop) return;
        section.dataset.pinned = '';
        const track = section.querySelector<HTMLElement>('[data-loans-track]');
        const fill = section.querySelector('[data-rail-fill]');
        const branches = gsap.utils.toArray<SVGElement>('[data-rail-branch]', section);
        if (!track || !fill) return;
        const travel = () => Math.max(0, track.scrollWidth - (track.parentElement?.clientWidth ?? 0));

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: trigger.pinStart,
            end: () => `+=${travel()}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        // Timeline length 1 = the whole pin; branch i opens when card i reaches the front.
        tl.to(track, { x: () => -travel(), duration: 1 }, 0).fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
        branches.forEach((b, i) => {
          tl.fromTo(
            b,
            { scale: 0, transformOrigin: '50% 100%' },
            { scale: 1, duration: pin.node, ease: 'growth' },
            (i / Math.max(1, branches.length - 1)) * (1 - pin.node),
          );
        });

        return () => {
          delete section.dataset.pinned;
        };
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="loans" className={className}>
      {children}
    </section>
  );
}
