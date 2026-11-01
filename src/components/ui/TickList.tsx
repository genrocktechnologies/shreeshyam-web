import { DrawTicks } from '@/components/motion';
import { cn } from '@/lib/cn';

/**
 * Checklist with marigold ticks that draw in one after another as it scrolls in
 * (DrawTicks). Items are already-translated strings.
 */
export function TickList({ items, className }: { items: string[]; className?: string }) {
  return (
    <DrawTicks className={cn(className)}>
      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-body text-ink">
            <span aria-hidden="true" className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-marigold-100">
              <svg data-tick="" viewBox="0 0 24 24" className="h-4 w-4 overflow-visible" focusable="false">
                <path d="M20 6 9 17l-5-5" fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="stroke-rani-600" />
              </svg>
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </DrawTicks>
  );
}

