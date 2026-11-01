/* eslint-disable @next/next/no-img-element -- decorative brand file from public/brand */
import { getTranslations } from 'next-intl/server';
import { BrandLockup } from '@/components/ui/BrandLockup';
import { Mail, Phone } from '@/components/ui/icons';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { aboutRoutes } from '@/data/about';
import { loansHubHref } from '@/data/loans';
import { membershipRoutes } from '@/data/membership';
import { site } from '@/data/site';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/** CR-01 quick links, one line on desktop. */
const QUICK_LINKS = [
  { href: aboutRoutes.about, key: 'aboutUs' },
  { href: aboutRoutes.visionMission, key: 'visionMission' },
  { href: loansHubHref, key: 'loanProductsMenu' },
  { href: membershipRoutes.membership, key: 'membership' },
  { href: '/careers/', key: 'careers' },
  { href: '/contact/', key: 'contactUs' },
] as const;

/**
 * Bottom-bar links. Terms & Conditions is added only when the client supplies its text
 * (client-requests, CR-01): never link to a page that doesn't exist.
 */
const LEGAL_LINKS = [
  { href: '/privacy-policy/', key: 'privacyPolicy' },
  { href: '/hr-policy/', key: 'hrPolicy' },
  { href: '/contact/', key: 'contactUs' },
] as const;

/** Copyright year from the build date (static export: set when the site is built). */
const BUILD_YEAR = String(new Date().getFullYear());

const link = 'inline-flex min-h-tap items-center whitespace-nowrap text-white underline-offset-4 hover:underline';
const round = 'grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white transition-transform duration-press ease-growth hover:-translate-y-0.5';

/**
 * Compact footer (CR-01, section 6; design-system, Footer): magenta, with the emblem as a
 * faint watermark (always whole, never cropped; shown only where the page margin fits it).
 * Row 1: lockup · quick links over phone and email · socials. Bottom bar: copyright on the
 * left, legal links on the right. Below md the contacts are icon buttons beside the
 * socials, so the footer stays within its height target (≤ 520px at 360); the bottom bar
 * gets extra padding for the fixed action bar.
 */
export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });

  return (
    <footer className="footer-surface relative overflow-hidden text-white">
      {/* Emblem watermark: whole, in the page margin beside the container (from 1400px,
          where the margin fits it), so no text or icon ever sits across it. */}
      <img
        src="/brand/logo-mark-160.webp"
        alt=""
        aria-hidden="true"
        width={160}
        height={186}
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute right-[max(0.75rem,calc((100%-1240px)/2-6.5rem))] top-1/2 hidden h-28 w-auto -translate-y-1/2 select-none opacity-[0.12] min-[1400px]:block"
      />

      <div className="container-site relative">
        <div className="grid gap-4 py-6 lg:py-7 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-center xl:gap-6">
          <Link href="/" prefetch={false} className="inline-block justify-self-start rounded-lg [--lockup-line1:1.25rem] [--lockup-line2:0.6875rem] [--lockup-mark:3rem] lg:[--lockup-mark:3.5rem]">
            <BrandLockup line1={t('common.brand.nameLine1')} line2={t('common.brand.nameLine2')} logoAlt={t('common.alt.logo')} tone="onDark" />
          </Link>

          <div className="grid gap-2 xl:justify-items-center xl:gap-0">
            <nav aria-label={t('common.a11y.footerNavigation')}>
              <ul className="grid grid-cols-2 gap-x-6 sm:flex sm:flex-wrap sm:gap-x-5 xl:flex-nowrap xl:justify-center xl:gap-x-4 xl:text-[0.9375rem]">
                {QUICK_LINKS.map((l) => (
                  <li key={l.key}>
                    <Link href={l.href} prefetch={false} className={`${link} font-medium`}>
                      {t(`common.nav.${l.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {/* Contact: phone and email. Icon buttons below md (keeps the footer short). */}
            <ul className="hidden flex-wrap gap-x-6 text-small md:flex">
              <li className="sr-only">
                <h2>{t('common.footer.contactHeading')}</h2>
              </li>
              {site.phone && (
                <li>
                  <a href={site.phone.href} className={`${link} gap-2`}>
                    <Phone aria-hidden="true" strokeWidth={1.75} className="h-4 w-4 text-marigold-400" />
                    {site.phone.display}
                  </a>
                </li>
              )}
              <li>
                <a href={`mailto:${site.email}`} className={`${link} gap-2`}>
                  <Mail aria-hidden="true" strokeWidth={1.75} className="h-4 w-4 text-marigold-400" />
                  {site.email}
                </a>
              </li>
            </ul>
          </div>

          <ul className="flex flex-wrap gap-1.5 sm:gap-2">
            {site.phone && (
              <li className="md:hidden">
                <a href={site.phone.href} aria-label={t('common.a11y.callUs', { phone: site.phone.display })} className={round}>
                  <Phone aria-hidden="true" strokeWidth={1.75} className="h-5 w-5" />
                </a>
              </li>
            )}
            <li className="md:hidden">
              <a href={`mailto:${site.email}`} aria-label={t('common.a11y.emailUs', { email: site.email })} className={round}>
                <Mail aria-hidden="true" strokeWidth={1.75} className="h-5 w-5" />
              </a>
            </li>
            {/* Placeholder links at the client's request (content rule 6). */}
            {site.socials.map((s) => (
              <li key={s.network}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={t('common.a11y.socialLink', { network: t(`common.social.${s.network}`) })} className={round}>
                  <SocialIcon network={s.network} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom bar. Extra bottom padding below md leaves room for the fixed MobileActionBar. */}
        <div className="flex flex-col gap-1 border-t border-white/25 pb-[calc(0.75rem+72px+env(safe-area-inset-bottom))] pt-3 text-small md:flex-row md:items-center md:justify-between md:gap-6 md:pb-3">
          <p className="text-white">{t('common.footer.rights', { year: BUILD_YEAR })}</p>
          <nav aria-label={t('common.a11y.legalNavigation')}>
            <ul className="flex shrink-0 flex-wrap gap-x-5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.key}>
                  <Link href={l.href} prefetch={false} className={link}>
                    {t(`common.nav.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
