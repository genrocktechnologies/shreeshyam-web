import { getTranslations } from 'next-intl/server';
import type { LoanProduct } from '@/data/loans';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { IconBadge } from './IconBadge';
import { ArrowRight } from './icons';
import { LOAN_ICONS } from './loan-icons';

interface LoanCardProps {
  loan: LoanProduct;
  /** 1-based position, shown as the "01" numeral (panel and large cards). */
  number?: number;
  /**
   * `panel`: home Loans section. `large`: the /loans/ hub, which adds the published amount
   * and tenure. `compact`: the "Other loans" nav on product pages.
   */
  size?: 'panel' | 'large' | 'compact';
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

/**
 * LoanCard (design-system): product name, its one-line purpose (crawled text), and
 * "Learn more". The link covers the whole card, so the card is one big tap target. A
 * marigold thread draws along the top edge on hover/focus (CSS transform only).
 */
export async function LoanCard({ loan, number, size = 'panel', headingLevel: H = 'h3', className }: LoanCardProps) {
  const t = await getTranslations();
  const name = t(loan.nameKey);
  const compact = size === 'compact';
  const facts = size === 'large' ? [loan.keyFacts.amount, loan.keyFacts.tenure].filter((f) => f !== null) : [];

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-2xl border border-rani-100 bg-ivory-100 shadow-soft transition-[transform,box-shadow] duration-card ease-growth focus-within:shadow-lift hover:-translate-y-1 hover:shadow-lift',
        compact ? 'p-6' : 'p-7 md:p-8',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-7 top-0 h-[3px] origin-left scale-x-0 rounded-full bg-marigold-400 transition-transform duration-link ease-growth group-focus-within:scale-x-100 group-hover:scale-x-100"
      />
      <div className="flex items-start justify-between gap-4">
        <IconBadge icon={LOAN_ICONS[loan.id]} className={compact ? 'h-12 w-12' : undefined} />
        {number !== undefined && !compact && (
          <span aria-hidden="true" className="font-display text-h2 leading-none text-rani-600">
            {String(number).padStart(2, '0')}
          </span>
        )}
      </div>
      <H className={cn('font-display font-semibold text-ink', compact ? 'mt-5 text-[1.1875rem] leading-snug' : 'mt-8 text-h3')}>{name}</H>
      {!compact && <p className="mt-3 text-body text-ink-muted">{t(loan.purposeKey)}</p>}
      {facts.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-rani-200/60 pt-5">
          {facts.map((f) => (
            <div key={f.labelKey}>
              <dt className="text-small text-ink-muted">{t(f.labelKey)}</dt>
              <dd className="mt-1 font-display text-[1.1875rem] font-semibold text-plum-900">{t(f.valueKey)}</dd>
            </div>
          ))}
        </dl>
      )}
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
  );
}
