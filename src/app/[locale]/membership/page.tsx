import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Reveal } from '@/components/motion';
import { Faq } from '@/components/sections/Faq';
import { ProcessSteps } from '@/components/sections/membership/ProcessSteps';
import { PageHero } from '@/components/sections/PageHero';
import { formFields, formLabels } from '@/components/forms/fields';
import { LazyWebForm } from '@/components/forms/LazyWebForm';
import { FileText } from '@/components/ui/icons';
import { TickList } from '@/components/ui/TickList';
import { documentsFaqId, faqs } from '@/data/faqs';
import { membershipBenefitKeys, membershipEligibilityKeys } from '@/data/membership';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return { title: t('common.nav.membership'), description: t('howToJoin.intro') };
}

/**
 * Membership (CR-01, section 7): replaces /how-to-join/ and /register/ (both 301 here;
 * register to #register). How to Join's intro, the process stepper (moved from home), the
 * benefits / eligibility / documents checklists, the registration form, then the FAQ
 * with its FAQPage JSON-LD (also moved from home). Text as crawled.
 */
export default async function MembershipPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const title = t('common.nav.membership');
  const documents = faqs.find((f) => f.id === documentsFaqId)!;

  const lists = [
    { id: 'benefits', heading: t('howToJoin.benefits.label'), items: membershipBenefitKeys.map((k) => t(k)) },
    { id: 'eligibility', heading: t('howToJoin.eligibility.label'), items: membershipEligibilityKeys.map((k) => t(k)) },
  ];

  return (
    <>
      <PageHero title={title} eyebrow={t('howToJoin.eyebrow')} breadcrumbs={[{ label: title }]} />

      {/* How to Join's long intro leads the process (keeps the hero within 60vh on phones). */}
      <ProcessSteps lead={t('howToJoin.intro')} />

      <section id="checklists" className="relative bg-blush">
        <div className="container-site section-pad relative">
          <h2>{t('howToJoin.heading')}</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {lists.map((l) => (
              <Reveal key={l.id} className="rounded-2xl bg-white p-5 shadow-soft md:p-6">
                <h3 className="font-display text-h3 font-bold text-rani-600">{l.heading}</h3>
                <TickList items={l.items} className="mt-4" />
              </Reveal>
            ))}
            <Reveal className="rounded-2xl bg-white p-5 shadow-soft md:p-6">
              <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full bg-rani-50 text-rani-500">
                <FileText strokeWidth={1.75} className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-h3 font-bold text-rani-600">{t(documents.questionKey)}</h3>
              <p className="mt-3 text-body text-ink">{t(documents.answerKey)}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="register" aria-labelledby="register-heading" className="relative scroll-mt-24 bg-rani-50">
        <div className="container-site section-pad relative">
          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-soft md:p-10">
            <h2 id="register-heading">{t('register.heading')}</h2>
            <div className="mt-6">
              {/* Strings arrive as props: no message formatter is sent to the browser. */}
              <LazyWebForm form="register" fields={formFields('register', t)} labels={formLabels(t)} subject={t('register.title')} locale={locale} />
            </div>
          </div>
        </div>
      </section>

      <Faq />
    </>
  );
}
