/* eslint-disable @next/next/no-img-element -- brand file from public/brand, not a processed content image */
import { cn } from '@/lib/cn';

interface LogoProps {
  /** `full` for light backgrounds, `white` for rani/plum backgrounds. */
  variant?: 'full' | 'white';
  /** Translated alt text (common.alt.logo). */
  alt: string;
  priority?: boolean;
  className?: string;
}

/** Display files (scripts/brand.ts): small enough not to compete with the hero on slow phones. */
const FILES = {
  full: { src: '/brand/logo-full-240.webp', width: 240, height: 130 },
  white: { src: '/brand/logo-white-320.webp', width: 320, height: 173 },
} as const;

/**
 * The client's logo, unchanged (CLAUDE.md content rule 8). Size it with a height class.
 * `priority` loads it eagerly but at normal fetch priority, so it never outranks the LCP image.
 */
export function Logo({ variant = 'full', alt, priority = false, className }: LogoProps) {
  return (
    <img
      src={FILES[variant].src}
      alt={alt}
      width={FILES[variant].width}
      height={FILES[variant].height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('h-12 w-auto', className)}
    />
  );
}
