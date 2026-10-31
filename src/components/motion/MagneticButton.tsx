'use client';

import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { media } from '@/lib/motion';

interface MagneticButtonProps {
  children: ReactNode;
  /** Maximum pull toward the cursor in px. */
  strength?: number;
  className?: string;
}

// Spring constants from the motion spec (stiffness 300, damping 20, mass 1). Implemented
// here instead of with the `motion` library, which would add ~45 KB gzip to every page
// that has a primary CTA.
const STIFFNESS = 300;
const DAMPING = 20;
const REST = 0.01;

/**
 * Wraps a primary CTA so it drifts up to `strength` px toward the cursor. Fine pointers
 * only; touch and reduced-motion users get a static button.
 */
export function MagneticButton({ children, strength = 6, className }: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const state = useRef({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, raf: 0, last: 0 });

  useEffect(() => () => cancelAnimationFrame(state.current.raf), []);

  const step = (now: number) => {
    const s = state.current;
    const dt = Math.min((now - (s.last || now)) / 1000, 1 / 30);
    s.last = now;
    // Semi-implicit Euler: a = -k(x - target) - c·v (mass 1).
    s.vx += (-STIFFNESS * (s.x - s.tx) - DAMPING * s.vx) * dt;
    s.vy += (-STIFFNESS * (s.y - s.ty) - DAMPING * s.vy) * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    const settled =
      Math.abs(s.x - s.tx) < REST && Math.abs(s.y - s.ty) < REST && Math.abs(s.vx) < REST && Math.abs(s.vy) < REST;
    if (settled) {
      s.x = s.tx;
      s.y = s.ty;
    }
    if (ref.current) ref.current.style.transform = s.x || s.y ? `translate3d(${s.x}px, ${s.y}px, 0)` : '';
    s.raf = settled ? 0 : requestAnimationFrame(step);
  };

  const pullTo = (tx: number, ty: number) => {
    const s = state.current;
    s.tx = tx;
    s.ty = ty;
    if (!s.raf) {
      s.last = 0;
      s.raf = requestAnimationFrame(step);
    }
  };

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    if (!window.matchMedia(media.finePointer).matches || window.matchMedia(media.reduce).matches) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    pullTo(Math.max(-1, Math.min(1, dx)) * strength, Math.max(-1, Math.min(1, dy)) * strength);
  };
  const reset = () => pullTo(0, 0);

  return (
    <span ref={ref} onPointerMove={onMove} onPointerLeave={reset} onBlur={reset} className={cn('inline-block', className)}>
      {children}
    </span>
  );
}
