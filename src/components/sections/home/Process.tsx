import { getTranslations } from 'next-intl/server';
import { GoldenThread, Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { altKeyFor } from '@/data/images';
import { howToJoinHref, processHeadingKey, processSteps } from '@/data/process';
import { ProcessPin } from './ProcessPin';

const num = (i: number) => String(i + 1).padStart(2, '0');

/**
 * Home §6 (site-plan): the 3 process steps with their photos, and How to Join.
 * Thread story, step 4: the thread becomes the connector between the steps.
 * - Desktop (ProcessPin): pinned storytelling. The thread turns into a rail with numbered
 *   badges beside the steps; it fills as you scroll, texts cross-fade and photos wipe up.
 * - Phones/tablet, reduced motion, no JS: a vertical stepper. Each step has a node on the
 *   thread, its text Reveals and its photo opens with the frame's own mask.
 */
export async function Process() {
  const t = await getTranslations();

  return (
    <ProcessPin className="group/process relative bg-ivory-100">
      <div className="container-site thread-gutter section-pad relative lg:group-data-[pinned]/process:flex lg:group-data-[pinned]/process:min-h-screen lg:group-data-[pinned]/process:flex-col lg:group-data-[pinned]/process:justify-center lg:group-data-[pinned]/process:py-16">
        <GoldenThread className="thread-col inset-y-0 h-full lg:group-data-[pinned]/process:hidden" />
        {/* Pinned rail: the full-height track and its scrubbed fill (badges sit by the steps). */}
        <div aria-hidden="true" className="thread-col inset-y-0 hidden lg:group-data-[pinned]/process:block">
          <span className="absolute inset-y-0 left-[calc(50%-1px)] w-0.5 bg-marigold-200/70" />
          <span data-process-fill className="absolute inset-y-0 left-[calc(50%-1.25px)] w-[2.5px] origin-top bg-marigold-400" />
        </div>

        <SectionHeading
          title={t(processHeadingKey)}
          action={
            <Button href={howToJoinHref} arrow>
              {t('common.buttons.howToJoin')}
            </Button>
          }
        />

        <div className="relative mt-14 lg:group-data-[pinned]/process:mt-10">
          {/* Pinned rail badges, spread down the steps area; ProcessPin measures them. */}
          <div aria-hidden="true" className="absolute inset-y-0 left-[calc(-1*var(--thread-gap))] hidden lg:group-data-[pinned]/process:block">
            {processSteps.map((s, i) => (
              <span
                key={s.id}
                data-process-node=""
                style={{ top: `${((i + 1) / (processSteps.length + 1)) * 100}%` }}
                className="absolute left-0 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-marigold-400 bg-ivory-100 font-display text-small font-semibold text-plum-900"
              >
                <span data-process-badge="" className="absolute inset-0 rounded-full bg-marigold-400 opacity-0" />
                <span className="relative">{num(i)}</span>
              </span>
            ))}
          </div>

          <ol className="grid gap-16 md:gap-24 lg:group-data-[pinned]/process:gap-0 lg:group-data-[pinned]/process:[grid-template-areas:'step']">
            {processSteps.map((s, i) => (
              <li
                key={s.id}
                className="relative grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-20 lg:group-data-[pinned]/process:[grid-area:step]"
              >
                {/* Stepper node on the thread (unpinned layouts). */}
                <span
                  aria-hidden="true"
                  className="absolute left-[calc(-1*var(--thread-gap))] top-2 h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-marigold-400 bg-ivory-100 lg:group-data-[pinned]/process:hidden"
                />
                {/* The outer div is the pinned cross-fade target; Reveal handles the plain scroll-in. */}
                <div data-step-text="">
                  <Reveal>
                    <p
                      aria-hidden="true"
                      className="font-display text-[clamp(3.5rem,2.8rem+3vw,5.5rem)] font-semibold leading-none text-transparent [-webkit-text-stroke:1.5px_theme(colors.rani.500)]"
                    >
                      {num(i)}
                    </p>
                    <h3 className="mt-5 font-display text-h3 font-semibold text-ink">{t(s.titleKey)}</h3>
                    <p className="mt-3 max-w-prose text-body text-ink-muted">{t(s.textKey)}</p>
                  </Reveal>
                </div>
                <div data-step-image="" className="lg:group-data-[pinned]/process:ml-auto lg:group-data-[pinned]/process:w-[min(100%,calc(52vh*4/3))]">
                  <PhotoFrame image={s.image} alt={t(altKeyFor(s.image))} sizes="(min-width: 768px) 36rem, 90vw" className="w-full shadow-soft" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </ProcessPin>
  );
}
