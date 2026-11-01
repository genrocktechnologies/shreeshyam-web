import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GoldenThread, Reveal } from '@/components/motion';
import { CtaBand } from '@/components/sections/CtaBand';
import { Milestone } from '@/components/sections/Milestone';
import { Services } from '@/components/sections/Services';
import { Testimonials } from '@/components/sections/Testimonials';
import { ImpactBand } from '@/components/sections/ImpactBand';
import { PageHero } from '@/components/sections/PageHero';
import { Button } from '@/components/ui/Button';
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
 * About (site-plan, CR-01): intro → foundation story (both paragraphs; home shows only the
 * first) with a link to the Team page → What we do (the 6 services, moved from home) →
 * Why choose → impact band → testimonials (moved from home) → Vision & Mission teasers →
 * milestone → CTA. The team itself lives on /about/team/ (the tree), not repeated here.
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
        <div className="container-site thread-gutter section-pad relative grid items-center gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <div>
            {/* Right under the hero, inside the first screen on desktop: no Reveal here, so
                nothing in view waits for JS (LCP). */}
            <h2>{t('about.foundation.heading')}</h2>
            <div className="mt-6 grid gap-5 text-body text-ink">
              <p>{t.rich('about.foundation.body1', richTags)}</p>
              <p>{t('about.foundation.body2')}</p>
            </div>
            <Button href={aboutRoutes.team} variant="ghost" arrow className="mt-6">
              {t('common.buttons.meetTheTeam')}
            </Button>
          </div>
          <Illustration
            image={aboutImages.foundation}
            alt={t(altKeyFor(aboutImages.foundation))}
            sizes="(min-width: 768px) 28rem, 90vw"
            // The LCP element at 1440 (inside the first screen, beside the foundation text).
            priority
            className="mx-auto w-full max-w-[28rem]"
          />
        </div>
      </section>

      <Services />

      <section className="relative bg-blush">
        <div className="container-site section-pad relative">
          <SectionHeading title={t('about.whyChoose.heading')} />
          <Reveal stagger as="ul" className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {whyChoose.map((item) => (
              <li key={item.id}>
                <FeatureCard icon={ICONS[item.id]} title={t(item.titleKey)} text={t(item.textKey)} inlineIcon />
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <ImpactBand />
      <Testimonials />

      <section className="relative bg-ivory">
        <div className="container-site section-pad relative">
          <Reveal stagger className="grid gap-5 md:grid-cols-2 md:gap-6">
            <TeaserCard title={t('mission.title')} text={t('mission.intro')} href={`${aboutRoutes.visionMission}#mission`} />
            <TeaserCard title={t('vision.title')} text={t('vision.statement')} href={`${aboutRoutes.visionMission}#vision`} />
          </Reveal>
        </div>
      </section>

      <Milestone />
      <CtaBand />
    </>
  );
}
