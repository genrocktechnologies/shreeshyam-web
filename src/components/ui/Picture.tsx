/* eslint-disable @next/next/no-img-element -- next/image optimisation is off in static export */
import type { CSSProperties } from 'react';
import { images, type ImageKey } from '@/data/images';
import { cn } from '@/lib/cn';

interface PictureProps {
  image: ImageKey;
  /** Translated alt text (from `altKeyFor(image)`). Pass "" only for purely decorative use. */
  alt: string;
  /** Rendered width hint for srcset selection, e.g. "(min-width: 1024px) 50vw, 100vw". */
  sizes?: string;
  /** Above-the-fold images (the hero): eager load with high fetch priority. */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}

/**
 * Responsive AVIF/WebP <picture> for images processed by scripts/images.ts. Width and
 * height are always set, so the browser reserves space (no CLS). Photos show a blurred
 * placeholder until they load.
 */
export function Picture({ image, alt, sizes = '100vw', priority = false, className, imgClassName }: PictureProps) {
  const entry = images[image];
  const largest = entry.widths[entry.widths.length - 1];
  const srcSet = (ext: 'avif' | 'webp') => entry.widths.map((w) => `${entry.base}-${w}.${ext} ${w}w`).join(', ');
  const style: CSSProperties | undefined = entry.blur
    ? { backgroundImage: `url(${entry.blur})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;
  // React 18 has no camelCase fetchPriority prop; the lowercase attribute passes through.
  const priorityAttrs = priority ? ({ fetchpriority: 'high' } as Record<string, string>) : {};

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img
        src={`${entry.base}-${largest}.webp`}
        alt={alt}
        width={largest}
        height={Math.round((entry.height * largest) / entry.width)}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        style={style}
        className={cn('h-auto max-w-full', imgClassName)}
        {...priorityAttrs}
      />
    </picture>
  );
}
