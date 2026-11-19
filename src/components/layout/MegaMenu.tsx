'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronDown } from '@/components/ui/icons';
import { usePathname } from '@/i18n/navigation';
import { cx } from '@/lib/cx';
import { scroll } from '@/lib/motion';
import { useHeaderMenu } from './HeaderShell';

interface MegaMenuProps {
  id: string;
  label: string;
  /** The trigger shows the active pill on pages under this path (e.g. "/loans/"). */
  activePrefix?: string;
  /** Server-rendered panel content (links). */
  children: ReactNode;
}

const HOVER_OPEN_MS = scroll.hoverOpenMs;
const HOVER_CLOSE_MS = scroll.hoverCloseMs;

/**
 * Desktop dropdown (CR-01 header: Loan Products ▾), anchored under its trigger. It uses
 * the disclosure pattern: a <button aria-expanded> controlling
 * a panel. Click, Enter or Space toggles it. Escape closes it and returns focus to the
 * trigger. Tabbing out or clicking elsewhere closes it. A mouse hover opens it after a
 * short delay. The closed panel has visibility:hidden, so it is out of the tab order.
 */
export function MegaMenu({ id, label, activePrefix, children }: MegaMenuProps) {
  const { open, setOpen } = useHeaderMenu();
  const pathname = usePathname();
  const active = !!activePrefix && `${pathname}/`.replace(/\/+$/, '/').startsWith(activePrefix);
  const isOpen = open === id;
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<number>();
  const lastPointer = useRef<string>('');
  const panelId = `mega-${id}`;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const schedule = (fn: () => void, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  };

  return (
    <li
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') schedule(() => setOpen(id), HOVER_OPEN_MS);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') schedule(() => setOpen((cur) => (cur === id ? null : cur)), HOVER_CLOSE_MS);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && isOpen) {
          e.stopPropagation();
          setOpen(null);
          trigger.current?.focus();
        }
      }}
      onBlur={(e) => {
        if (isOpen && !e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(null);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onPointerDown={(e) => {
          lastPointer.current = e.pointerType;
        }}
        onClick={() => {
          // A mouse click while hover already opened it keeps it open; keyboard and
          // touch toggle.
          const mouse = lastPointer.current === 'mouse';
          lastPointer.current = '';
          window.clearTimeout(timer.current);
          setOpen((cur) => (mouse ? id : cur === id ? null : id));
        }}
        className={cx(
          'inline-flex min-h-tap items-center gap-1 whitespace-nowrap rounded-full px-3 text-[0.9375rem] font-medium',
          active ? 'bg-rani-500 text-white' : isOpen ? 'text-rani-600' : 'text-ink hover:text-rani-600',
        )}
      >
        {label}
        <ChevronDown
          strokeWidth={2}
          className={cx('h-4 w-4 transition-transform duration-press ease-growth', isOpen && 'rotate-180')}
        />
      </button>
      <div id={panelId} data-open={isOpen} className="mega-panel absolute left-0 top-full mt-2 w-[23rem] rounded-2xl border border-rani-100 bg-white p-2 shadow-lift">
        {children}
      </div>
    </li>
  );
}
