import { getTranslations } from 'next-intl/server';
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
import { tidyLabel } from '@/lib/label';

/**
 * The one template behind the 4 loan product pages (site-plan, Loan product):
 * hero (name + purpose) → the crawled lists in crawled order → KeyFacts (only the fields
 * present) → "documents usually needed" (FAQ Q4, when the product has no documents list
 * of its own) → other loans → Register CTA. The golden thread runs down the page and
 * blooms in the CTA band.
 */
export async function LoanPage({ id }: { id: LoanProduct['id'] }) {
  const t = await getTranslations();
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
        intro={<p className="max-w-prose">{t(loan.purposeKey)}</p>}
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
                  <h2 className="text-h3">{tidyLabel(t(list.labelKey))}</h2>
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

      <CtaBand />
    </>
  );
}
