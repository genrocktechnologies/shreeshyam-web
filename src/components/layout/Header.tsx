import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { HandCoins, Mail, MapPin, MessageCircle, Milk, Phone, Sprout, Store, type IconComponent } from '@/components/ui/icons';
import { Logo } from '@/components/ui/Logo';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { altKeyFor } from '@/data/images';
import { loans, loansHubHref } from '@/data/loans';
import { site } from '@/data/site';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { HeaderShell } from './HeaderShell';
import { LanguageSwitch } from './LanguageSwitch';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { NavLink } from './NavLink';

/** About-cluster links. Gallery stays out of navigation until it has photos (site-plan). */
export const ABOUT_LINKS = [
  { href: '/about/', key: 'aboutUs' },
  { href: '/about/mission/', key: 'mission' },
  { href: '/about/vision/', key: 'vision' },
  { href: '/about/team/', key: 'team' },
  { href: '/about/milestones/', key: 'milestones' },
] as const;

const TOP_LINKS = [
  { href: '/how-to-join/', key: 'howToJoin' },
  { href: '/careers/', key: 'careers' },
  { href: '/contact/', key: 'contact' },
] as const;

export const LOAN_ICONS: Record<(typeof loans)[number]['id'], IconComponent> = {
  womenEmpowerment: HandCoins,
  microBusiness: Store,
  agricultureLivelihood: Sprout,
  livestock: Milk,
};

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const newTab = t('common.a11y.opensInNewTab');
  const languageSwitch = (
    <LanguageSwitch
      label={t('common.a11y.chooseLanguage')}
      options={routing.locales.map((l) => ({ locale: l, short: t(`common.languages.${l}Short`), full: t(`common.languages.${l}`) }))}
    />
  );

  const aboutPanel = (
    <div className="container-site grid gap-8 py-8 lg:grid-cols-[1fr_minmax(0,22rem)]">
      <ul className="grid content-start gap-1 sm:grid-cols-2">
        {ABOUT_LINKS.map((l, i) => (
          <li key={l.href} data-stagger style={{ ['--i' as string]: i }}>
            <NavLink href={l.href} exact className="link-draw inline-flex min-h-tap items-center text-h3 font-bold text-plum-900 hover:text-rani-700">
              {t(`common.nav.${l.key}`)}
            </NavLink>
          </li>
        ))}
      </ul>
      <Link
        href="/about/milestones/"
        prefetch={false}
        data-stagger
        style={{ ['--i' as string]: ABOUT_LINKS.length }}
        className="group grid grid-cols-[8.5rem_1fr] items-center gap-4 rounded-2xl border border-rani-100 bg-white p-3 shadow-soft transition-shadow duration-card hover:shadow-lift"
      >
        {/* Two-person photo: wide frame (data), so neither person is cut off. */}
        <PhotoFrame image="award" alt={t(altKeyFor('award'))} motion="none" sizes="136px" className="w-full" />
        <span>
          <span className="eyebrow block">{t('common.nav.milestones')}</span>
          <span className="mt-1 block font-bold leading-snug text-plum-900 group-hover:text-rani-700">{t('milestones.award.heading')}</span>
        </span>
      </Link>
    </div>
  );

  const loansPanel = (
    <div className="container-site py-8">
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loans.map((loan, i) => {
          const Icon = LOAN_ICONS[loan.id];
          return (
            <li key={loan.id} data-stagger style={{ ['--i' as string]: i }}>
              <NavLink
                href={loan.href}
                exact
                className="group flex h-full flex-col gap-3 rounded-2xl border border-rani-100 bg-white p-5 shadow-soft transition-shadow duration-card hover:shadow-lift"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-rani-50 text-rani-600">
                  <Icon aria-hidden="true" strokeWidth={1.75} className="h-6 w-6 transition-transform duration-press ease-growth group-hover:rotate-[8deg]" />
                </span>
                <span className="font-bold leading-snug text-plum-900 group-hover:text-rani-700">{t(loan.navKey)}</span>
                <span className="text-small text-ink-muted">{t(loan.purposeKey)}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
      <div data-stagger style={{ ['--i' as string]: loans.length }} className="mt-6">
        <Button href={loansHubHref} prefetch={false} variant="link" arrow>
          {t('common.nav.allLoans')}
        </Button>
      </div>
    </div>
  );

  const mobileNav = (
    <nav aria-label={t('common.a11y.mainNavigation')} className="flex flex-1 flex-col gap-8 px-6 pb-10">
      <div data-stagger style={{ ['--i' as string]: 0 }}>
        <p className="eyebrow mb-2">{t('common.nav.about')}</p>
        <ul>
          {ABOUT_LINKS.map((l) => (
            <li key={l.href}>
              <NavLink href={l.href} exact className="flex min-h-tap items-center text-h3 font-bold text-plum-900 aria-[current=page]:text-rani-700">
                {t(`common.nav.${l.key}`)}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div data-stagger style={{ ['--i' as string]: 1 }}>
        <p className="eyebrow mb-2">{t('common.nav.loans')}</p>
        <ul>
          {loans.map((loan) => (
            <li key={loan.id}>
              <NavLink href={loan.href} exact className="flex min-h-tap items-center text-h3 font-bold text-plum-900 aria-[current=page]:text-rani-700">
                {t(loan.navKey)}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink href={loansHubHref} exact className="flex min-h-tap items-center font-bold text-rani-700">
              {t('common.nav.allLoans')}
            </NavLink>
          </li>
        </ul>
      </div>
      <ul data-stagger style={{ ['--i' as string]: 2 }}>
        {TOP_LINKS.map((l) => (
          <li key={l.href}>
            <NavLink href={l.href} className="flex min-h-tap items-center text-h3 font-bold text-plum-900 aria-[current=page]:text-rani-700">
              {t(`common.nav.${l.key}`)}
            </NavLink>
          </li>
        ))}
      </ul>
      <div data-stagger style={{ ['--i' as string]: 3 }} className="mt-auto grid gap-4">
        <Button href="/register/" prefetch={false} size="lg" arrow>
          {t('common.buttons.register')}
        </Button>
        <ContactLinks t={t} newTab={newTab} className="grid gap-2 text-small text-ink-muted" />
      </div>
    </nav>
  );

  return (
    <HeaderShell>
      {/* Utility bar: desktop only; slides away with the header's scrolled state. */}
      <div className="hidden h-[var(--utility-h)] bg-plum-900 text-small text-ivory-100 lg:block">
        <ContactLinks t={t} newTab={newTab} className="container-site flex h-full items-center justify-end gap-6" compact />
      </div>

      <div data-bar className="relative">
        <div data-bar-inner className="container-site flex h-[var(--bar-h)] items-center justify-between gap-4">
          <Link id="site-logo" href="/" prefetch={false} className="shrink-0 rounded-lg">
            <Logo alt={t('common.alt.logo')} priority className="h-12 lg:h-14" />
          </Link>

          <nav aria-label={t('common.a11y.mainNavigation')} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              <MegaMenu id="about" label={t('common.nav.about')}>
                {aboutPanel}
              </MegaMenu>
              <MegaMenu id="loans" label={t('common.nav.loans')}>
                {loansPanel}
              </MegaMenu>
              {TOP_LINKS.map((l) => (
                <li key={l.href}>
                  <NavLink href={l.href} className="link-draw inline-flex min-h-tap items-center px-3 font-bold text-plum-900 aria-[current=page]:text-rani-700">
                    {t(`common.nav.${l.key}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 lg:gap-4">
            {languageSwitch}
            <Button href="/register/" prefetch={false} arrow className="hidden lg:inline-flex">
              {t('common.buttons.register')}
            </Button>
            <MobileMenu
              className="lg:hidden"
              openLabel={t('common.a11y.openMenu')}
              closeLabel={t('common.a11y.closeMenu')}
              dialogLabel={t('common.a11y.siteMenu')}
            >
              {mobileNav}
            </MobileMenu>
          </div>
        </div>
      </div>
    </HeaderShell>
  );
}

type T = Awaited<ReturnType<typeof getTranslations>>;

/** Address (opens Maps), email, phone and WhatsApp. Phone/WhatsApp only when they exist. */
function ContactLinks({ t, newTab, className, compact = false }: { t: T; newTab: string; className?: string; compact?: boolean }) {
  const item = 'inline-flex items-center gap-2 hover:underline underline-offset-4';
  return (
    <ul className={className}>
      <li className={compact ? 'min-w-0' : undefined}>
        <a href={site.map.shortUrl} target="_blank" rel="noopener noreferrer" className={`${item} ${compact ? 'max-w-[38rem] truncate' : ''}`}>
          <MapPin aria-hidden="true" strokeWidth={1.75} className="h-4 w-4 shrink-0" />
          <span className={compact ? 'truncate' : undefined}>{t(site.address.textKey)}</span>
          <span className="sr-only">{newTab}</span>
        </a>
      </li>
      <li>
        <a href={`mailto:${site.email}`} className={item}>
          <Mail aria-hidden="true" strokeWidth={1.75} className="h-4 w-4 shrink-0" />
          {site.email}
        </a>
      </li>
      {site.phone && (
        <li>
          <a href={site.phone.href} className={item}>
            <Phone aria-hidden="true" strokeWidth={1.75} className="h-4 w-4 shrink-0" />
            {site.phone.display}
          </a>
        </li>
      )}
      {site.whatsapp && (
        <li>
          <a href={site.whatsapp.href} target="_blank" rel="noopener noreferrer" className={item}>
            <MessageCircle aria-hidden="true" strokeWidth={1.75} className="h-4 w-4 shrink-0" />
            {t('common.social.whatsapp')}
            <span className="sr-only">{newTab}</span>
          </a>
        </li>
      )}
    </ul>
  );
}
