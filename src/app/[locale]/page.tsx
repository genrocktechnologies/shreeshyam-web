import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AboutIntro } from '@/components/sections/home/AboutIntro';
import { Hero } from '@/components/sections/home/Hero';
import { StatsBand } from '@/components/sections/home/StatsBand';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'home' });
  return { title: { absolute: t('meta.title') } };
}

/**
 * Home (site-plan, 11 sections). Phase 3 checkpoint: sections 1–3 (hero, trust stats,
 * About). Sections 4–11 follow after review.
 */
export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <StatsBand />
      <AboutIntro />
    </>
  );
}
