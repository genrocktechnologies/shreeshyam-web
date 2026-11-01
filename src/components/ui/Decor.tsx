import { cn } from '@/lib/cn';

/**
 * CR-01 decorations, drawn in code (never stock art): use sparingly, at about 10–15%
 * opacity in section corners. All decorative (aria-hidden). Colour via text-* classes.
 */

/** Lotus outline. */
export function Lotus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" aria-hidden="true" focusable="false" className={cn('pointer-events-none', className)}>
      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M60 72 C46 56 46 30 60 8 C74 30 74 56 60 72 Z" />
        <path d="M60 72 C40 66 28 46 30 24 C46 32 56 50 60 72 Z" />
        <path d="M60 72 C80 66 92 46 90 24 C74 32 64 50 60 72 Z" />
        <path d="M60 72 C34 74 14 62 6 44 C26 42 46 54 60 72 Z" />
        <path d="M60 72 C86 74 106 62 114 44 C94 42 74 54 60 72 Z" />
      </g>
    </svg>
  );
}

/** Single leaf (the impact band's slogan). */
export function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 48" aria-hidden="true" focusable="false" className={cn('pointer-events-none', className)}>
      <path d="M6 44 C4 24 16 6 36 4 C38 24 26 42 6 44 Z" fill="currentColor" />
      <path d="M6 44 C14 30 22 20 32 9" fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Hand-drawn underline swash with an arrow tip (the impact band's slogan). */
export function Swash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 24" aria-hidden="true" focusable="false" className={cn('pointer-events-none', className)}>
      <path d="M4 20 C70 10 150 6 228 8 M216 2 L230 8 L218 15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Small hand-drawn heart flourish (the hero's side slogan). */
export function HeartFlourish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 30" aria-hidden="true" focusable="false" className={cn('pointer-events-none', className)}>
      <path
        d="M2 22 C20 26 30 18 40 12 C36 4 46 2 46 10 C46 2 56 4 52 12 C46 20 46 22 46 24 C42 20 36 16 40 12 C52 20 70 26 88 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
