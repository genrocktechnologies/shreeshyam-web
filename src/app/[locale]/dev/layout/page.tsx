import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Reveal } from '@/components/motion';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { altKeyFor } from '@/data/images';
import { richTags } from '@/lib/rich';

export { generateStaticParams } from '@/i18n/static-params';

/**
 * Hidden layout-chrome demo (Phase 2): PageHero + Breadcrumbs + CtaBand with real About
 * content, under the real header/footer. Not linked, noindex. DELETE BEFORE LAUNCH with
 * the rest of src/app/[locale]/dev/ (build-plan, Phase 8).
 */
export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Layout chrome', robots: { index: false, follow: false } };
}

export default async function LayoutDemo({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHero
        title={t('about.title')}
        eyebrow={t('home.aboutIntro.eyebrow')}
        breadcrumbs={[{ label: t('about.title') }]}
        intro={<p>{t('home.aboutIntro.title')}</p>}
        image={{ key: 'aboutArch', alt: t(altKeyFor('aboutArch')) }}
      />
      <section className="container-site section-pad">
        <Reveal className="mx-auto grid max-w-prose gap-5">
          <h2>{t('about.foundation.heading')}</h2>
          <p>{t.rich('about.foundation.body1', richTags)}</p>
          <p>{t('about.foundation.body2')}</p>
        </Reveal>
      </section>
      {/* Tall spacer so the header's hide-on-scroll can be tried. */}
      <section aria-hidden="true" className="h-[120vh] bg-marigold-50" />
      <CtaBand />
    </>
  );
}
