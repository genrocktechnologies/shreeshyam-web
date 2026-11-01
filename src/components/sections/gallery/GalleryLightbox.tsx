'use client';

import type { Flip as FlipPlugin } from 'gsap/Flip';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { useLenis } from '@/components/motion';
import { ChevronLeft, ChevronRight, X } from '@/components/ui/icons';
import { PictureSources } from '@/components/ui/PictureSources';
import type { PictureSourceSet } from '@/data/images';
import { gsap } from '@/lib/gsap';
import { dur, media } from '@/lib/motion';

/**
 * GSAP Flip, loaded on demand: it is never in any page's first-load JS (not even the
 * gallery's), only fetched here, when the browser is idle or on the first tap.
 */
let flipLoad: Promise<typeof FlipPlugin> | null = null;
function loadFlip(): Promise<typeof FlipPlugin> {
  flipLoad ??= import('gsap/Flip').then(({ Flip }) => {
    gsap.registerPlugin(Flip);
    return Flip;
  });
  return flipLoad;
}

export interface GalleryItem {
  /** Stable id (the image key). */
  id: string;
  alt: string;
  /** Resolved on the server with pictureSources(). */
  sources: PictureSourceSet;
}

interface GalleryLabels {
  close: string;
  previous: string;
  next: string;
  /** Per photo: "3 of 10". */
  slideOf: string[];
}

const FLIP_ID = 'gallery-lightbox';

/**
 * Gallery lightbox (motion-spec, Gallery). Wraps the server-rendered masonry: every tile is
 * an <a data-gallery-index href="full-size file">, so without JS a tap opens the image file.
 * With JS a click opens a modal dialog and the large image FLIPs out of its tile (GSAP
 * Flip, transform only). Esc closes, arrows step through, Tab stays inside the dialog,
 * page scroll (and Lenis) is locked, and focus returns to the tile on close. Reduced
 * motion: a plain fade.
 */
export function GalleryLightbox({ items, labels, children }: { items: GalleryItem[]; labels: GalleryLabels; children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const flipState = useRef<ReturnType<typeof FlipPlugin.getState> | null>(null);
  const flip = useRef<typeof FlipPlugin | null>(null);
  const closing = useRef(false);
  const lenis = useLenis();
  const open = index !== null;
  const reduce = () => window.matchMedia(media.reduce).matches;

  const onGridClick = (e: MouseEvent<HTMLDivElement>) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>('a[data-gallery-index]');
    if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    opener.current = link;
    const thumb = link.querySelector('img');
    const index = Number(link.dataset.galleryIndex);
    flipState.current = null;
    if (!thumb || reduce()) {
      setIndex(index);
      return;
    }
    // Nothing moves before the dialog opens, so measuring after the (usually cached)
    // import still captures the tile where it is.
    void loadFlip()
      .then((Flip) => {
        flip.current = Flip;
        thumb.dataset.flipId = FLIP_ID;
        flipState.current = Flip.getState(thumb);
      })
      .catch(() => undefined)
      .finally(() => setIndex(index));
  };

  // Warm the Flip chunk once the page is idle, so the first tap rarely waits for it.
  useEffect(() => {
    const warm = () => void loadFlip().catch(() => undefined);
    // Safari has no requestIdleCallback.
    const idle = (window as Partial<Window>).requestIdleCallback;
    if (idle) {
      const id = window.requestIdleCallback(warm);
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(warm, dur.slow * 1000);
    return () => window.clearTimeout(id);
  }, []);

  // Opening: lock scroll, focus the close button, and FLIP (or fade) the image in.
  useLayoutEffect(() => {
    const el = dialog.current;
    if (!open || !el) return;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = 'hidden';
    lenis?.stop();
    closeButton.current?.focus();

    const big = el.querySelector<HTMLImageElement>('[data-lightbox-image] img');
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: reduce() ? dur.reduce : dur.fast });
      if (big && flipState.current && flip.current) {
        big.dataset.flipId = FLIP_ID;
        flip.current.from(flipState.current, { targets: big, duration: dur.base, ease: 'growth', scale: true });
      }
    });
    return () => {
      ctx.revert();
      root.style.overflow = overflow;
      lenis?.start();
    };
  }, [open, lenis]);

  const close = useCallback(() => {
    const el = dialog.current;
    if (!el || closing.current) return;
    closing.current = true;
    gsap.to(el, {
      opacity: 0,
      duration: reduce() ? dur.reduce : dur.fast,
      onComplete: () => {
        closing.current = false;
        setIndex(null);
        opener.current?.focus();
      },
    });
  }, []);

  const step = useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length)), [items.length]);

  // Keep the opener in sync while stepping, so focus returns to the photo last viewed.
  useEffect(() => {
    if (index === null) return;
    opener.current = document.querySelector<HTMLElement>(`a[data-gallery-index="${index}"]`) ?? opener.current;
  }, [index]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Tab') {
      // Focus trap: cycle through the dialog's buttons.
      const focusable = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button') ?? []);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  const item = index !== null ? items[index] : null;
  const button = 'grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-ivory/70 text-ivory transition-transform duration-press ease-growth hover:-translate-y-0.5';

  return (
    <>
      {/* Click delegation only; the tiles inside are real links that work without JS. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div onClick={onGridClick}>{children}</div>

      {item && index !== null && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={item.alt}
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-[70] flex flex-col gap-4 bg-plum-900/95 p-4 text-ivory-100 md:p-8"
        >
          <div className="flex items-center justify-between gap-4">
            <p aria-live="polite" className="text-small">
              {labels.slideOf[index]}
            </p>
            <button ref={closeButton} type="button" aria-label={labels.close} onClick={close} className={button}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <figure className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
            <div data-lightbox-image="" className="flex min-h-0 justify-center">
              <PictureSources
                key={item.id}
                sources={item.sources}
                alt={item.alt}
                sizes="100vw"
                className="block"
                imgClassName="h-auto max-h-[72vh] w-auto max-w-full rounded-2xl object-contain"
              />
            </div>
            <figcaption className="max-w-prose text-center text-small text-ivory-100/90">{item.alt}</figcaption>
          </figure>
          <div className="flex justify-center gap-3">
            <button type="button" aria-label={labels.previous} onClick={() => step(-1)} className={button}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label={labels.next} onClick={() => step(1)} className={button}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
