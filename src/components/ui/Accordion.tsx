'use client';

import { useEffect, useId, useState } from 'react';
import { cx } from '@/lib/cx';
import { Plus } from './icons';

export interface AccordionItem {
  id: string;
  title: string;
  body: string;
}

/**
 * Accordion (design-system): a <button aria-expanded aria-controls> inside a heading,
 * controlling a role="region" panel. Opening animates the panel's grid-template-rows
 * 0fr → 1fr (the one approved layout animation, `duration-accordion`); collapsed panels
 * are `inert`. The plus turns into a cross with a transform. Instant under reduced
 * motion (global CSS).
 * Server render / no JS: every panel is open, so all answers are readable. After
 * hydration only `defaultOpen` stays open (the FAQ sits far below the fold, so this
 * never shifts anything on screen).
 */
export function Accordion({ items, defaultOpen = 0 }: { items: AccordionItem[]; defaultOpen?: number }) {
  const base = useId();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([defaultOpen]));

  useEffect(() => setReady(true), []);

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(i)) next.add(i);
      return next;
    });

  return (
    <div className="border-y border-rani-200/60">
      {items.map((item, i) => {
        const isOpen = !ready || open.has(i);
        const buttonId = `${base}-b${i}`;
        const panelId = `${base}-p${i}`;
        return (
          <div key={item.id} className="border-b border-rani-200/60 last:border-b-0">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="group flex min-h-[4.5rem] w-full items-center justify-between gap-6 py-5 text-left font-display text-[1.1875rem] font-semibold leading-snug text-ink md:text-h3"
              >
                <span>{item.title}</span>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-[1.5px] border-rani-200 text-rani-600 transition-transform duration-press ease-growth group-hover:scale-105">
                  <Plus className={cx('h-5 w-5 transition-transform duration-accordion ease-growth', isOpen && 'rotate-45')} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              // React 18 drops a boolean `inert` (unknown attribute); an empty string sets it.
              // @types/react already types it as boolean, hence the cast.
              {...(isOpen ? {} : ({ inert: '' } as unknown as { inert: boolean }))}
              className={cx(
                'grid transition-[grid-template-rows] duration-accordion ease-growth',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-prose pb-7 pr-4 text-body text-ink-muted md:pr-16">{item.body}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
