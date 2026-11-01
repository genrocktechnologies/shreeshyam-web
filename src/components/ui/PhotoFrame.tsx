import { ImageReveal, Parallax } from '@/components/motion';
import { FRAMES, frameOf, type PhotoKey } from '@/data/images';
import { cn } from '@/lib/cn';
import { CurvedFrame } from './CurvedFrame';
import { Picture } from './Picture';

type FrameMotion =
  /** Static frame. */
  | 'none'
  /** Mask opens when scrolled into view (ImageReveal). */
  | 'reveal'
  /** Reveal + gentle parallax inside the frame (desktop). */
  | 'reveal-parallax'
  /**
   * Above the fold, possibly the LCP element: fully painted on the first frame (no clip,
   * no opacity), it only settles from scale.imageFrom via CSS; parallax on desktop. For a
   * panel (CR-01): the photo is static and only its marigold band draws in after load.
   */
  | 'hero';

interface PhotoFrameProps {
  /** Photos only: cut-outs and illustrations are rejected at compile time (PhotoKey). */
  image: PhotoKey;
  /** Translated alt text: t(altKeyFor(image)). */
  alt: string;
  sizes: string;
  priority?: boolean;
  motion?: FrameMotion;
  /**
   * `circle`: a 1:1 round crop at the image's focal point (Team tree portraits), instead
   * of the frame from the data. Static (no motion).
   */
  shape?: 'circle';
  /** Width/max-width/shadow classes for the frame. Aspect and corners come from the data. */
  className?: string;
}

/**
 * Every content photo goes through this frame. Shape (arch / wide / banner / panel), aspect ratio
 * and focal point all come from IMAGE_META in src/data/images.ts, so framing is data,
 * not CSS hacks. The image always covers the frame (object-cover at the focal point);
 * parallax over-scales and caps its travel, and the reveal mask matches the frame's
 * corners, so no motion ever exposes an empty edge.
 */
export function PhotoFrame({ image, alt, sizes, priority = false, motion = 'reveal', shape, className }: PhotoFrameProps) {
  const frame = frameOf(image);
  if (frame === 'illustration') throw new Error(`PhotoFrame: "${image}" is an illustration/cut-out`);
  if (shape === 'circle') {
    return (
      <div data-photo-frame="circle" className={cn('aspect-square overflow-hidden rounded-full', className)}>
        <Picture image={image} alt={alt} sizes={sizes} priority={priority} className="block h-full w-full" imgClassName="h-full w-full object-cover" />
      </div>
    );
  }
  const { aspect, radius } = FRAMES[frame];
  if (radius === 'curved') {
    const curved = motion === 'hero' ? 'hero' : motion === 'none' ? 'none' : 'reveal';
    return <CurvedFrame image={image} alt={alt} sizes={sizes} priority={priority} motion={curved} className={className} />;
  }
  if (motion === 'hero' && radius !== 'arch') throw new Error('PhotoFrame: the hero motion is defined for the arch and panel frames only');

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
  const corners = radius === 'arch' ? 'rounded-arch' : 'rounded-2xl';
  const style = { aspectRatio: aspect };

  if (motion === 'reveal' || motion === 'reveal-parallax') {
    return (
      <ImageReveal shape={radius} className={className} style={style} data-photo-frame={frame}>
        {motion === 'reveal-parallax' ? <Parallax className="h-full">{picture}</Parallax> : picture}
      </ImageReveal>
    );
  }

  return (
    <div data-photo-frame={frame} style={style} className={cn('overflow-hidden', corners, className)}>
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
