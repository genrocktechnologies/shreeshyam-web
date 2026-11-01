import type { IllustrationKey } from '@/data/images';
import { cn } from '@/lib/cn';
import { Picture } from './Picture';

interface IllustrationProps {
  /** Illustrations and cut-outs only; photos go through PhotoFrame. */
  image: IllustrationKey;
  alt: string;
  sizes: string;
  className?: string;
}

/**
 * Illustration slot: the image at its natural shape, never cropped or framed. Cut-out
 * photos on white (torn/blob edges) are multiply-blended, so their white surround takes
 * the section's background colour instead of showing as a pale box. Use on light
 * backgrounds only.
 */
export function Illustration({ image, alt, sizes, className }: IllustrationProps) {
  return (
    <Picture
      image={image}
      alt={alt}
      sizes={sizes}
      className={cn('block mix-blend-multiply', className)}
      imgClassName="h-auto w-full"
    />
  );
}
