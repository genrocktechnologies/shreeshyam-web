import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion';
import type { LabelledList, LabelledValue } from '@/data/loans';
import { cn } from '@/lib/cn';
import { tidyLabel } from '@/lib/label';
import { TickList } from './TickList';

/** Values longer than this (characters) are sentences, not figures. */
const LONG_VALUE = 40;

interface KeyFactsProps {
  /** Single-value facts in display order (purpose, amount, tenure, charges, repayment); nulls are skipped. */
  values: (LabelledValue | null)[];
  /** List facts (eligibility, documents); nulls are skipped. */
  lists: (LabelledList | null)[];
  className?: string;
}

/**
 * KeyFacts (design-system): a definition-list card for a loan's facts. It renders only the
 * fields present, so missing client data never shows as a blank or placeholder (content
 * rule 5). The values Reveal in turn; list facts are checklists whose ticks draw in.
 * Renders nothing when there are no facts at all.
 */
export async function KeyFacts({ values, lists, className }: KeyFactsProps) {
  const t = await getTranslations();
  const rows = values.filter((v): v is LabelledValue => v !== null);
  const groups = lists.filter((l): l is LabelledList => l !== null);
  if (!rows.length && !groups.length) return null;

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-rani-100 bg-ivory p-7 shadow-soft md:p-8', className)}>
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-marigold-400" />
      {/* Two lists so Reveal can be the <dl> itself (a <dl> may only wrap dt/dd groups). */}
      {rows.length > 0 && (
        <Reveal as="dl" stagger className="grid gap-5">
          {rows.map((r) => {
            const value = t(r.valueKey);
            return (
              <div key={r.labelKey} className="border-b border-rani-200/60 pb-5 last:border-b-0 last:pb-0">
                <dt className="text-small font-bold uppercase tracking-[0.08em] text-ink-muted">{tidyLabel(t(r.labelKey))}</dt>
                {/* Figures (amount, tenure) read big; a sentence (purpose) stays at body size. */}
                <dd className={cn('mt-1.5 text-plum-900', value.length > LONG_VALUE ? 'text-body' : 'font-display text-h3 font-semibold')}>{value}</dd>
              </div>
            );
          })}
        </Reveal>
      )}
      {groups.length > 0 && (
        <dl className={cn('grid gap-7', rows.length > 0 && 'mt-7 border-t border-rani-200/60 pt-7')}>
          {groups.map((g) => (
            <div key={g.id}>
              <dt className="text-small font-bold uppercase tracking-[0.08em] text-ink-muted">{tidyLabel(t(g.labelKey))}</dt>
              <dd className="mt-4">
                <TickList items={g.itemKeys.map((k) => t(k))} />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
