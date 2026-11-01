import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GoldenThread, Reveal } from '@/components/motion';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { PullQuote } from '@/components/ui/PullQuote';
import { TeaserCard } from '@/components/ui/TeaserCard';
import { aboutRoutes, missionGoalKeys, missionValueKeys, splitValue } from '@/data/about';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return { title: t('mission.title'), description: t('mission.intro') };
}

/**
 * Our Mission (site-plan): long-form reading layout. The key statement is a pull-quote,
 * then the numbered goals and the core values, then a link to the sibling Vision page.
 */
export default async function MissionPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHero title={t('mission.title')} breadcrumbs={[{ label: t('about.title'), href: aboutRoutes.about }, { label: t('mission.title') }]} />

      <article className="relative bg-ivory">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <div className="mx-auto max-w-[46rem]">
            <PullQuote>{t('mission.intro')}</PullQuote>

            <section className="mt-16 md:mt-20">
              <Reveal>
                <h2>{t('mission.goals.heading')}</h2>
              </Reveal>
              <Reveal stagger as="ol" className="mt-8 grid gap-5">
                {missionGoalKeys.map((key, i) => (
                  <li key={key} className="flex gap-5 border-b border-rani-200/60 pb-5 last:border-b-0">
                    <span aria-hidden="true" className="w-10 shrink-0 font-display text-h3 font-semibold leading-none text-rani-600">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-body text-ink">{t(key)}</p>
                  </li>
                ))}
              </Reveal>
            </section>

            <section className="mt-16 md:mt-20">
              <Reveal>
                <h2>{t('mission.coreValues.heading')}</h2>
              </Reveal>
              <Reveal stagger as="dl" className="mt-8 grid gap-5 sm:grid-cols-2">
                {missionValueKeys.map((key) => {
                  const { term, description } = splitValue(t(key));
                  return (
                    <div key={key} className="rounded-2xl border border-rani-100 bg-ivory-100 p-6">
                      <dt className="font-display text-h3 font-semibold text-plum-900">{term}</dt>
                      <dd className="mt-2 text-body text-ink-muted">{description}</dd>
                    </div>
                  );
                })}
              </Reveal>
            </section>
          </div>
        </div>
      </article>

      <section className="relative bg-ivory-100">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <Reveal className="mx-auto max-w-[46rem]">
            <TeaserCard title={t('vision.title')} text={t('vision.statement')} href={aboutRoutes.vision} />
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
