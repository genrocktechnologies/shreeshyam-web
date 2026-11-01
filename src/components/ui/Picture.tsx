import * as ReactDOM from 'react-dom';
import { pictureSources, type ImageKey } from '@/data/images';
import { PictureSources } from './PictureSources';

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
  const sources = pictureSources(image);
  // Above-the-fold images: preload the AVIF variant set at high priority. React's automatic
  // image preload skips an <img> inside <picture>, so without this the hero waits for
  // CSS/JS discovery. (`preload` is in Next's bundled react-dom; @types/react-dom 18 lacks it.)
  if (priority) {
    (ReactDOM as unknown as { preload: (href: string, opts: Record<string, string>) => void }).preload(sources.src.replace(/\.webp$/, '.avif'), {
      as: 'image',
      type: 'image/avif',
      imageSrcSet: sources.avif,
      imageSizes: sizes,
      fetchPriority: 'high',
    });
  }

  return <PictureSources sources={sources} alt={alt} sizes={sizes} priority={priority} className={className} imgClassName={imgClassName} />;
}
