'use client';

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { gsap, markMotionReady, ScrollTrigger } from '@/lib/gsap';
import { HEADER_OFFSET, isLowEnd, media } from '@/lib/motion';

const LenisContext = createContext<Lenis | null>(null);

/** The active Lenis instance, or null on touch, small screens, low-end devices and reduced motion. */
export function useLenis() {
  return useContext(LenisContext);
}

const SMOOTH_QUERY = `${media.desktop} and ${media.finePointer} and ${media.noPreference}`;

/**
 * Desktop-only smooth scroll (Lenis) driven by the GSAP ticker and synced with
 * ScrollTrigger. Everywhere else the browser's native scroll is used.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    markMotionReady();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    const mql = window.matchMedia(SMOOTH_QUERY);
    let instance: Lenis | null = null;
    const tick = (time: number) => instance?.raf(time * 1000);

    const start = () => {
      if (instance || !mql.matches || isLowEnd()) return;
      instance = new Lenis({ lerp: 0.1, autoRaf: false, anchors: { offset: -HEADER_OFFSET } });
      instance.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setLenis(instance);
    };
    const stop = () => {
      if (!instance) return;
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      instance = null;
      setLenis(null);
    };
    const onChange = () => (mql.matches ? start() : stop());

    start();
    mql.addEventListener('change', onChange);
    return () => {
      mql.removeEventListener('change', onChange);
      stop();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
