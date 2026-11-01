import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GoldenThread, Reveal } from '@/components/motion';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { Illustration } from '@/components/ui/Illustration';
import { PullQuote } from '@/components/ui/PullQuote';
import { TeaserCard } from '@/components/ui/TeaserCard';
import { aboutRoutes, visionImage } from '@/data/about';
import { altKeyFor } from '@/data/images';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return { title: t('vision.title'), description: t('vision.body') };
}

/**
 * Our Vision (site-plan): long-form reading layout. The vision statement is the
 * pull-quote, then the body with the crawled vision picture, then a link to Mission.
 */
export default async function VisionPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHero title={t('vision.title')} breadcrumbs={[{ label: t('about.title'), href: aboutRoutes.about }, { label: t('vision.title') }]} />

      <article className="relative bg-ivory">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <div className="mx-auto max-w-[46rem]">
            <PullQuote>{t('vision.statement')}</PullQuote>
            <div className="mt-16 grid items-center gap-10 md:mt-20 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
              <Reveal>
                <p className="text-body text-ink md:text-[1.25rem] md:leading-relaxed">{t('vision.body')}</p>
              </Reveal>
              <Reveal>
                <Illustration image={visionImage} alt={t(altKeyFor(visionImage))} sizes="(min-width: 768px) 16rem, 70vw" className="mx-auto w-full max-w-[18rem]" />
              </Reveal>
            </div>
          </div>
        </div>
      </article>

      <section className="relative bg-ivory-100">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <Reveal className="mx-auto max-w-[46rem]">
            <TeaserCard title={t('mission.title')} text={t('mission.intro')} href={aboutRoutes.mission} />
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
