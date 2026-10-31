import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Clock, Mail, MapPin, Phone, type IconComponent } from '@/components/ui/icons';
import { Logo } from '@/components/ui/Logo';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { loans, loansHubHref } from '@/data/loans';
import { site } from '@/data/site';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { richTags } from '@/lib/rich';
import { BackToTop } from './BackToTop';
import { FooterWatermark } from './FooterWatermark';
import { ABOUT_LINKS } from './Header';

const HELP_LINKS = [
  { href: '/how-to-join/', key: 'howToJoin' },
  { href: '/register/', key: 'register' },
  { href: '/contact/', key: 'contact' },
  { href: '/careers/', key: 'careers' },
] as const;

const LEGAL_LINKS = [
  { href: '/privacy-policy/', key: 'privacyPolicy' },
  { href: '/hr-policy/', key: 'hrPolicy' },
] as const;

/** Copyright year from the build date (static export: set when the site is built). */
const BUILD_YEAR = String(new Date().getFullYear());

/**
 * Site footer (design-system, Footer): plum surface with a soft rani glow and the whole
 * logo emblem as a faint watermark; a top row (logo, blurb, contact chips, Register),
 * four link columns that reveal on scroll, and a bottom bar (copyright, socials,
 * Back to top). Mobile: links in a 2-column grid with 48px tap targets.
 */
export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const newTab = t('common.a11y.opensInNewTab');

  const columns: { heading: string; links: { href: string; label: string }[]; extra?: ReactNode }[] = [
    { heading: t('common.nav.about'), links: ABOUT_LINKS.map((l) => ({ href: l.href, label: t(`common.nav.${l.key}`) })) },
    {
      heading: t('common.nav.loans'),
      links: [...loans.map((l) => ({ href: l.href, label: t(l.navKey) })), { href: loansHubHref, label: t('common.nav.allLoans') }],
    },
    { heading: t('common.footer.help'), links: HELP_LINKS.map((l) => ({ href: l.href, label: t(`common.nav.${l.key}`) })) },
    {
      heading: t('common.nav.legal'),
      links: LEGAL_LINKS.map((l) => ({ href: l.href, label: t(`common.nav.${l.key}`) })),
      // Hidden slots until the client supplies them (client-requests B).
      extra: (
        <>
          {site.legal && <p className="mt-3 text-small text-ivory-100/80">{site.legal.registration}</p>}
          {site.grievance && <p className="mt-2 text-small text-ivory-100/80">{site.grievance.name}</p>}
        </>
      ),
    },
  ];

  return (
    <footer className="footer-surface grain relative overflow-hidden text-ivory-100">
      <FooterWatermark />

      <div className="container-site relative">
        {/* On desktop the right-hand column is reserved for the emblem watermark, so no
            text ever sits across the deity's face (FooterWatermark). */}
        <div className="lg:pr-[25rem] xl:pr-[30rem]">
        {/* Top row: brand + contact chips + Register. */}
        <div className="grid gap-10 pb-12 pt-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:gap-12 lg:pt-20">
          <div>
            <Link href="/" prefetch={false} className="inline-block rounded-lg">
              <Logo variant="white" alt={t('common.alt.logo')} className="h-16 lg:h-20" />
            </Link>
            <p className="mt-5 max-w-md text-body leading-relaxed text-ivory-100/85">{t.rich('common.footer.blurb', richTags)}</p>
          </div>

          <div className="lg:pt-2">
            <h2 className="sr-only">{t('common.footer.contactHeading')}</h2>
            <ul className="flex flex-wrap gap-3">
              {site.phone && (
                <Chip icon={Phone} href={site.phone.href}>
                  {site.phone.display}
                </Chip>
              )}
              <Chip icon={Mail} href={`mailto:${site.email}`} breakAll>
                {site.email}
              </Chip>
              <Chip icon={MapPin} href={site.map.shortUrl} newTab={newTab}>
                {t('common.contact.address')}
              </Chip>
              <Chip icon={Clock}>
                <span className="sr-only">{t('common.contact.hoursLabel')}: </span>
                {t('common.contact.hours')}
              </Chip>
            </ul>
            <Button href="/register/" prefetch={false} size="lg" arrow className="mt-6">
              {t('common.buttons.register')}
            </Button>
          </div>
        </div>

        {/* Link columns. */}
        <nav aria-label={t('common.a11y.footerNavigation')} className="border-t border-ivory/10 py-12">
          <Reveal stagger className="grid grid-cols-2 gap-x-6 gap-y-10 xl:grid-cols-4">
            {columns.map((col) => (
              <div key={col.heading}>
                <h2 className="mb-3 font-body text-small font-bold uppercase tracking-[0.14em] text-marigold-300 [:lang(hi)_&]:normal-case [:lang(hi)_&]:tracking-normal">
                  {col.heading}
                </h2>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        prefetch={false}
                        className="inline-flex min-h-tap items-center py-1 leading-snug text-ivory-100/90 underline-offset-4 hover:text-marigold-300 hover:underline"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                {col.extra}
              </div>
            ))}
          </Reveal>
        </nav>
        </div>

        {/* Bottom bar. Extra bottom padding below md leaves room for the fixed MobileActionBar. */}
        <div className="flex flex-col items-center gap-6 border-t border-ivory/10 pb-[calc(1.5rem+72px+env(safe-area-inset-bottom))] pt-6 text-small text-ivory-100/80 md:flex-row md:justify-between md:pb-8">
          <p className="text-center md:text-left">{t('common.footer.copyright', { year: BUILD_YEAR })}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Placeholder links at the client's request (content rule 6). */}
            {site.socials.length > 0 && (
              <ul aria-label={t('common.a11y.socialLinks')} className="flex gap-2">
                {site.socials.map((s) => (
                  <li key={s.network}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('common.a11y.socialLink', { network: t(`common.social.${s.network}`) })}
                      className="grid h-12 w-12 place-items-center rounded-full bg-ivory/10 transition-transform duration-press ease-growth hover:-translate-y-0.5 hover:text-marigold-300"
                    >
                      <SocialIcon network={s.network} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <BackToTop label={t('common.buttons.backToTop')} />
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Contact chip: a pill with an icon; a link when `href` is given. */
function Chip({ icon: Icon, href, newTab, breakAll, children }: { icon: IconComponent; href?: string; newTab?: string; breakAll?: boolean; children: ReactNode }) {
  const body = (
    <>
      <Icon className="h-5 w-5 shrink-0 text-marigold-300" />
      <span className={breakAll ? 'break-all' : undefined}>{children}</span>
      {newTab && <span className="sr-only"> {newTab}</span>}
    </>
  );
  const cls = 'inline-flex min-h-tap items-center gap-2.5 rounded-2xl border border-ivory/15 bg-ivory/[0.06] px-4 py-2 text-small leading-snug text-ivory-100';
  return (
    <li className="max-w-full">
      {href ? (
        <a href={href} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={`${cls} hover:border-marigold-300/60 hover:text-marigold-300`}>
          {body}
        </a>
      ) : (
        <span className={cls}>{body}</span>
      )}
    </li>
  );
}
