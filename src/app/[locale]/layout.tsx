import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { fontVariables } from '@/app/fonts';
import { SiteDocument } from '@/components/layout/SiteDocument';
import { routing } from '@/i18n/routing';

// Do NOT export `dynamicParams = false` here or in any page: with `output: 'export'`,
// Next 14's dev server then fails every route with a misleading "missing
// generateStaticParams()" error. The static export only emits the listed locales
// anyway, and unknown locales hit notFound() below.

export { generateStaticParams } from '@/i18n/static-params';

export const viewport: Viewport = {
  themeColor: '#FFFCF6',
  colorScheme: 'light',
};

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'common' });
  return {
    title: { default: t('siteName'), template: `%s | ${t('siteName')}` },
    // The crawled site has no meta description, so the default reuses the footer's
    // published blurb (copy is never invented). Pages may override it.
    description: t.markup('footer.blurb', { b: (chunks) => chunks }),
  };
}

export default function LocaleLayout({ children, params: { locale } }: { children: ReactNode; params: { locale: string } }) {
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return <SiteDocument locale={locale} fonts={fontVariables}>{children}</SiteDocument>;
}
