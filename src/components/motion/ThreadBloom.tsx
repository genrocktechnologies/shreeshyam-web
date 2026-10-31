'use client';

import { useRef } from 'react';
import { cx } from '@/lib/cx';
import { gsap, motionEnabled, MM, readConditions, useGSAP, whenNear } from '@/lib/gsap';
import { dur, stagger, trigger } from '@/lib/motion';

const PETALS = 5;
const C = 32; // centre of the 64×64 viewBox

/**
 * The end of the golden thread (motion-spec story, step 6): a 5-petal marigold bloom.
 * When its section scrolls in, the petals scale out from the centre one after another
 * (radially), then the centre pops. Reduced motion: a fade. No JS: shown open. Size it
 * with className and centre it on the thread column.
 */
export function ThreadBloom({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg || !motionEnabled()) return;
      const scrollTrigger = { trigger: svg, start: trigger.bloomStart, once: true };
      const mm = gsap.matchMedia();
      mm.add(MM, (ctx) =>
        whenNear(svg, ctx, () => {
          if (readConditions(ctx).reduce) {
            gsap.fromTo(svg, { opacity: 0 }, { opacity: 1, duration: dur.reduce, scrollTrigger });
            return;
          }
          gsap.set(svg, { opacity: 1 });
          gsap
            .timeline({ scrollTrigger, defaults: { ease: 'growth', svgOrigin: `${C} ${C}` } })
            .from(svg.querySelectorAll('[data-petal]'), { scale: 0, duration: dur.petal, stagger: stagger.petal })
            .from(svg.querySelector('[data-bloom-centre]'), { scale: 0, duration: dur.seed }, `-=${dur.petal / 2}`);
        })
      );
    },
    { scope: ref },
  );

  return (
    <svg ref={ref} data-bloom="" viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={cx('pointer-events-none overflow-visible', className)}>
      {Array.from({ length: PETALS }, (_, i) => (
        <g key={i} transform={`rotate(${(360 / PETALS) * i} ${C} ${C})`}>
          <g data-petal="">
            <ellipse cx={C} cy={C - 15} rx="9" ry="15" className="fill-marigold-400" />
            <ellipse cx={C} cy={C - 17} rx="3.5" ry="9" className="fill-marigold-200" />
          </g>
        </g>
      ))}
      <g data-bloom-centre="">
        <circle cx={C} cy={C} r="8" className="fill-marigold-600" />
        <circle cx={C - 2} cy={C - 2} r="2.5" className="fill-marigold-200" />
      </g>
    </svg>
  );
}
