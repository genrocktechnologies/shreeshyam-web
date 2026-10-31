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

/** The client's logo, unchanged (CLAUDE.md content rule 8). Size it with a height class. */
export function Logo({ variant = 'full', alt, priority = false, className }: LogoProps) {
  return (
    <img
      src={`/brand/logo-${variant}.webp`}
      alt={alt}
      width={640}
      height={347}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      className={cn('h-12 w-auto', className)}
    />
  );
}
