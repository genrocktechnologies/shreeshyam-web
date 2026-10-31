import { ImageReveal, Parallax } from '@/components/motion';
import { FRAMES, frameOf, type PhotoKey } from '@/data/images';
import { cn } from '@/lib/cn';
import { Picture } from './Picture';

type FrameMotion =
  /** Static frame. */
  | 'none'
  /** Mask opens when scrolled into view (ImageReveal). */
  | 'reveal'
  /** Reveal + gentle parallax inside the frame (desktop). */
  | 'reveal-parallax'
  /** Above the fold: CSS mask + settle from first paint (no JS wait), parallax on desktop. Arch only. */
  | 'hero';

interface PhotoFrameProps {
  /** Photos only: cut-outs and illustrations are rejected at compile time (PhotoKey). */
  image: PhotoKey;
  /** Translated alt text: t(altKeyFor(image)). */
  alt: string;
  sizes: string;
  priority?: boolean;
  motion?: FrameMotion;
  /** Width/max-width/shadow classes for the frame. Aspect and corners come from the data. */
  className?: string;
}

/**
 * Every content photo goes through this frame. Shape (arch / wide / banner), aspect ratio
 * and focal point all come from IMAGE_META in src/data/images.ts, so framing is data,
 * not CSS hacks. The image always covers the frame (object-cover at the focal point);
 * parallax over-scales and caps its travel, and the reveal mask matches the frame's
 * corners, so no motion ever exposes an empty edge.
 */
export function PhotoFrame({ image, alt, sizes, priority = false, motion = 'reveal', className }: PhotoFrameProps) {
  const frame = frameOf(image);
  if (frame === 'illustration') throw new Error(`PhotoFrame: "${image}" is an illustration/cut-out`);
  const { aspect, radius } = FRAMES[frame];
  if (motion === 'hero' && radius !== 'arch') throw new Error('PhotoFrame: the hero motion is defined for the arch frame only');

  const picture = (
    <Picture
      image={image}
      alt={alt}
      sizes={sizes}
      priority={priority}
      className="block h-full w-full"
      imgClassName="h-full w-full object-cover"
    />
  );
  const shape = radius === 'arch' ? 'rounded-arch' : 'rounded-2xl';
  const style = { aspectRatio: aspect };

  if (motion === 'reveal' || motion === 'reveal-parallax') {
    return (
      <ImageReveal shape={radius} className={className} style={style} data-photo-frame={frame}>
        {motion === 'reveal-parallax' ? <Parallax className="h-full">{picture}</Parallax> : picture}
      </ImageReveal>
    );
  }

  return (
    <div data-photo-frame={frame} style={style} className={cn('overflow-hidden', shape, motion === 'hero' && 'animate-hero-arch', className)}>
      {motion === 'hero' ? (
        <Parallax className="h-full">
          <div className="h-full animate-hero-settle">{picture}</div>
        </Parallax>
      ) : (
        picture
      )}
    </div>
  );
}
