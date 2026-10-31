'use client';

/* eslint-disable @next/next/no-img-element -- decorative brand file from public/brand */
import { useRef } from 'react';
import { gsap, motionEnabled, MM, readConditions, useGSAP } from '@/lib/gsap';
import { watermark } from '@/lib/motion';

/**
 * The full logo emblem as a faint watermark behind the footer (design-system, Footer).
 * It is a deity image, so it is always shown WHOLE: it is sized to fit inside the footer
 * (never cropped by an edge) and nothing is laid over it as a frame.
 * - Desktop: in the right-hand column the footer reserves for it (no text over it), up to
 *   420px tall (lg) / 520px (xl), clear of the bottom bar, with a slow scroll drift
 *   (watermark.drift, smaller than the 3rem inset, so it never reaches an edge).
 * - Mobile: about 260px, centred behind the top area, static.
 * Decorative: aria-hidden, empty alt, no pointer events. Static under reduced motion.
 */
export function FooterWatermark() {
  const desktop = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const img = desktop.current;
      if (!img || !motionEnabled()) return;
      const footer = img.closest('footer') ?? img;
      const mm = gsap.matchMedia();
      mm.add(MM, (ctx) => {
        if (!readConditions(ctx).isDesktop) return;
        gsap.fromTo(
          img,
          { y: watermark.drift },
          { y: -watermark.drift, ease: 'none', scrollTrigger: { trigger: footer, start: 'top bottom', end: 'bottom bottom', scrub: watermark.scrub } },
        );
      });
    },
    { scope: desktop },
  );

  return (
    <div aria-hidden="true" className="pointer-events-none select-none">
      {/* Desktop: right side, vertically centred, inset so drift never reaches an edge. */}
      <div className="absolute bottom-28 top-12 right-[max(2rem,calc((100%-1240px)/2+2rem))] hidden items-center lg:flex">
        <img
          ref={desktop}
          src="/brand/logo-mark.webp"
          alt=""
          width={512}
          height={594}
          loading="lazy"
          decoding="async"
          className="h-full max-h-[420px] w-auto opacity-[0.07] xl:max-h-[520px]"
        />
      </div>
      {/* Mobile/tablet: smaller, centred behind the top area. */}
      <img
        src="/brand/logo-mark.webp"
        alt=""
        width={512}
        height={594}
        loading="lazy"
        decoding="async"
        className="absolute left-1/2 top-8 h-[260px] w-auto -translate-x-1/2 opacity-[0.07] lg:hidden"
      />
    </div>
  );
}
