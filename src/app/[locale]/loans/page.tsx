import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GoldenThread, Reveal } from '@/components/motion';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { LoanCard } from '@/components/ui/LoanCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { faqs, whoCanApplyFaqIds } from '@/data/faqs';
import { loans, loansHubIntroKey, whoCanApplyHeadingKey } from '@/data/loans';
import { howToJoinHref } from '@/data/process';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return { title: t('common.nav.loans'), description: t(loansHubIntroKey) };
}

/**
 * Loans hub (site-plan): intro → the 4 products as large cards (with their published amount
 * and tenure) → "Who can apply" (FAQ Q2 and Q6, as crawled) → How to Join CTA.
 */
export default async function LoansHub({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const whoCanApply = whoCanApplyFaqIds.map((id) => faqs.find((f) => f.id === id)!);

  return (
    <>
      <PageHero title={t('common.nav.loans')} breadcrumbs={[{ label: t('common.nav.loans') }]} intro={<p className="max-w-prose">{t(loansHubIntroKey)}</p>} />

      <section className="relative bg-ivory">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <Reveal stagger as="ul" className="grid gap-6 md:grid-cols-2 md:gap-8">
            {loans.map((loan, i) => (
              <li key={loan.id}>
                <LoanCard loan={loan} number={i + 1} size="large" headingLevel="h2" />
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="relative bg-ivory-100">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <SectionHeading title={t(whoCanApplyHeadingKey)} />
          <Reveal stagger className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
            {whoCanApply.map((f) => (
              <div key={f.id} className="rounded-2xl border border-rani-100 bg-ivory p-7 md:p-8">
                <h3 className="font-display text-h3 font-semibold">{t(f.questionKey)}</h3>
                <p className="mt-4 text-body text-ink-muted">{t(f.answerKey)}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <CtaBand
        primary={{ label: t('common.buttons.howToJoin'), href: howToJoinHref }}
        secondary={{ label: t('common.buttons.register'), href: '/register/' }}
      />
    </>
  );
}
