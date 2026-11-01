import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GoldenThread, Reveal } from '@/components/motion';
import { CtaBand } from '@/components/sections/CtaBand';
import { Milestone } from '@/components/sections/home/Milestone';
import { StatsBand } from '@/components/sections/home/StatsBand';
import { PageHero } from '@/components/sections/PageHero';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { BookOpen, HeartHandshake, Scale, ShieldCheck, Sprout, Users, type IconComponent } from '@/components/ui/icons';
import { Illustration } from '@/components/ui/Illustration';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TeaserCard } from '@/components/ui/TeaserCard';
import { aboutImages, aboutRoutes, whyChoose } from '@/data/about';
import { altKeyFor } from '@/data/images';
import { richTags } from '@/lib/rich';

export { generateStaticParams } from '@/i18n/static-params';

const ICONS: Record<string, IconComponent> = {
  trustedFinancial: ShieldCheck,
  womenEmpowerment: Users,
  customerCentric: HeartHandshake,
  financialLiteracy: BookOpen,
  sustainableGrowth: Sprout,
  transparentOperations: Scale,
};

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return { title: t('about.title'), description: t('about.foundation.body2') };
}

/**
 * About (site-plan): intro → foundation story (crawled sections in order) → stats →
 * Mission & Vision teasers → milestone → CTA. The crawled team section lives on
 * /about/team/ (shared data), not repeated here.
 */
export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHero
        title={t('about.title')}
        eyebrow={t('home.aboutIntro.eyebrow')}
        breadcrumbs={[{ label: t('about.title') }]}
        intro={<p className="max-w-prose">{t('home.aboutIntro.title')}</p>}
        image={{ key: aboutImages.hero, alt: t(altKeyFor(aboutImages.hero)) }}
      />

      <section className="relative bg-ivory">
        <div className="container-site thread-gutter section-pad relative grid items-center gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <div>
            <SectionHeading title={t('about.foundation.heading')} />
            <Reveal className="mt-6 grid gap-5 text-body text-ink">
              <p>{t.rich('about.foundation.body1', richTags)}</p>
              <p>{t('about.foundation.body2')}</p>
            </Reveal>
          </div>
          <Reveal>
            <Illustration
              image={aboutImages.foundation}
              alt={t(altKeyFor(aboutImages.foundation))}
              sizes="(min-width: 768px) 28rem, 90vw"
              className="mx-auto w-full max-w-[28rem]"
            />
          </Reveal>
        </div>
      </section>

      <section className="relative bg-ivory-100">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <SectionHeading title={t('about.whyChoose.heading')} />
          <Reveal stagger as="ul" className="mt-12 grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {whyChoose.map((item) => (
              <li key={item.id}>
                <FeatureCard icon={ICONS[item.id]} title={t(item.titleKey)} text={t(item.textKey)} />
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <StatsBand />

      <section className="relative bg-ivory">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <Reveal stagger className="grid gap-6 md:grid-cols-2 md:gap-8">
            <TeaserCard title={t('mission.title')} text={t('mission.intro')} href={aboutRoutes.mission} />
            <TeaserCard title={t('vision.title')} text={t('vision.statement')} href={aboutRoutes.vision} />
          </Reveal>
        </div>
      </section>

      <Milestone />
      <CtaBand />
    </>
  );
}
