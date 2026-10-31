'use client';

import { useEffect, useState } from 'react';
import { scroll } from './motion';

interface Options {
  /** Scroll offset (px) after which `scrolled` is true. */
  threshold?: number;
  /** Below this offset the element is never hidden. */
  hideAfter?: number;
  /** Ignore jitter smaller than this (px) when deciding direction. */
  tolerance?: number;
}

/**
 * `scrolled`: past the threshold. `hidden`: scrolling down past `hideAfter` (cleared
 * as soon as the user scrolls up). Works with native scroll and Lenis, which both move
 * window.scrollY. Updates are batched to one per animation frame.
 */
export function useScrollState({ threshold = scroll.solidAfter, hideAfter = scroll.headerHideAfter, tolerance = scroll.tolerance }: Options = {}) {
  const [state, setState] = useState({ scrolled: false, hidden: false });

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - last;
      setState((prev) => {
        let hidden = prev.hidden;
        if (y <= hideAfter) hidden = false;
        else if (delta > tolerance) hidden = true;
        else if (delta < -tolerance) hidden = false;
        const scrolled = y > threshold;
        return prev.scrolled === scrolled && prev.hidden === hidden ? prev : { scrolled, hidden };
      });
      if (Math.abs(delta) > tolerance || y <= hideAfter) last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [threshold, hideAfter, tolerance]);

  return state;
}
