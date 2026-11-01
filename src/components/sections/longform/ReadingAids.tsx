'use client';

import { useEffect, useState } from 'react';
import { cx } from '@/lib/cx';

/**
 * Calls `update` once per animation frame while the page scrolls or resizes (and once on
 * mount). Shared by the long-form reading aids below.
 */
function useScrollFrame(update: () => void, deps: unknown[]) {
  useEffect(() => {
    let frame = 0;
    const run = () => {
      frame = 0;
      update();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };
    run();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Thin marigold reading-progress bar along the top of the viewport (HR Policy, Privacy),
 * for the element with id `targetId`. It moves with `transform: scaleX` only.
 */
export function ReadingProgress({ targetId, label }: { targetId: string; label: string }) {
  const [progress, setProgress] = useState(0);
  useScrollFrame(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    setProgress(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1);
  }, [targetId]);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-marigold-400"
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}

/**
 * Sticky table of contents (desktop) that marks the section being read with
 * aria-current="location": the last section whose top has passed 30% of the viewport.
 */
export function TocNav({ items, label }: { items: { id: string; label: string }[]; label: string }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);
  useScrollFrame(() => {
    const line = window.innerHeight * 0.3;
    let current = items[0]?.id ?? null;
    for (const i of items) {
      const el = document.getElementById(i.id);
      if (el && el.getBoundingClientRect().top <= line) current = i.id;
    }
    // At the very bottom the last (short) sections never reach the line: mark the last one.
    const article = document.getElementById(items[items.length - 1]?.id ?? '')?.parentElement;
    if (article && article.getBoundingClientRect().bottom <= window.innerHeight) current = items[items.length - 1].id;
    setActive(current);
  }, [items]);

  return (
    <nav aria-label={label}>
      <p className="eyebrow mb-2">{label}</p>
      <ol className="grid border-l-2 border-rani-100">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? 'location' : undefined}
              className={cx(
                '-ml-0.5 flex min-h-[2.75rem] items-center border-l-2 py-1.5 pl-4 text-small leading-snug',
                active === i.id ? 'border-rani-500 font-semibold text-rani-600' : 'border-transparent text-ink-muted hover:text-rani-600',
              )}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
