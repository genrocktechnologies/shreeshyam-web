import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { formFields, formLabels } from '@/components/forms/fields';
import { LazyWebForm } from '@/components/forms/LazyWebForm';
import { MapFacade } from '@/components/sections/contact/MapFacade';
import { PageHero } from '@/components/sections/PageHero';
import { Clock, Mail, MapPin, Phone, type IconComponent } from '@/components/ui/icons';
import { site } from '@/data/site';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return { title: t('contact.title'), description: t('contact.intro') };
}

/**
 * Contact (site-plan; Phase 6, CR-01 compact style): the details card (registered office
 * with a Maps link, phone, email, office time: the confirmed values in site.ts), the
 * contact form, and the click-to-load map on the confirmed Motihari Chini Mill pin.
 */
export default async function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const newTab = t('common.a11y.opensInNewTab');

  return (
    <>
      <PageHero title={t('contact.title')} breadcrumbs={[{ label: t('contact.title') }]} intro={<p className="max-w-prose">{t('contact.intro')}</p>} />

      <section className="relative bg-ivory">
        <div className="container-site section-pad grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-8">
          {/* In the first screen, so painted at once (no Reveal). */}
          <div className="rounded-2xl bg-white p-5 shadow-soft md:p-7">
            <h2>{t('contact.heading')}</h2>
            <ul className="mt-5 grid gap-4">
              <Detail icon={MapPin} label={t('contact.registeredOffice')}>
                <a href={site.map.shortUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                  {t(site.address.textKey)}
                  <span className="sr-only"> {newTab}</span>
                </a>
              </Detail>
              {site.phone && (
                <Detail icon={Phone} label={t('common.contact.phoneLabel')}>
                  <a href={site.phone.href} className="underline-offset-4 hover:underline">
                    {site.phone.display}
                  </a>
                </Detail>
              )}
              <Detail icon={Mail} label={t('common.contact.emailLabel')}>
                <a href={`mailto:${site.email}`} className="break-all underline-offset-4 hover:underline">
                  {site.email}
                </a>
              </Detail>
              {/* Office days aren't confirmed: the time only (client-requests). */}
              <Detail icon={Clock} label={t('contact.officeTime')}>
                {t(site.hours.textKey)}
              </Detail>
            </ul>
          </div>

          <div id="message" className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-soft md:p-7">
            <h2>{t('contact.form.heading')}</h2>
            <p className="mt-2 text-body text-ink-muted">{t('contact.form.intro')}</p>
            <div className="mt-6">
              <LazyWebForm form="contact" fields={formFields('contact', t)} labels={formLabels(t)} subject={t('contact.title')} locale={locale} />
            </div>
          </div>
        </div>
      </section>

      <section aria-label={t('common.a11y.mapTitle')} className="relative bg-blush">
        <div className="container-site py-10 md:py-12">
          <MapFacade
            embedUrl={site.map.embedUrl}
            title={t('common.a11y.mapTitle')}
            showLabel={t('common.buttons.showMap')}
            note={t('contact.map.note')}
            pinName={t(site.map.pinNameKey)}
            pinAddress={site.map.pinAddress}
            open={{ href: site.map.shortUrl, label: t('common.buttons.openInMaps'), newTab }}
          />
        </div>
      </section>
    </>
  );
}

function Detail({ icon: Icon, label, children }: { icon: IconComponent; label: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-4">
      <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-rani-50 text-rani-500">
        <Icon strokeWidth={1.75} className="h-5 w-5" />
      </span>
      <div>
        <h3 className="font-display text-[1.0625rem] font-bold text-rani-600">{label}</h3>
        <p className="mt-0.5 text-body text-ink">{children}</p>
      </div>
    </li>
  );
}
