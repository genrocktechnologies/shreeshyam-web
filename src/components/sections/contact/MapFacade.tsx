'use client';

import { useRef, useState } from 'react';
import { MapPin } from '@/components/ui/icons';

interface MapFacadeProps {
  embedUrl: string;
  /** Translated: common.a11y.mapTitle, common.buttons.showMap, contact.map.note, the pin name. */
  title: string;
  showLabel: string;
  note: string;
  pinName: string;
  pinAddress: string;
  /** "Open in Maps": a plain link, so no request reaches Google unless it is followed. */
  open: { href: string; label: string; newTab: string };
}

/**
 * Click-to-load Google Map (CLAUDE.md performance budget). Until "Show map" is pressed the
 * page makes NO request to Google: it shows the confirmed pin (Motihari Chini Mill) as
 * text, an "Open in Maps" link and the button. Pressing it swaps in the iframe and moves
 * focus to it.
 */
export function MapFacade({ embedUrl, title, showLabel, note, pinName, pinAddress, open }: MapFacadeProps) {
  const [loaded, setLoaded] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  if (loaded) {
    return (
      <iframe
        ref={frame}
        src={embedUrl}
        title={title}
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        onLoad={() => frame.current?.focus()}
        className="block aspect-[4/3] w-full rounded-2xl border-0 shadow-soft md:aspect-[21/9]"
      />
    );
  }

  return (
    <div className="grid w-full place-items-center rounded-2xl bg-white px-6 py-8 text-center shadow-soft md:py-10">
      <div className="grid max-w-md justify-items-center gap-2">
        <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full bg-rani-500 text-white">
          <MapPin strokeWidth={1.75} className="h-6 w-6" />
        </span>
        <p className="font-display text-h3 font-bold text-rani-600">{pinName}</p>
        <p className="text-small text-ink-muted">{pinAddress}</p>
        <p className="text-small text-ink">{note}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="inline-flex min-h-tap items-center rounded-full bg-marigold-400 px-6 font-bold text-plum-900 shadow-soft transition-transform duration-press ease-growth hover:-translate-y-0.5"
          >
            {showLabel}
          </button>
          <a
            href={open.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-tap items-center rounded-full border-[1.5px] border-rani-600 px-6 font-bold text-rani-600 transition-transform duration-press ease-growth hover:-translate-y-0.5"
          >
            {open.label}
            <span className="sr-only"> {open.newTab}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
