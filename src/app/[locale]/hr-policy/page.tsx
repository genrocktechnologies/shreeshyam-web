import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LongForm } from '@/components/sections/longform/LongForm';
import { policySections } from '@/components/sections/longform/policyBody';
import { hrDirectorKeys, hrPolicySections } from '@/data/policies';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return { title: t('hrPolicy.heading'), description: t('hrPolicy.lead') };
}

/**
 * HR Policy (site-plan: the old "Our Policy" page, titled "Human Resource Policy"; D13):
 * the long-form layout with a sticky table of contents and reading progress, all 24
 * sections as crawled, then the policy's contact details.
 */
export default async function HrPolicyPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <LongForm
      title={t('hrPolicy.heading')}
      eyebrow={t('hrPolicy.title')}
      intro={<p className="max-w-prose">{t('hrPolicy.lead')}</p>}
      breadcrumbs={[{ label: t('common.nav.hrPolicy') }]}
      sections={policySections(hrPolicySections, t)}
      after={
        <section aria-labelledby="hr-contact" className="mt-6 rounded-2xl bg-blush p-5 md:p-6">
          <h2 id="hr-contact" className="text-[1.375rem] md:text-[1.625rem]">
            {t('hrPolicy.contact.heading')}
          </h2>
          <div className="mt-3 grid gap-2 text-body text-ink">
            <p className="font-semibold">{t('hrPolicy.contact.organisation')}</p>
            <p>{t('hrPolicy.contact.managingDirector')}</p>
            <div>
              <p>{t('hrPolicy.contact.directors.label')}</p>
              <ul className="mt-1 list-disc pl-6 marker:text-rani-500">
                {hrDirectorKeys.map((k) => (
                  <li key={k}>{t(k)}</li>
                ))}
              </ul>
            </div>
            <p>
              <span className="font-semibold">{t('hrPolicy.contact.addressHeading')}: </span>
              {t('hrPolicy.contact.address')}
            </p>
          </div>
        </section>
      }
    />
  );
}
