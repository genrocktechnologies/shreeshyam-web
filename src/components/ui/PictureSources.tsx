/* eslint-disable @next/next/no-img-element -- next/image optimisation is off in static export */
import type { CSSProperties } from 'react';
import type { PictureSourceSet } from '@/data/images';
import { cx } from '@/lib/cx';

interface PictureSourcesProps {
  sources: PictureSourceSet;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}

/**
 * Renders a processed image from sources resolved on the server (pictureSources()). This
 * is what <Picture> renders; client components (the gallery lightbox) use it directly, so
 * the image manifest and tailwind-merge stay out of their bundle. Width and height are
 * always set, so the browser reserves space (no CLS).
 */
export function PictureSources({ sources, alt, sizes, priority = false, className, imgClassName }: PictureSourcesProps) {
  const style: CSSProperties = sources.blur
    ? { objectPosition: sources.position, backgroundImage: `url(${sources.blur})`, backgroundSize: 'cover', backgroundPosition: sources.position }
    : { objectPosition: sources.position };

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={sources.avif} sizes={sizes} />
      <source type="image/webp" srcSet={sources.webp} sizes={sizes} />
      <img
        src={sources.src}
        alt={alt}
        width={sources.width}
        height={sources.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        style={style}
        className={cx('h-auto max-w-full', imgClassName)}
      />
    </picture>
  );
}
