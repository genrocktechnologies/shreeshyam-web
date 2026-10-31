'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cx } from '@/lib/cx';
import { gsap, motionEnabled, MM, readConditions, useGSAP, whenNear } from '@/lib/gsap';
import { scrub as scrubTokens, trigger as triggerTokens } from '@/lib/motion';

interface GoldenThreadProps {
  /** SVG path data in a 0–100 × 0–100 space (absolute or relative M/L/H/V/C/S/Q/T/Z). */
  d?: string;
  /**
   * Wrap mode (story step 5, the award frame): a selector for an element inside the SVG's
   * parent. The path comes down the thread column, runs around three sides of that
   * element (top, right, bottom) and continues down. The SVG must cover the parent
   * (`absolute inset-0 h-full w-full`); `d` is ignored.
   */
  wrap?: string;
  /** Element whose scroll progress drives the drawing; defaults to the parent element. */
  trigger?: string;
  /** ScrollTrigger start/end; default to the section-thread tokens. */
  start?: string;
  end?: string;
  scrub?: number | boolean;
  className?: string;
}

const PAIR_COMMANDS = 'MLCSQTmlcsqt';

/** Wrap mode: gap between the wrapped element and the thread, and the corner radius (px). */
const WRAP_GAP = 14;
const WRAP_RADIUS = 34;

/** Pixel path for wrap mode: thread x from --thread-x, the target's box from layout. */
function wrapPath(svg: SVGSVGElement, target: Element, w: number, h: number): string {
  const box = svg.getBoundingClientRect();
  const r = target.getBoundingClientRect();
  const tx = parseFloat(getComputedStyle(svg).getPropertyValue('--thread-x')) || 0;
  const y0 = Math.max(WRAP_RADIUS, r.top - box.top - WRAP_GAP);
  const y1 = Math.min(h - WRAP_RADIUS, r.bottom - box.top + WRAP_GAP);
  const x1 = Math.min(w, r.right - box.left + WRAP_GAP);
  const R = WRAP_RADIUS;
  const n = (v: number) => Math.round(v * 10) / 10;
  return [
    `M${n(tx)} 0`,
    `V${n(y0 - R)}`,
    `Q${n(tx)} ${n(y0)} ${n(tx + R)} ${n(y0)}`,
    `H${n(x1 - R)}`,
    `Q${n(x1)} ${n(y0)} ${n(x1)} ${n(y0 + R)}`,
    `V${n(y1 - R)}`,
    `Q${n(x1)} ${n(y1)} ${n(x1 - R)} ${n(y1)}`,
    `H${n(tx + R)}`,
    `Q${n(tx)} ${n(y1)} ${n(tx)} ${n(y1 + R)}`,
    `V${n(h)}`,
  ].join(' ');
}

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
  d = 'M50 0 V100',
  wrap,
  trigger,
  start = triggerTokens.threadStart,
  end = triggerTokens.threadEnd,
  scrub = scrubTokens.thread,
  className,
}: GoldenThreadProps) {
  const ref = useRef<SVGSVGElement>(null);
  const glowId = useId().replace(/:/g, '');
  // Rendered size in px; null until measured (server render / no JS: stretched 0–100).
  const [size, setSize] = useState<{ w: number; h: number; wrapD?: string } | null>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const target = wrap ? svg.parentElement?.querySelector(wrap) : null;
    const measure = () => {
      const r = svg.getBoundingClientRect();
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      if (!w || !h) return;
      const wrapD = target ? wrapPath(svg, target, w, h) : undefined;
      setSize((s) => (s && s.w === w && s.h === h && s.wrapD === wrapD ? s : { w, h, wrapD }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(svg);
    if (target) ro.observe(target);
    return () => ro.disconnect();
  }, [wrap]);

  // Wrap mode needs layout, so it draws nothing until measured (and nothing without JS).
  // Only the unmeasured fallback (no JS) is stretched by preserveAspectRatio="none" and
  // needs a non-scaling stroke. Once measured the SVG is drawn 1:1 in pixels; leaving
  // vector-effect on would make DrawSVG call getScreenCTM + getTotalLength on every
  // scroll frame (≈30% of main-thread time while scrolling, 4× CPU throttle).
  const stretch = size ? undefined : 'non-scaling-stroke';
  const pathD = wrap ? size?.wrapD ?? '' : size ? scalePath(d, size.w / 100, size.h / 100) : d;

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg || !motionEnabled()) return;
      const triggerEl = (trigger ? document.querySelector(trigger) : svg.parentElement) ?? svg;
      const mm = gsap.matchMedia();

      mm.add(MM, (ctx) =>
        whenNear(svg, ctx, () => {
          if (readConditions(ctx).reduce) {
            gsap.set(svg, { opacity: 1 });
            return;
          }
          if (!size) return; // wait for pixel-space geometry before measuring lengths
          gsap.set(svg, { opacity: 1 });
          // The glow path is display:none below desktop; DrawSVG can't measure hidden paths.
          const paths = Array.from(svg.querySelectorAll('path')).filter((p) => getComputedStyle(p).display !== 'none');
          gsap.fromTo(paths, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: triggerEl, start, end, scrub } });
        })
      );
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
      className={cx('pointer-events-none overflow-visible', className)}
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
        vectorEffect={stretch}
        filter={`url(#${glowId})`}
      />
      <path
        d={pathD}
        fill="none"
        className="stroke-marigold-400 [stroke-width:2px] lg:[stroke-width:2.5px]"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect={stretch}
      />
    </svg>
  );
}
