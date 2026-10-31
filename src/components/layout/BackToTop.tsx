'use client';

import { useLenis } from '@/components/motion';
import { ArrowUp } from '@/components/ui/icons';
import { media } from '@/lib/motion';

/**
 * Scrolls to the top (smoothly unless reduced motion is on), then moves keyboard focus to
 * the header logo so the next Tab continues from the top of the page. The label comes
 * from the server (no client-side message formatting).
 */
export function BackToTop({ label }: { label: string }) {
  const lenis = useLenis();

  const toTop = () => {
    const reduce = window.matchMedia(media.reduce).matches;
    if (lenis && !reduce) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.getElementById('site-logo')?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      className="group inline-flex min-h-tap items-center gap-2 rounded-full border-[1.5px] border-ivory/40 px-5 font-bold text-ivory transition-transform duration-press ease-growth hover:-translate-y-0.5 hover:border-marigold-300 hover:text-marigold-300"
    >
      <ArrowUp strokeWidth={2} className="h-4 w-4 transition-transform duration-press ease-growth group-hover:-translate-y-0.5" />
      {label}
    </button>
  );
}
