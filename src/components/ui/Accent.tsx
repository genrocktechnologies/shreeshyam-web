import type { ReactNode } from 'react';

/**
 * Renderer for the `<accent>` rich-text tag: a Kalam accent word with a marigold
 * hand-drawn underline (motion-spec, Hero). One per section at most (design-system).
 * The underline starts hidden under html.js-motion and is drawn by HeroTitle; without
 * JS or under reduced motion it is simply shown.
 * Kept on one line (nowrap) so a line split never cuts the word and its underline.
 */
export function Accent({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap font-script font-bold tracking-normal text-rani-600">
      {children}
      <svg
        data-accent-underline=""
        viewBox="0 0 200 16"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute -bottom-[0.08em] left-0 h-[0.22em] w-full overflow-visible"
      >
        <path d="M3 11 C 45 4, 120 3, 197 9" fill="none" strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke" className="stroke-marigold-400" />
      </svg>
    </span>
  );
}

/** Rich-text handlers for messages that use <accent>. */
export const accentTags = {
  accent: (chunks: ReactNode) => <Accent>{chunks}</Accent>,
};
