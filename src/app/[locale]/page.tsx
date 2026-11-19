import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ImpactBand } from '@/components/sections/ImpactBand';
import { AboutIntro } from '@/components/sections/home/AboutIntro';
import { Awards } from '@/components/sections/home/Awards';
import { FeatureCards } from '@/components/sections/home/FeatureCards';
import { Hero } from '@/components/sections/home/Hero';
import { LoanStrip } from '@/components/sections/home/LoanStrip';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'home' });
  return { title: { absolute: t('meta.title') } };
}

/**
 * Home (CR-01 compact): hero → three feature cards → awards & recognition → About →
 * impact band → loan products.
 * The old home sections moved so nothing is lost: services and testimonials to About,
 * process and FAQ to Membership, team to the Team page, milestone to About/Milestones.
 */
export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <FeatureCards />
      <Awards />
      <AboutIntro />
      <ImpactBand />
      <LoanStrip />
    </>
  );
}
