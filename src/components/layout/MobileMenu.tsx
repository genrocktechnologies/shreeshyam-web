'use client';

import { Menu, X } from '@/components/ui/icons';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useLenis } from '@/components/motion';
import { usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { ui } from '@/lib/motion';

interface MobileMenuProps {
  /** Server-rendered navigation content for the sheet. */
  children: ReactNode;
  openLabel: string;
  closeLabel: string;
  dialogLabel: string;
  className?: string;
}

const CLOSE_MS = ui.sheet; // matches the sheet's slide-out transition
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full-height sheet sliding in from the right (< lg). It is a modal <dialog>, so the
 * rest of the page is inert and Escape closes it. Tab and Shift+Tab also wrap inside
 * the sheet, so focus never leaves it. Closing returns focus to the menu button.
 */
export function MobileMenu({ children, openLabel, closeLabel, dialogLabel, className }: MobileMenuProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(false);
  const lenis = useLenis();
  const pathname = usePathname();

  const close = useCallback(() => {
    const d = dialog.current;
    if (!d?.open) return;
    setShown(false);
    window.setTimeout(() => {
      d.close();
      document.documentElement.style.overflow = '';
      lenis?.start();
      trigger.current?.focus();
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : CLOSE_MS);
  }, [lenis]);

  const open = () => {
    const d = dialog.current;
    if (!d || d.open) return;
    d.showModal();
    document.documentElement.style.overflow = 'hidden';
    lenis?.stop();
    // Next frame, so the sheet transitions in from its off-screen position.
    requestAnimationFrame(() => setShown(true));
  };

  // Navigating (e.g. a link inside the sheet) closes it.
  useEffect(() => close(), [pathname, close]);

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== 'Tab' || !dialog.current) return;
    const items = Array.from(dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className={className}>
      <button
        ref={trigger}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-expanded={shown}
        className="grid h-12 w-12 place-items-center rounded-full text-plum-900 transition-transform duration-press ease-growth active:scale-95"
      >
        <Menu className="h-7 w-7" />
        <span className="sr-only">{openLabel}</span>
      </button>

      <dialog
        ref={dialog}
        aria-label={dialogLabel}
        onCancel={(e) => {
          e.preventDefault(); // animate out instead of closing instantly
          close();
        }}
        onKeyDown={onKeyDown}
        onClick={(e) => {
          // A click on the backdrop (the dialog element itself) or on a link closes it.
          if (e.target === e.currentTarget || (e.target as HTMLElement).closest('a[href]')) close();
        }}
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-plum-900/40 sm:max-w-md"
      >
        <div
          data-open={shown}
          className={cn(
            'mobile-sheet flex h-full flex-col overflow-y-auto bg-ivory shadow-lift transition-transform duration-sheet ease-growth',
            shown ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex justify-end p-3">
            <button
              type="button"
              onClick={close}
              autoFocus
              className="grid h-12 w-12 place-items-center rounded-full text-plum-900 transition-transform duration-press ease-growth active:scale-95"
            >
              <X className="h-7 w-7" />
              <span className="sr-only">{closeLabel}</span>
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </div>
  );
}
