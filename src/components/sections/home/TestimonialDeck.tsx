'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from '@/components/ui/icons';
import { cx } from '@/lib/cx';
import { deck, media, scale } from '@/lib/motion';

export interface DeckItem {
  id: string;
  quote: string;
  name: string;
  initials: string;
}

interface DeckLabels {
  /** Names the scrollable track, which is focusable so keyboard users can scroll it. */
  track: string;
  previous: string;
  next: string;
  pause: string;
  play: string;
  /** Per slide: "1 of 4". */
  slideOf: string[];
  /** Per slide: "Go to item 1". */
  goTo: string[];
}

const DESKTOP = `${media.desktop} and ${media.noPreference}`;

/**
 * Testimonial deck (motion-spec, Home §9). A native horizontal scroll-snap track, so
 * touch swipe, keyboard scrolling and no-JS all work. On top of it:
 * - Desktop: cards beside the active one shrink to `scale.peek` (transform only, from
 *   scroll position); mouse drag; auto-advance every `deck.interval` s, paused on hover,
 *   focus, when off-screen, when the tab is hidden, or with the pause button (WCAG 2.2.2).
 * - Phones: swipe with snap and dots; no auto-advance, no scaling.
 * - Reduced motion: no auto-advance, instant jumps.
 */
export function TestimonialDeck({ items, labels }: { items: DeckItem[]; labels: DeckLabels }) {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [desktop, setDesktop] = useState(false);
  const [paused, setPaused] = useState(false); // by the user (button)
  const hold = useRef({ hover: false, focus: false, offscreen: true });
  const drag = useRef<{ x: number; left: number } | null>(null);

  const cards = () => Array.from(track.current?.children ?? []) as HTMLElement[];

  const goTo = useCallback((i: number) => {
    const el = track.current;
    const card = (Array.from(el?.children ?? []) as HTMLElement[])[i];
    if (!el || !card) return;
    const reduce = window.matchMedia(media.reduce).matches;
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
  }, []);

  // Active index + peek scaling, from the scroll position.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const mq = window.matchMedia(DESKTOP);
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      cards().forEach((card, i) => {
        const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid) / card.offsetWidth;
        if (d < bestD) [best, bestD] = [i, d];
        card.style.transform = mq.matches ? `scale(${1 - (1 - scale.peek) * Math.min(1, d)})` : '';
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onMq = () => {
      setDesktop(mq.matches);
      update();
    };
    onMq();
    el.addEventListener('scroll', onScroll, { passive: true });
    mq.addEventListener('change', onMq);
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
      mq.removeEventListener('change', onMq);
      window.removeEventListener('resize', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cards() reads the live DOM
  }, []);

  // Off-screen pauses auto-advance.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (hold.current.offscreen = !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-advance (desktop, not paused).
  const auto = desktop && !paused;
  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => {
      const h = hold.current;
      if (h.hover || h.focus || h.offscreen || document.hidden || drag.current) return;
      goTo((active + 1) % items.length);
    }, deck.interval * 1000);
    return () => window.clearInterval(id);
  }, [auto, active, items.length, goTo]);

  // Mouse drag (touch and trackpads scroll natively).
  const onPointerDown = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse' || !track.current) return;
    drag.current = { x: e.clientX, left: track.current.scrollLeft };
    track.current.style.scrollSnapType = 'none';
  };
  const onPointerMove = (e: PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d || !track.current) return;
    track.current.scrollLeft = d.left - (e.clientX - d.x);
  };
  const endDrag = () => {
    if (!drag.current || !track.current) return;
    track.current.style.scrollSnapType = '';
    drag.current = null;
    goTo(active);
  };

  return (
    <div
      onPointerEnter={() => (hold.current.hover = true)}
      onPointerLeave={() => (hold.current.hover = false)}
      onFocus={() => (hold.current.focus = true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hold.current.focus = false;
      }}
    >
      <ul
        ref={track}
        tabIndex={0}
        aria-label={labels.track}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="-my-6 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain py-6 [scrollbar-width:none] md:gap-8 lg:cursor-grab lg:px-[calc((100%-min(42rem,70%))/2)] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <li
            key={item.id}
            aria-label={labels.slideOf[i]}
            className="w-[88%] shrink-0 snap-center md:w-[70%] lg:w-[min(42rem,70%)]"
          >
            <figure className="flex h-full select-none flex-col rounded-2xl border border-rani-100 bg-ivory p-7 shadow-soft md:p-10">
              <span aria-hidden="true" className="font-script text-[4.5rem] font-bold leading-[0.6] text-rani-500">
                &ldquo;
              </span>
              <blockquote className="mt-4 flex-1">
                <p className="font-display text-[1.1875rem] leading-relaxed text-ink md:text-[1.375rem]">{item.quote}</p>
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-rani-100 font-bold text-rani-700">
                  {item.initials}
                </span>
                <span className="font-bold text-ink">{item.name}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between gap-4 lg:justify-center lg:gap-8">
        <div className="flex">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={labels.goTo[i]}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => goTo(i)}
              className="group grid h-12 w-12 place-items-center"
            >
              <span
                className={cx(
                  'h-2.5 w-2.5 rounded-full transition-transform duration-press ease-growth',
                  i === active ? 'scale-125 bg-rani-600' : 'bg-rani-200 group-hover:scale-125',
                )}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {desktop && (
            <button
              type="button"
              aria-label={paused ? labels.play : labels.pause}
              onClick={() => setPaused((p) => !p)}
              className="grid h-12 w-12 place-items-center rounded-full text-rani-700 transition-transform duration-press ease-growth hover:-translate-y-0.5"
            >
              {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </button>
          )}
          <button
            type="button"
            aria-label={labels.previous}
            disabled={active === 0}
            onClick={() => goTo(active - 1)}
            className="grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-rani-600 text-rani-700 transition-transform duration-press ease-growth hover:-translate-y-0.5 disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={labels.next}
            disabled={active === items.length - 1}
            onClick={() => goTo(active + 1)}
            className="grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-rani-600 text-rani-700 transition-transform duration-press ease-growth hover:-translate-y-0.5 disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
