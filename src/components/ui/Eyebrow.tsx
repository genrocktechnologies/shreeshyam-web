import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Small marigold thread dash (24px) + eyebrow text (design-system, Eyebrow). */
export function Eyebrow({ children, className, onDark = false }: { children: ReactNode; className?: string; onDark?: boolean }) {
  return (
    <p className={cn('eyebrow flex items-center gap-3', onDark && 'text-marigold-300', className)}>
      <span aria-hidden="true" className="h-[2px] w-6 shrink-0 rounded-full bg-marigold-400" />
      {children}
    </p>
  );
}
