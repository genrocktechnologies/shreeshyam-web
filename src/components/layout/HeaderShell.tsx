'use client';

import { createContext, useContext, useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { usePathname } from '@/i18n/navigation';
import { useScrollState } from '@/lib/useScrollState';

interface HeaderMenuState {
  /** Id of the open mega menu, or null. Only one is open at a time. */
  open: string | null;
  setOpen: Dispatch<SetStateAction<string | null>>;
}

const HeaderMenuContext = createContext<HeaderMenuState>({ open: null, setOpen: () => {} });
export const useHeaderMenu = () => useContext(HeaderMenuContext);

/**
 * Fixed site header. Sets data-scrolled (past 40px: ivory, blurred and visually shrunk)
 * and data-hidden (scrolling down; back on scroll up) for the CSS in globals.css.
 * It never hides while a mega menu is open or while focus is inside it, so keyboard
 * users never lose the header.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<string | null>(null);
  const [focusWithin, setFocusWithin] = useState(false);
  const { scrolled, hidden } = useScrollState({ threshold: 40, hideAfter: 160 });
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // Close menus on navigation.
  useEffect(() => setOpen(null), [pathname]);

  // Close on a pointer press outside the header.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <HeaderMenuContext.Provider value={{ open, setOpen }}>
      <header
        ref={ref}
        className="site-header fixed inset-x-0 top-0 z-50"
        data-scrolled={scrolled}
        data-menu-open={open !== null}
        data-hidden={hidden && open === null && !focusWithin}
        onFocus={() => setFocusWithin(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
        }}
      >
        {children}
      </header>
    </HeaderMenuContext.Provider>
  );
}
