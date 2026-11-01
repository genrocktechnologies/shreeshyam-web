'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, motionEnabled, MM, readConditions, useGSAP } from '@/lib/gsap';
import { dur, REVEAL_START } from '@/lib/motion';

/** Layout position of `node` inside `container` (offsets ignore transforms, e.g. Reveal or hover lifts). */
function offsetIn(node: HTMLElement, container: HTMLElement) {
  let x = 0;
  let y = 0;
  for (let n: HTMLElement | null = node; n && n !== container; n = n.offsetParent as HTMLElement | null) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x, y, w: node.offsetWidth, h: node.offsetHeight };
}

/** Clearance (px) between a line end and a card. */
const GAP = 6;

/**
 * Desktop connectors of the Team tree (CR-01, section 5): marigold SVG strokes drawn TIER
 * TO TIER, never person to person (the real reporting lines are unconfirmed). Between two
 * tiers: a drop from each upper card, one horizontal bar, and a drop into each lower card.
 * It measures the cards inside its parent ([data-tier-cards] lists of [data-tree-card])
 * and re-measures on resize. The lines draw in tier by tier once (DrawSVG); reduced motion
 * shows them drawn. md+ only (phones use the CSS spine). Decorative: aria-hidden.
 */
export function TreeConnectors() {
  const svg = useRef<SVGSVGElement>(null);
  const [geo, setGeo] = useState<{ w: number; h: number; gaps: string[] } | null>(null);

  useEffect(() => {
    const container = svg.current?.parentElement;
    if (!container) return;
    const measure = () => {
      const tiers = Array.from(container.querySelectorAll<HTMLElement>('[data-tier-cards]')).map((list) =>
        Array.from(list.querySelectorAll<HTMLElement>(':scope > li > [data-tree-card]')).map((c) => offsetIn(c, container)),
      );
      const gaps: string[] = [];
      for (let i = 0; i < tiers.length - 1; i++) {
        const [up, down] = [tiers[i], tiers[i + 1]];
        if (!up.length || !down.length) continue;
        const top = Math.max(...up.map((r) => r.y + r.h)) + GAP;
        const bottom = Math.min(...down.map((r) => r.y)) - GAP;
        const mid = Math.round((top + bottom) / 2);
        const cx = (r: { x: number; w: number }) => Math.round(r.x + r.w / 2);
        const xs = [...up, ...down].map(cx);
        gaps.push(
          [
            ...up.map((r) => `M${cx(r)} ${top}V${mid}`),
            `M${Math.min(...xs)} ${mid}H${Math.max(...xs)}`,
            ...down.map((r) => `M${cx(r)} ${mid}V${bottom}`),
          ].join(''),
        );
      }
      setGeo({ w: container.offsetWidth, h: container.offsetHeight, gaps });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const drawn = useRef(false);
  useGSAP(
    () => {
      const el = svg.current;
      if (!el || !geo || drawn.current) return;
      drawn.current = true;
      if (!motionEnabled()) return;
      const paths = el.querySelectorAll('path');
      const mm = gsap.matchMedia();
      mm.add(MM, (ctx) => {
        if (readConditions(ctx).reduce) {
          gsap.to(el, { opacity: 1, duration: dur.reduce });
          return;
        }
        gsap.set(el, { opacity: 1 });
        gsap.fromTo(
          paths,
          { drawSVG: '0%' },
          {
            drawSVG: '100%',
            duration: dur.connector,
            stagger: dur.connector,
            ease: 'growth',
            scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
            // Lengths change when the layout reflows; drop the dash values once drawn.
            onComplete: () => gsap.set(paths, { clearProps: 'strokeDasharray,strokeDashoffset' }),
          },
        );
      });
    },
    { scope: svg, dependencies: [geo] },
  );

  return (
    <svg
      ref={svg}
      data-tree-lines=""
      aria-hidden="true"
      focusable="false"
      width={geo?.w ?? 0}
      height={geo?.h ?? 0}
      viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}
      className="pointer-events-none absolute left-0 top-0 hidden overflow-visible md:block"
    >
      {geo?.gaps.map((d, i) => (
        <path key={i} d={d} fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="stroke-marigold-400" />
      ))}
    </svg>
  );
}
