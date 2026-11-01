import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GoldenThread, Reveal } from '@/components/motion';
import { PageHero } from '@/components/sections/PageHero';
import { LazyRegisterForm } from '@/components/sections/membership/LazyRegisterForm';
import type { RegisterFormLabels } from '@/components/sections/membership/RegisterForm';
import { FileText } from '@/components/ui/icons';
import { TickList } from '@/components/ui/TickList';
import { documentsFaqId, faqs } from '@/data/faqs';
import { loans } from '@/data/loans';
import { membershipBenefitKeys, membershipEligibilityKeys } from '@/data/membership';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return { title: t('common.nav.membership'), description: t('howToJoin.intro') };
}

const ERROR_COUNTS = [1, 2, 3, 4, 5, 6, 7];

/**
 * Membership (CR-01, section 7): replaces /how-to-join/ and /register/ (both 301 here;
 * register to #register). How to Join's intro, the benefits / eligibility / documents
 * checklists, then the registration form. Text as crawled.
 */
export default async function MembershipPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const title = t('common.nav.membership');
  const documents = faqs.find((f) => f.id === documentsFaqId)!;

  const labels: RegisterFormLabels = {
    name: t('common.form.fields.name'),
    mobile: t('common.form.fields.mobile'),
    ageConfirm: t('common.form.fields.ageConfirm'),
    districtVillage: t('common.form.fields.districtVillage'),
    loanProduct: t('common.form.fields.loanProduct'),
    message: t('common.form.fields.message'),
    consentPhone: t('common.form.fields.consentPhone'),
    optional: t('common.form.optional'),
    required: t('common.a11y.requiredField'),
    honeypot: t('common.form.fields.honeypot'),
    submit: t('common.buttons.submit'),
    sending: t('common.form.status.sending'),
    success: t('common.form.status.success'),
    sendFailed: t('common.form.errors.sendFailed'),
    errorsSummary: ERROR_COUNTS.map((count) => t('common.a11y.formErrorsSummary', { count })),
    errors: {
      required: t('common.form.errors.required'),
      nameTooShort: t('common.form.errors.nameTooShort'),
      mobileInvalid: t('common.form.errors.mobileInvalid'),
      tooLong: t.raw('common.form.errors.tooLong') as string,
      chooseOption: t('common.form.errors.chooseOption'),
      ageRequired: t('common.form.errors.ageRequired'),
      consentRequired: t('common.form.errors.consentRequired'),
    },
    loanOptions: [
      ...loans.map((l) => ({ value: l.id, label: t(l.navKey) })),
      { value: 'notSure', label: t('common.form.fields.notSure') },
    ],
    subject: t('register.title'),
  };

  const lists = [
    { id: 'benefits', heading: t('howToJoin.benefits.label'), items: membershipBenefitKeys.map((k) => t(k)) },
    { id: 'eligibility', heading: t('howToJoin.eligibility.label'), items: membershipEligibilityKeys.map((k) => t(k)) },
  ];

  return (
    <>
      <PageHero
        title={title}
        eyebrow={t('howToJoin.eyebrow')}
        breadcrumbs={[{ label: title }]}
        intro={<p className="max-w-prose">{t('howToJoin.intro')}</p>}
      />

      <section id="checklists" className="relative bg-ivory">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <h2>{t('howToJoin.heading')}</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {lists.map((l) => (
              <Reveal key={l.id} className="rounded-2xl bg-white p-5 shadow-soft md:p-6">
                <h3 className="font-display text-h3 font-bold text-rani-600">{l.heading}</h3>
                <TickList items={l.items} className="mt-4" />
              </Reveal>
            ))}
            <Reveal className="rounded-2xl bg-blush p-5 md:p-6">
              <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full bg-white text-rani-500">
                <FileText strokeWidth={1.75} className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-h3 font-bold text-rani-600">{t(documents.questionKey)}</h3>
              <p className="mt-3 text-body text-ink">{t(documents.answerKey)}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="register" aria-labelledby="register-heading" className="relative scroll-mt-24 bg-rani-50">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-soft md:p-10">
            <h2 id="register-heading">{t('register.heading')}</h2>
            <div className="mt-6">
              {/* Strings arrive as props: no message formatter is sent to the browser. */}
              <LazyRegisterForm labels={labels} locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
