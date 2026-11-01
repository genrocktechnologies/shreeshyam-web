import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { PageHero } from '@/components/sections/PageHero';
import type { Crumb } from '@/components/ui/Breadcrumbs';
import { ChevronDown } from '@/components/ui/icons';
import { ReadingProgress, TocNav } from './ReadingAids';

export interface LongFormSection {
  id: string;
  heading: string;
  body: ReactNode;
}

interface LongFormProps {
  title: string;
  eyebrow?: string;
  intro?: ReactNode;
  /** A long introduction: opens the reading column instead of the hero (hero ≤ 60vh on phones). */
  lead?: ReactNode;
  breadcrumbs: Crumb[];
  sections: LongFormSection[];
  /** Closing block after the sections (e.g. HR Policy's contact details). */
  after?: ReactNode;
}

/**
 * Long-form layout (site-plan: HR Policy, Privacy; CR-01 compact style). Desktop: a sticky
 * table of contents beside the reading column. Phones: the contents fold into a <details>
 * at the top. A reading-progress bar runs along the top of the viewport. The text is
 * server-rendered and in the first screen, so there are no reveals (LCP).
 */
export async function LongForm({ title, eyebrow, intro, lead, breadcrumbs, sections, after }: LongFormProps) {
  const t = await getTranslations();
  const items = sections.map((s) => ({ id: s.id, label: s.heading }));
  const tocLabel = t('common.a11y.onThisPage');

  return (
    <>
      <ReadingProgress targetId="longform-article" label={t('common.a11y.readingProgress')} />
      <PageHero title={title} eyebrow={eyebrow} intro={intro} breadcrumbs={breadcrumbs} />

      <section className="relative bg-ivory">
        <div className="container-site section-pad grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          <aside className="hidden lg:block">
            <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto pr-2">
              <TocNav items={items} label={tocLabel} />
            </div>
          </aside>

          {/* Phones: the same contents, folded. */}
          <details className="group rounded-2xl bg-white p-4 shadow-soft lg:hidden">
            <summary className="flex min-h-tap cursor-pointer list-none items-center justify-between font-semibold text-rani-600 [&::-webkit-details-marker]:hidden">
              {tocLabel}
              <ChevronDown aria-hidden="true" className="h-5 w-5 transition-transform duration-press group-open:rotate-180" />
            </summary>
            <ol className="mt-2 grid">
              {items.map((i) => (
                <li key={i.id}>
                  <a href={`#${i.id}`} className="flex min-h-tap items-center text-small text-ink hover:text-rani-600">
                    {i.label}
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <article id="longform-article" className="max-w-[46rem]">
            {lead && <div className="mb-6 border-b border-rani-100 pb-6 text-body text-ink md:text-[1.125rem] md:leading-relaxed">{lead}</div>}
            {sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28 border-b border-rani-100 py-6 first:pt-0 last:border-b-0">
                <h2 id={`${s.id}-h`} className="text-[1.375rem] md:text-[1.625rem]">
                  {s.heading}
                </h2>
                <div className="mt-3 grid gap-3 text-body text-ink [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-1.5 [&_ul]:pl-6 [&_ul]:marker:text-rani-500">{s.body}</div>
              </section>
            ))}
            {after}
          </article>
        </div>
      </section>
    </>
  );
}
