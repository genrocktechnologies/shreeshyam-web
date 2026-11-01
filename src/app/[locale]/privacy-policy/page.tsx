import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LongForm } from '@/components/sections/longform/LongForm';
import { policySections } from '@/components/sections/longform/policyBody';
import { privacySections } from '@/data/policies';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return { title: t('privacy.title'), description: t('privacy.intro') };
}

/**
 * Privacy Policy (site-plan): the long-form layout with a sticky table of contents and
 * reading progress. The 10 sections as crawled; each bullet as published.
 */
export default async function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <LongForm
      title={t('privacy.title')}
      eyebrow={t('privacy.heading')}
      lead={<p>{t('privacy.intro')}</p>}
      breadcrumbs={[{ label: t('privacy.title') }]}
      sections={policySections(privacySections, t)}
    />
  );
}
