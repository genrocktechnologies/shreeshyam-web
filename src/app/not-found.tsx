import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fontVariables } from '@/app/fonts';
import { SiteDocument } from '@/components/layout/SiteDocument';
import { NotFoundContent } from '@/components/sections/NotFoundContent';
import { routing } from '@/i18n/routing';

// Root 404: exported as out/404.html and served by the host for any unknown URL.
// It sits outside [locale], so it renders the full document in the default locale.
const locale = routing.defaultLocale;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'common' });
  return { title: `${t('notFound.metaTitle')} | ${t('siteName')}`, robots: { index: false } };
}

export default function RootNotFound() {
  setRequestLocale(locale);
  return (
    <SiteDocument locale={locale} fonts={fontVariables}>
      <NotFoundContent locale={locale} />
    </SiteDocument>
  );
}
