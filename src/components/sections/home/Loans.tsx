import { getTranslations } from 'next-intl/server';
import { GoldenThread, Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { IconBadge } from '@/components/ui/IconBadge';
import { ArrowRight } from '@/components/ui/icons';
import { LOAN_ICONS } from '@/components/ui/loan-icons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { loans, loansHubHref } from '@/data/loans';
import { Link } from '@/i18n/navigation';
import { trigger } from '@/lib/motion';
import { LoansPin } from './LoansPin';

/** Desktop rail: where each branch leaves the rail, as a share of its length. */
const branchAt = (i: number) => `calc(-1 * var(--thread-gap) + (100% + var(--thread-gap)) * ${i / (loans.length - 1)})`;

/**
 * Home §5 (site-plan, new): the 4 loan products, each with its one-line purpose and a
 * link to its page, plus "All loans".
 * Thread story, step 3: the thread splits into 4 branches here.
 * - Desktop (LoansPin): the section pins, the cards slide sideways, and a branch rail
 *   leaves the thread and fills with the scroll; a branch opens as each card arrives.
 * - Phones: stacked cards, each with its own branch growing out of the thread.
 * - Tablet, reduced motion, no JS: a static grid; the thread passes straight through.
 */
export async function Loans() {
  const t = await getTranslations();

  return (
    <LoansPin className="group/loans relative bg-ivory">
      <div className="container-site thread-gutter section-pad relative lg:group-data-[pinned]/loans:flex lg:group-data-[pinned]/loans:min-h-screen lg:group-data-[pinned]/loans:flex-col lg:group-data-[pinned]/loans:justify-center lg:group-data-[pinned]/loans:py-24">
        <GoldenThread className="thread-col inset-y-0 h-full" />
        <SectionHeading
          title={t('common.nav.loans')}
          action={
            <Button href={loansHubHref} variant="ghost" arrow>
              {t('common.nav.allLoans')}
            </Button>
          }
        />

        {/* Branch rail (desktop, pinned only): fills as the cards travel. */}
        <div aria-hidden="true" className="relative mt-12 hidden h-10 lg:group-data-[pinned]/loans:block">
          <span className="absolute left-[calc(-1*var(--thread-gap))] right-0 top-[calc(100%-1px)] h-0.5 rounded-full bg-marigold-200/70" />
          <span data-rail-fill className="absolute left-[calc(-1*var(--thread-gap))] right-0 top-[calc(100%-1px)] h-0.5 origin-left rounded-full bg-marigold-400" />
          {loans.map((loan, i) => (
            <svg
              key={loan.id}
              data-rail-branch
              viewBox="0 0 24 40"
              className="absolute bottom-0 h-10 w-6 -translate-x-1/2 overflow-visible"
              style={{ left: branchAt(i) }}
            >
              <path d="M12 40 C12 28 18 22 18 12" fill="none" strokeLinecap="round" className="stroke-marigold-400 [stroke-width:2.5px]" />
              <ellipse cx="18" cy="8" rx="4.5" ry="7" transform="rotate(20 18 8)" className="fill-marigold-400" />
              <circle cx="12" cy="40" r="4" className="fill-marigold-400" />
            </svg>
          ))}
        </div>

        <div className="mt-10 lg:group-data-[pinned]/loans:mt-8 lg:group-data-[pinned]/loans:[clip-path:inset(-3rem_-100vw_-3rem_0)]">
          <Reveal
            stagger
            as="ul"
            data-loans-track=""
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:group-data-[pinned]/loans:flex lg:group-data-[pinned]/loans:w-max"
          >
            {loans.map((loan, i) => {
              const name = t(loan.nameKey);
              return (
                <li key={loan.id} className="relative lg:group-data-[pinned]/loans:w-[30rem]">
                  {/* Phone branch: from the thread into the card's edge. */}
                  <GoldenThread
                    d="M0 0 C 0 70, 35 100, 100 100"
                    start={trigger.branchStart}
                    end={trigger.branchEnd}
                    className="absolute right-full top-0 h-10 w-[var(--thread-gap)] md:hidden"
                  />
                  <article className="group relative flex h-full flex-col rounded-2xl border border-rani-100 bg-ivory-100 p-7 shadow-soft transition-[transform,box-shadow] duration-card ease-growth focus-within:shadow-lift hover:-translate-y-1 hover:shadow-lift md:p-8 lg:group-data-[pinned]/loans:p-10">
                    {/* Marigold thread along the top edge, drawn on hover/focus. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-7 top-0 h-[3px] origin-left scale-x-0 rounded-full bg-marigold-400 transition-transform duration-link ease-growth group-focus-within:scale-x-100 group-hover:scale-x-100"
                    />
                    <div className="flex items-start justify-between gap-4">
                      <IconBadge icon={LOAN_ICONS[loan.id]} />
                      <span aria-hidden="true" className="font-display text-h2 leading-none text-rani-600">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="mt-8 font-display text-h3 font-semibold text-ink">{name}</h3>
                    <p className="mt-3 text-body text-ink-muted">{t(loan.purposeKey)}</p>
                    {/* The link covers the whole card (after:inset-0), so the card is one big tap target. */}
                    <Link
                      href={loan.href}
                      prefetch={false}
                      className="mt-auto inline-flex min-h-tap items-center gap-2 pt-6 font-bold text-rani-700 after:absolute after:inset-0 after:rounded-2xl"
                    >
                      {t('common.buttons.learnMore')}{' '}
                      <span className="sr-only">{name}</span>
                      <ArrowRight className="h-[1.1em] w-[1.1em] transition-transform duration-press ease-growth group-hover:translate-x-1" />
                    </Link>
                  </article>
                </li>
              );
            })}
          </Reveal>
        </div>
      </div>
    </LoansPin>
  );
}
