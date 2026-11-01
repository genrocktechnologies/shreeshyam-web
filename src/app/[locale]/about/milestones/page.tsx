import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GoldenThread, Reveal, Shine } from '@/components/motion';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { aboutRoutes } from '@/data/about';
import { altKeyFor } from '@/data/images';
import { team } from '@/data/team';
import { trigger } from '@/lib/motion';
import { richTags } from '@/lib/rich';

export { generateStaticParams } from '@/i18n/static-params';

/** The award story is in the MD, CEO & Founder's own words (content rule 9). */
const author = team.find((m) => m.id === 'sauravPrakash')!;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return { title: t('milestones.title'), description: t('milestones.award.heading') };
}

/**
 * Our Milestone (site-plan): the crawled content has no dates, so it gets the editorial
 * layout, not a timeline: the award photo large (the thread wraps its frame, then one
 * shine on desktop), then the story in a reading column, signed by the MD, CEO & Founder.
 */
export default async function MilestonesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHero title={t('milestones.title')} breadcrumbs={[{ label: t('about.title'), href: aboutRoutes.about }, { label: t('milestones.title') }]} />

      <article className="relative bg-ivory">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread wrap="[data-award-frame]" start={trigger.wrapStart} end={trigger.wrapEnd} className="absolute inset-0 h-full w-full" />
          <div data-award-frame="" className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-soft">
            <PhotoFrame image="award" alt={t(altKeyFor('award'))} sizes="(min-width: 1024px) 56rem, 90vw" className="w-full" />
            <Shine />
          </div>

          <div className="mx-auto mt-16 max-w-[46rem] md:mt-20">
            <Reveal>
              <h2 className="text-balance">{t('milestones.award.heading')}</h2>
            </Reveal>
            <Reveal className="mt-8 grid gap-6 text-body text-ink md:text-[1.1875rem] md:leading-relaxed">
              <p>{t.rich('milestones.award.body1', richTags)}</p>
              <p>{t('milestones.award.body2')}</p>
            </Reveal>
            <Reveal className="mt-10 border-l-2 border-marigold-400 pl-5">
              <p className="accent-script text-rani-600">{t(author.nameKey)}</p>
              <p className="text-small text-ink-muted">{t(author.roleKey)}</p>
            </Reveal>
          </div>
        </div>
      </article>

      <CtaBand />
    </>
  );
}
