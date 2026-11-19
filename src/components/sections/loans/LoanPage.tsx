import { getLocale, getTranslations } from 'next-intl/server';
import { formFields, formLabels } from '@/components/forms/fields';
import { LazyWebForm } from '@/components/forms/LazyWebForm';
import { GoldenThread, Reveal } from '@/components/motion';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { Button } from '@/components/ui/Button';
import { KeyFacts } from '@/components/ui/KeyFacts';
import { LoanCard } from '@/components/ui/LoanCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TickList } from '@/components/ui/TickList';
import { documentsFaqId, faqs } from '@/data/faqs';
import { loanById, loansHubHref, relatedLoans, relatedLoansHeadingKey, type LoanProduct } from '@/data/loans';

/**
 * The one template behind the 4 loan product pages (site-plan, Loan product):
 * hero (name + purpose) → the crawled lists in crawled order → KeyFacts (only the fields
 * present) → "documents usually needed" (FAQ Q4, when the product has no documents list
 * of its own) → "Apply for this loan" (the Membership registration form with this loan
 * pre-selected, #apply) → other loans → CTA band (to #apply). The hero has a shortcut to
 * the form.
 */
export async function LoanPage({ id }: { id: LoanProduct['id'] }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const loan = loanById(id);
  const name = t(loan.nameKey);
  const kf = loan.keyFacts;
  // The hero shows the intro paragraph when the page has one; the Purpose row then goes
  // into KeyFacts so no crawled text is dropped.
  const purposeRow = loan.purpose && loan.purpose.valueKey !== loan.purposeKey ? loan.purpose : null;
  const docsFaq = kf.documents ? null : faqs.find((f) => f.id === documentsFaqId);

  return (
    <>
      <PageHero
        title={name}
        breadcrumbs={[{ label: t('common.nav.loans'), href: loansHubHref }, { label: name }]}
        intro={
          <>
            <p className="max-w-prose">{t(loan.purposeKey)}</p>
            <Button href="#apply" arrow className="mt-5">
              {t('loans.apply.heading')}
            </Button>
          </>
        }
      />

      <section className="relative bg-ivory">
        <div className="container-site thread-gutter section-pad relative grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-16">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          {/* Facts first on phones (the amount is what people look for); a sticky card beside the lists on desktop. */}
          <KeyFacts
            values={[purposeRow, kf.amount, kf.tenure, kf.charges, kf.repayment]}
            lists={[kf.eligibility, kf.documents]}
            className="lg:sticky lg:top-28 lg:order-2 lg:self-start"
          />
          <div className="grid content-start gap-12 lg:order-1">
            {loan.lists.map((list) => (
              <div key={list.id}>
                <Reveal>
                  <h2 className="text-h3">{t(list.labelKey)}</h2>
                </Reveal>
                <TickList items={list.itemKeys.map((k) => t(k))} className="mt-5" />
              </div>
            ))}
            {docsFaq && (
              <Reveal className="rounded-2xl bg-rani-50 p-7 md:p-8">
                <h2 className="font-display text-h3 font-semibold">{t(docsFaq.questionKey)}</h2>
                <p className="mt-4 max-w-prose text-body text-ink-muted">{t(docsFaq.answerKey)}</p>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* The registration form, with this loan pre-selected (the visitor can still change it).
          Its email subject names the loan, so applications are easy to sort in the inbox. */}
      <section id="apply" aria-labelledby="apply-heading" className="relative scroll-mt-24 bg-rani-50">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-soft md:p-10">
            <h2 id="apply-heading">{t('loans.apply.heading')}</h2>
            <p className="mt-2 font-semibold text-rani-600">{name}</p>
            <div className="mt-6">
              <LazyWebForm
                form="register"
                fields={formFields('register', t, { loan: loan.id })}
                labels={formLabels(t)}
                subject={`${t('register.title')}: ${name}`}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-ivory-100">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <SectionHeading
            title={t(relatedLoansHeadingKey)}
            action={
              <Button href={loansHubHref} variant="ghost" arrow>
                {t('common.nav.allLoans')}
              </Button>
            }
          />
          <nav aria-label={t(relatedLoansHeadingKey)}>
            <Reveal stagger as="ul" className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
              {relatedLoans(loan.id).map((other) => (
                <li key={other.id}>
                  <LoanCard loan={other} size="compact" />
                </li>
              ))}
            </Reveal>
          </nav>
        </div>
      </section>

      <CtaBand primary={{ label: t('loans.apply.heading'), href: '#apply' }} />
    </>
  );
}
