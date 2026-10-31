'use client';

import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { scroll } from '@/lib/motion';
import { useScrollState } from '@/lib/useScrollState';

/** Fixed bottom bar that slides away while scrolling down and returns on scroll up. */
export function HideOnScroll({ children, className }: { children: ReactNode; className?: string }) {
  const { hidden } = useScrollState({ hideAfter: scroll.barHideAfter });
  return (
    <div
      className={cx('transition-transform duration-bar ease-growth', hidden ? 'translate-y-full' : 'translate-y-0', className)}
      data-hidden={hidden}
    >
      {children}
    </div>
  );
}
