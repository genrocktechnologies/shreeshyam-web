import { useLocale } from 'next-intl';
import { NotFoundContent } from '@/components/sections/NotFoundContent';
import type { Locale } from '@/i18n/routing';

// 404 for notFound() inside a locale route: the [locale] layout already supplies the chrome.
export default function LocaleNotFound() {
  const locale = useLocale() as Locale;
  return <NotFoundContent locale={locale} />;
}
