'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { gsap, motionEnabled, MM, readConditions, useGSAP } from '@/lib/gsap';
import { scrub as scrubTokens, trigger as triggerTokens } from '@/lib/motion';

interface GoldenThreadProps {
  /** SVG path data in a 0–100 × 0–100 space (absolute or relative M/L/H/V/C/S/Q/T/Z). */
  d: string;
  /** Element whose scroll progress drives the drawing; defaults to the parent element. */
  trigger?: string;
  /** ScrollTrigger start/end; default to the section-thread tokens. */
  start?: string;
  end?: string;
  scrub?: number | boolean;
  className?: string;
}

const PAIR_COMMANDS = 'MLCSQTmlcsqt';

/**
 * Scales a 0–100 path to the rendered box (sx, sy per unit). The thread is drawn in real
 * pixel space because DrawSVG measures path length wrongly under a non-uniform
 * preserveAspectRatio="none" stretch: the dash pattern then repeats mid-draw and the
 * line shows gaps.
 */
function scalePath(d: string, sx: number, sy: number): string {
  let cmd = 'M';
  let axis = 0; // 0 = x, 1 = y within coordinate pairs
  return d.replace(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g, (tok) => {
    if (/[A-Za-z]/.test(tok)) {
      if (/[Aa]/.test(tok)) throw new Error('GoldenThread: arc commands are not supported');
      cmd = tok;
      axis = 0;
      return tok;
    }
    const n = parseFloat(tok);
    let v: number;
    if (cmd === 'V' || cmd === 'v') v = n * sy;
    else if (cmd === 'H' || cmd === 'h') v = n * sx;
    else if (PAIR_COMMANDS.includes(cmd)) {
      v = axis === 0 ? n * sx : n * sy;
      axis ^= 1;
    } else v = n;
    return String(Math.round(v * 100) / 100);
  });
}

/**
 * One segment of the signature marigold thread. It draws from 0% to 100%, scrubbed to
 * its section's scroll. Desktop adds a soft blurred glow; mobile uses a lighter stroke.
 * Under reduced motion (or without JS) it is shown fully drawn.
 *
 * Segments line up across sections because each is positioned with `.thread-col`
 * (left: var(--thread-x)) and its path runs through x = 50 of the 0–100 space.
 */
export function GoldenThread({
  d,
  trigger,
  start = triggerTokens.threadStart,
  end = triggerTokens.threadEnd,
  scrub = scrubTokens.thread,
  className,
}: GoldenThreadProps) {
  const ref = useRef<SVGSVGElement>(null);
  const glowId = useId().replace(/:/g, '');
  // Rendered size in px; null until measured (server render / no JS: stretched 0–100).
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const measure = () => {
      const r = svg.getBoundingClientRect();
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      if (w && h) setSize((s) => (s && s.w === w && s.h === h ? s : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(svg);
    return () => ro.disconnect();
  }, []);

  const pathD = size ? scalePath(d, size.w / 100, size.h / 100) : d;

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg || !motionEnabled()) return;
      const triggerEl = (trigger ? document.querySelector(trigger) : svg.parentElement) ?? svg;
      const mm = gsap.matchMedia();

      mm.add(MM, (ctx) => {
        if (readConditions(ctx).reduce) {
          gsap.set(svg, { opacity: 1 });
          return;
        }
        if (!size) return; // wait for pixel-space geometry before measuring lengths
        gsap.set(svg, { opacity: 1 });
        // The glow path is display:none below desktop; DrawSVG can't measure hidden paths.
        const paths = Array.from(svg.querySelectorAll('path')).filter((p) => getComputedStyle(p).display !== 'none');
        gsap.fromTo(paths, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: triggerEl, start, end, scrub } });
      });
    },
    { scope: ref, dependencies: [pathD, trigger, start, end, scrub] },
  );

  return (
    <svg
      ref={ref}
      data-thread=""
      viewBox={size ? `0 0 ${size.w} ${size.h}` : '0 0 100 100'}
      preserveAspectRatio={size ? 'xMidYMid meet' : 'none'}
      aria-hidden="true"
      focusable="false"
      className={cn('pointer-events-none overflow-visible', className)}
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {/* Glow: a duplicated, blurred marigold-200 path at 40%, desktop only. */}
      <path
        d={pathD}
        fill="none"
        className="hidden stroke-marigold-200 opacity-40 lg:block"
        strokeWidth={6}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        filter={`url(#${glowId})`}
      />
      <path
        d={pathD}
        fill="none"
        className="stroke-marigold-400 [stroke-width:2px] lg:[stroke-width:2.5px]"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
