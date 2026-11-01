'use client';

import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cx } from '@/lib/cx';

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

/** "/dev/layout" + "hi" → "/hi/dev/layout/" (the export uses trailing slashes). */
const localeHref = (locale: Locale, pathname: string) => `/${locale}${pathname.replace(/\/?$/, '/')}`.replace(/\/{2,}/g, '/');

/**
 * EN | हिं pill. Each option links to the current page in that locale. The marker slides
 * between them with a CSS transform (no JS animation). Each option is 48px tall.
 * Labels arrive as props (translated on the server), so this always-loaded component
 * doesn't pull next-intl's message formatter into every page's bundle.
 *
 * The options are plain links (a full page load), not client navigation: switching locale
 * swaps the root layout (<html lang>, fonts, messages), and a client-side remount drops
 * the `js-motion` class the inline head script set, which would leave motion off.
 */
export function LanguageSwitch({ label, options, className }: LanguageSwitchProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const index = Math.max(0, routing.locales.indexOf(locale as Locale));

  return (
    <div role="group" aria-label={label} className={cx('relative inline-grid h-12 grid-cols-2 rounded-full border border-rani-200 bg-white', className)}>
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-rani-500 transition-transform duration-pill ease-growth"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {options.map((o) => {
        const active = o.locale === locale;
        return (
          <a
            key={o.locale}
            href={localeHref(o.locale, pathname)}
            hrefLang={o.locale}
            lang={o.locale}
            aria-current={active ? 'true' : undefined}
            className={cx(
              'relative z-10 grid min-w-[48px] place-items-center rounded-full px-2 text-small font-semibold',
              active ? 'text-white' : 'text-rani-600',
            )}
          >
            <span aria-hidden="true">{o.short}</span>
            <span className="sr-only">{o.full}</span>
          </a>
        );
      })}
    </div>
  );
}
