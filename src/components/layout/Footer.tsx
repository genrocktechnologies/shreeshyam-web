import { Clock, Mail, MapPin, Phone } from '@/components/ui/icons';
import { getTranslations } from 'next-intl/server';
import { Logo } from '@/components/ui/Logo';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { site } from '@/data/site';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { richTags } from '@/lib/rich';

const QUICK_LINKS = [
  { href: '/about/', key: 'about' },
  { href: '/about/mission/', key: 'missionShort' },
  { href: '/loans/', key: 'loans' },
  { href: '/how-to-join/', key: 'howToJoin' },
  { href: '/register/', key: 'register' },
  { href: '/careers/', key: 'careers' },
] as const;

const LEGAL_LINKS = [
  { href: '/privacy-policy/', key: 'privacyPolicy' },
  { href: '/hr-policy/', key: 'hrPolicy' },
] as const;

/** Copyright year from the build date (static export: set when the site is built). */
const BUILD_YEAR = String(new Date().getFullYear());

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'common' });
  const newTab = t('a11y.opensInNewTab');
  const heading = 'mb-4 font-body text-small font-bold uppercase tracking-[0.14em] text-marigold-300 [:lang(hi)_&]:normal-case [:lang(hi)_&]:tracking-normal';
  const link = 'inline-flex min-h-tap items-center hover:text-marigold-300 hover:underline underline-offset-4';

  return (
    <footer className="grain relative bg-plum-900 text-ivory-100">
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:py-20">
        <div>
          <Link href="/" className="inline-block rounded-lg">
            <Logo variant="white" alt={t('alt.logo')} className="h-16" />
          </Link>
          <p className="mt-5 text-small leading-relaxed text-ivory-100/85">{t.rich('footer.blurb', richTags)}</p>
        </div>

        <nav aria-label={t('a11y.footerNavigation')}>
          <h2 className={heading}>{t('nav.quickLinks')}</h2>
          <ul>
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>
                  {t(`nav.${l.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t('a11y.legalNavigation')}>
          <h2 className={heading}>{t('nav.legal')}</h2>
          <ul>
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>
                  {t(`nav.${l.key}`)}
                </Link>
              </li>
            ))}
          </ul>
          {/* Hidden slots until the client supplies them (client-requests B). */}
          {site.legal && <p className="mt-4 text-small text-ivory-100/80">{site.legal.registration}</p>}
          {site.grievance && <p className="mt-2 text-small text-ivory-100/80">{site.grievance.name}</p>}
        </nav>

        <div>
          <h2 className={heading}>{t('footer.contactHeading')}</h2>
          <ul className="grid gap-3 text-small">
            <li>
              <a href={site.map.shortUrl} target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:text-marigold-300">
                <MapPin aria-hidden="true" strokeWidth={1.75} className="mt-0.5 h-5 w-5 shrink-0 text-marigold-300" />
                <span>
                  {t('contact.address')}
                  <span className="sr-only"> {newTab}</span>
                </span>
              </a>
            </li>
            {site.phone && (
              <li>
                <a href={site.phone.href} className="flex min-h-tap items-center gap-3 hover:text-marigold-300">
                  <Phone aria-hidden="true" strokeWidth={1.75} className="h-5 w-5 shrink-0 text-marigold-300" />
                  {site.phone.display}
                </a>
              </li>
            )}
            <li>
              <a href={`mailto:${site.email}`} className="flex min-h-tap items-center gap-3 break-all hover:text-marigold-300">
                <Mail aria-hidden="true" strokeWidth={1.75} className="h-5 w-5 shrink-0 text-marigold-300" />
                {site.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock aria-hidden="true" strokeWidth={1.75} className="mt-0.5 h-5 w-5 shrink-0 text-marigold-300" />
              <span>
                <span className="block font-bold">{t('contact.hoursLabel')}</span>
                {t('contact.hours')}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        {/* Bottom padding below md leaves room for the fixed MobileActionBar. */}
        <div className="container-site flex flex-col-reverse items-center justify-between gap-4 pb-[calc(1.5rem+72px+env(safe-area-inset-bottom))] pt-6 text-small text-ivory-100/80 md:flex-row md:pb-6">
          <p>{t('footer.copyright', { year: BUILD_YEAR })}</p>
          {/* Placeholder links at the client's request (content rule 6). */}
          {site.socials.length > 0 && (
            <ul aria-label={t('a11y.socialLinks')} className="flex gap-2">
              {site.socials.map((s) => (
                <li key={s.network}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('a11y.socialLink', { network: t(`social.${s.network}`) })}
                    className="grid h-12 w-12 place-items-center rounded-full bg-ivory/10 transition-transform duration-300 ease-growth hover:-translate-y-0.5 hover:text-marigold-300"
                  >
                    <SocialIcon network={s.network} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
