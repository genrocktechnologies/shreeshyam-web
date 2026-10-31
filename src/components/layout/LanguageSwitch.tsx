'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

export interface LanguageOption {
  locale: Locale;
  /** Visible short label: "EN", "हिं". */
  short: string;
  /** Full name for screen readers: "English", "हिन्दी". */
  full: string;
}

interface LanguageSwitchProps {
  /** Group label, e.g. "Choose language". */
  label: string;
  options: LanguageOption[];
  className?: string;
}

/**
 * EN | हिं pill. Each option links to the current page in that locale. The marker slides
 * between them with a CSS transform (no JS animation). Each option is 48px tall.
 * Labels arrive as props (translated on the server), so this always-loaded component
 * doesn't pull next-intl's message formatter into every page's bundle.
 */
export function LanguageSwitch({ label, options, className }: LanguageSwitchProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const index = Math.max(0, routing.locales.indexOf(locale as Locale));

  return (
    <div role="group" aria-label={label} className={cn('relative inline-grid h-12 grid-cols-2 rounded-full border border-rani-200 bg-ivory', className)}>
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-rani-600 transition-transform duration-300 ease-growth"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {options.map((o) => {
        const active = o.locale === locale;
        return (
          <Link
            key={o.locale}
            href={pathname}
            locale={o.locale}
            hrefLang={o.locale}
            lang={o.locale}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'relative z-10 grid min-w-[52px] place-items-center rounded-full px-3 text-small font-bold',
              active ? 'text-white' : 'text-rani-700',
            )}
          >
            <span aria-hidden="true">{o.short}</span>
            <span className="sr-only">{o.full}</span>
          </Link>
        );
      })}
    </div>
  );
}
