import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from '@/components/ui/icons';
import { LOAN_ICONS } from '@/components/ui/loan-icons';
import { loans, loansHubHref } from '@/data/loans';
import { Link } from '@/i18n/navigation';

/**
 * Home §5 (CR-01, our recommendation): the 4 loan products in one compact row: icon, name,
 * the published amount (and tenure where published) as chips, and an arrow to the product
 * page. One row from lg; below that a horizontal snap row (native scroll, no pin).
 */
export async function LoanStrip() {
  const t = await getTranslations();

  return (
    <section id="loans" className="bg-ivory py-10 lg:py-12">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2>{t('common.nav.loanProductsMenu')}</h2>
          <Button href={loansHubHref} variant="link" arrow className="min-h-tap">
            {t('common.nav.allLoans')}
          </Button>
        </div>

        <Reveal
          stagger
          as="ul"
          className="-mx-5 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 pt-1 [scrollbar-width:thin] md:-mx-8 md:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {loans.map((loan) => {
            const Icon = LOAN_ICONS[loan.id];
            const facts = [loan.keyFacts.amount, loan.keyFacts.tenure].filter((f) => f !== null);
            return (
              <li key={loan.id} className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-auto">
                <article className="group relative flex h-full items-start gap-3 rounded-2xl bg-white p-4 shadow-soft transition-[transform,box-shadow] duration-card ease-growth hover:-translate-y-1 hover:shadow-lift">
                  <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-rani-50 text-rani-500">
                    <Icon strokeWidth={1.75} className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-body text-[1rem] font-semibold leading-snug text-ink">
                      <Link href={loan.href} prefetch={false} className="after:absolute after:inset-0 after:rounded-2xl group-hover:text-rani-600">
                        {t(loan.navKey)}
                      </Link>
                    </h3>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {facts.map((f) => (
                        <li key={f.valueKey} className="rounded-full bg-marigold-100 px-2.5 py-0.5 text-[0.8125rem] font-medium text-cocoa">
                          <span className="sr-only">{t(f.labelKey)}: </span>
                          {t(f.valueKey)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <span aria-hidden="true" className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rani-500 text-white transition-transform duration-press ease-growth group-hover:translate-x-1">
                    <ArrowRight strokeWidth={2.25} className="h-4 w-4" />
                  </span>
                </article>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
