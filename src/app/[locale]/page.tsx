import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AboutIntro } from '@/components/sections/home/AboutIntro';
import { Faq } from '@/components/sections/home/Faq';
import { FinalCta } from '@/components/sections/home/FinalCta';
import { Hero } from '@/components/sections/home/Hero';
import { Loans } from '@/components/sections/home/Loans';
import { Milestone } from '@/components/sections/home/Milestone';
import { Process } from '@/components/sections/home/Process';
import { Services } from '@/components/sections/home/Services';
import { StatsBand } from '@/components/sections/home/StatsBand';
import { TeamGrid } from '@/components/sections/home/TeamGrid';
import { Testimonials } from '@/components/sections/home/Testimonials';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'home' });
  return { title: { absolute: t('meta.title') } };
}

/**
 * Home (site-plan, 11 sections). The golden thread runs through all of them: seed and
 * stem (hero) → stats → About → Services → branches (Loans) → connector (Process) →
 * wrap (Milestone) → Testimonials → Team → FAQ → bloom (final CTA).
 */
export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <StatsBand />
      <AboutIntro />
      <Services />
      <Loans />
      <Process />
      <Milestone />
      <Testimonials />
      <TeamGrid />
      <Faq />
      <FinalCta />
    </>
  );
}
