import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { formFields, formLabels } from '@/components/forms/fields';
import { LazyWebForm } from '@/components/forms/LazyWebForm';
import { PageHero } from '@/components/sections/PageHero';
import { Button } from '@/components/ui/Button';
import { Mail } from '@/components/ui/icons';
import { Illustration } from '@/components/ui/Illustration';
import { altKeyFor } from '@/data/images';
import { site } from '@/data/site';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return { title: t('common.nav.careers'), description: t('careers.heading') };
}

/**
 * Careers (site-plan; Phase 6, CR-01 compact style). The crawled page is just "Apply For
 * Jobs", its illustration and the form, so that is all it shows (no invented copy). CVs
 * are never uploaded: the note links to the foundation's email. Links to the HR Policy.
 */
export default async function CareersPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const title = t('common.nav.careers');
  // "To share your CV, email it to {email}." with the address as a mailto link.
  const [cvBefore, cvAfter = ''] = (t.raw('common.form.careersCv') as string).split('{email}');

  return (
    <>
      <PageHero title={title} breadcrumbs={[{ label: title }]} />

      <section className="relative bg-ivory">
        <div className="container-site section-pad grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-12">
          <div className="grid justify-items-center gap-6 lg:sticky lg:top-32">
            <Illustration image="careers" alt={t(altKeyFor('careers'))} sizes="(min-width: 1024px) 24rem, 70vw" priority className="w-full max-w-[18rem] lg:max-w-[24rem]" />
            <Button href="/hr-policy/" variant="ghost" arrow>
              {t('common.nav.hrPolicy')}
            </Button>
          </div>

          {/* In the first screen on phones: painted at once (no Reveal). */}
          <div className="rounded-2xl bg-white p-5 shadow-soft md:p-7">
            <h2>{t('careers.heading')}</h2>
            <p className="mt-3 flex items-start gap-3 rounded-xl bg-blush px-4 py-3 text-body text-ink">
              <Mail aria-hidden="true" strokeWidth={1.75} className="mt-1 h-5 w-5 shrink-0 text-rani-500" />
              <span>
                {cvBefore}
                <a href={`mailto:${site.email}`} className="break-all font-semibold text-rani-600 underline underline-offset-4">
                  {site.email}
                </a>
                {cvAfter}
              </span>
            </p>
            <div className="mt-6">
              <LazyWebForm form="careers" fields={formFields('careers', t)} labels={formLabels(t)} subject={t('careers.heading')} locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
