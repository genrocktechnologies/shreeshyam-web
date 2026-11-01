import { DrawFrame } from '@/components/motion';
import type { PhotoKey } from '@/data/images';
import { cn } from '@/lib/cn';
import { Picture } from './Picture';

/**
 * Geometry of the CR-01 signature frame, in a 160 × 100 viewBox (the panel's 16:10).
 * The photo is a rounded rectangle whose left edge is one organic curve; the band follows
 * the same curve just outside it. The clip repeats the photo path in 0–1 units
 * (clipPathUnits="objectBoundingBox"), so it scales with the frame at any width.
 */
const VIEWBOX = '0 0 160 100';
const CLIP = 'M0.2125,0 H0.95 Q1,0 1,0.08 V0.92 Q1,1 0.95,1 H0.0375 C0,0.64 0.0625,0.26 0.2125,0 Z';
const BAND = 'M29,-3 C6,24 -5,62 1,103';
/** ≈ 12px at a 560px-wide frame (CR-01: a 10–14px band). */
const BAND_WIDTH = 3.4;

interface CurvedFrameProps {
  image: PhotoKey;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** `hero`: band draws right after load. `reveal`: band draws on scroll. `none`: static. */
  motion?: 'hero' | 'reveal' | 'none';
  className?: string;
}

/**
 * CR-01 curved photo panel (design-system, Photo frames → panel). Used through PhotoFrame
 * for images whose frame is `panel`. The photo itself is never hidden or masked by motion,
 * so it can be the LCP element; only the marigold band animates (stroke-dashoffset).
 */
export function CurvedFrame({ image, alt, sizes, priority = false, motion = 'reveal', className }: CurvedFrameProps) {
  const clipId = `curved-${image}`;
  const band = 'pointer-events-none absolute inset-0 h-full w-full overflow-visible';

  return (
    <div data-photo-frame="panel" className={cn('relative', className)} style={{ aspectRatio: '16 / 10' }}>
      <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={CLIP} />
          </clipPath>
        </defs>
      </svg>
      <div className="absolute inset-0" style={{ clipPath: `url(#${clipId})` }}>
        <Picture image={image} alt={alt} sizes={sizes} priority={priority} className="block h-full w-full" imgClassName="h-full w-full object-cover" />
      </div>
      {motion === 'none' ? (
        <svg viewBox={VIEWBOX} aria-hidden="true" focusable="false" className={band}>
          <path d={BAND} fill="none" strokeWidth={BAND_WIDTH} strokeLinecap="round" className="stroke-marigold-400" />
        </svg>
      ) : (
        <DrawFrame viewBox={VIEWBOX} d={BAND} strokeWidth={BAND_WIDTH} onLoad={motion === 'hero'} className={band} />
      )}
    </div>
  );
}
