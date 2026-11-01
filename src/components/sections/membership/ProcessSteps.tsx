import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion';
import { processHeadingKey, processSteps } from '@/data/process';

const num = (i: number) => String(i + 1).padStart(2, '0');

/**
 * The 3 process steps (CR-01: moved from home to the top of Membership), as a compact
 * stepper: numbered marigold discs on one marigold line (the golden thread's motif lives
 * on here). Three columns from md, the line running across; phones: stacked, the line
 * running down the left. Text as crawled; plain staggered reveal, no pin.
 */
export async function ProcessSteps({ lead }: { lead?: string }) {
  const t = await getTranslations();

  return (
    <section id="process" className="relative bg-ivory">
      <div className="container-site section-pad">
        {lead && (
          <Reveal>
            <p className="mb-8 max-w-3xl text-body text-ink md:text-[1.125rem] md:leading-relaxed">{lead}</p>
          </Reveal>
        )}
        <Reveal>
          <h2 className="max-w-3xl text-balance">{t(processHeadingKey)}</h2>
        </Reveal>
        <div className="relative mt-8">
          {/* The stepper line: down the discs on phones, across them from md. */}
          <span aria-hidden="true" className="absolute bottom-6 left-6 top-6 w-[3px] -translate-x-1/2 rounded-full bg-marigold-400 md:bottom-auto md:left-[16.66%] md:right-[16.66%] md:top-6 md:h-[3px] md:w-auto md:translate-x-0" />
          <Reveal stagger as="ol" className="relative grid gap-6 md:grid-cols-3 md:gap-6">
            {processSteps.map((s, i) => (
              <li key={s.id} className="flex gap-4 md:flex-col md:items-center md:text-center">
                <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-marigold-400 font-display text-[1.0625rem] font-bold text-plum-900 ring-4 ring-ivory">
                  {num(i)}
                </span>
                <div className="md:mt-4">
                  <h3 className="font-display text-h3 font-bold text-rani-600">{t(s.titleKey)}</h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-muted md:mx-auto md:max-w-[22rem]">{t(s.textKey)}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
