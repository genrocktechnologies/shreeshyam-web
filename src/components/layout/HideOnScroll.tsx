'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useScrollState } from '@/lib/useScrollState';

/** Fixed bottom bar that slides away while scrolling down and returns on scroll up. */
export function HideOnScroll({ children, className }: { children: ReactNode; className?: string }) {
  const { hidden } = useScrollState({ hideAfter: 120 });
  return (
    <div
      className={cn('transition-transform duration-300 ease-growth', hidden ? 'translate-y-full' : 'translate-y-0', className)}
      data-hidden={hidden}
    >
      {children}
    </div>
  );
}
