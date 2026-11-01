import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GoldenThread, Reveal } from '@/components/motion';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { Illustration } from '@/components/ui/Illustration';
import { PullQuote } from '@/components/ui/PullQuote';
import { aboutRoutes, missionGoalKeys, missionValueKeys, splitValue, visionImage } from '@/data/about';
import { altKeyFor } from '@/data/images';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return { title: t('common.nav.visionMission'), description: t('vision.statement') };
}

/**
 * Vision & Mission (CR-01, section 7): one page replacing /about/mission/ and
 * /about/vision/ (both 301 here, to #mission and #vision). Vision first, then Mission,
 * each with its pull-quote, in the long-form reading column. All text as crawled.
 */
export default async function VisionMissionPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const title = t('common.nav.visionMission');

  return (
    <>
      <PageHero title={title} breadcrumbs={[{ label: t('about.title'), href: aboutRoutes.about }, { label: title }]} />

      <article className="relative bg-ivory">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <div className="mx-auto max-w-[46rem]">
            <section id="vision" aria-labelledby="vision-heading" className="scroll-mt-28">
              <Reveal>
                <h2 id="vision-heading">{t('vision.title')}</h2>
              </Reveal>
              <PullQuote className="mt-8">{t('vision.statement')}</PullQuote>
              <div className="mt-10 grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
                <Reveal>
                  <p className="text-body text-ink md:text-[1.125rem] md:leading-relaxed">{t('vision.body')}</p>
                </Reveal>
                <Reveal>
                  <Illustration image={visionImage} alt={t(altKeyFor(visionImage))} sizes="(min-width: 768px) 14rem, 70vw" className="mx-auto w-full max-w-[16rem]" />
                </Reveal>
              </div>
            </section>

            <section id="mission" aria-labelledby="mission-heading" className="mt-14 scroll-mt-28 border-t border-rani-100 pt-12 md:mt-16 md:pt-14">
              <Reveal>
                <h2 id="mission-heading">{t('mission.title')}</h2>
              </Reveal>
              <PullQuote className="mt-8">{t('mission.intro')}</PullQuote>

              <Reveal>
                <h3 className="mt-12 font-display text-h3 font-bold text-rani-600">{t('mission.goals.heading')}</h3>
              </Reveal>
              <Reveal stagger as="ol" className="mt-5 grid gap-4">
                {missionGoalKeys.map((key, i) => (
                  <li key={key} className="flex gap-5 border-b border-rani-200/60 pb-4 last:border-b-0">
                    <span aria-hidden="true" className="w-9 shrink-0 font-display text-h3 font-bold leading-none text-rani-500">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-body text-ink">{t(key)}</p>
                  </li>
                ))}
              </Reveal>

              <Reveal>
                <h3 className="mt-12 font-display text-h3 font-bold text-rani-600">{t('mission.coreValues.heading')}</h3>
              </Reveal>
              <Reveal stagger as="dl" className="mt-5 grid gap-4 sm:grid-cols-2">
                {missionValueKeys.map((key) => {
                  const { term, description } = splitValue(t(key));
                  return (
                    <div key={key} className="rounded-2xl bg-blush p-5">
                      <dt className="font-display text-[1.0625rem] font-bold text-rani-600">{term}</dt>
                      <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink">{description}</dd>
                    </div>
                  );
                })}
              </Reveal>
            </section>
          </div>
        </div>
      </article>

      <CtaBand />
    </>
  );
}
