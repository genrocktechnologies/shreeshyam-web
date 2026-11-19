import { getTranslations } from 'next-intl/server';
import { BrandLockup } from '@/components/ui/BrandLockup';
import { Button } from '@/components/ui/Button';
import { Mail, MapPin, MessageCircle, Phone } from '@/components/ui/icons';
import { LOAN_ICONS } from '@/components/ui/loan-icons';
import { aboutRoutes } from '@/data/about';
import { gallery } from '@/data/gallery';
import { loans, loansHubHref } from '@/data/loans';
import { membershipRoutes } from '@/data/membership';
import { site } from '@/data/site';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { HeaderShell } from './HeaderShell';
import { LanguageSwitch } from './LanguageSwitch';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { NavLink } from './NavLink';

type T = Awaited<ReturnType<typeof getTranslations>>;

/**
 * CR-01 navigation (full row from xl, 1280px; the hamburger below, so it never wraps): Home · About Us · Vision & Mission · Loan Products ▾ · Membership ·
 * Gallery (only when `gallery.enabled`) · Contact Us. Careers lives in the footer.
 */
const BEFORE_LOANS = [
  { href: '/', key: 'home', exact: true },
  // About Us is active on the About pages, except Vision & Mission, which has its own item.
  { href: aboutRoutes.about, key: 'aboutUs', exclude: aboutRoutes.visionMission },
  { href: aboutRoutes.visionMission, key: 'visionMission' },
] as const;

const AFTER_LOANS = [
  { href: membershipRoutes.membership, key: 'membership' },
  ...(gallery.enabled ? [{ href: aboutRoutes.gallery, key: 'gallery' }] : []),
  { href: '/contact/', key: 'contactUs' },
] as { href: string; key: string; exact?: boolean; exclude?: string }[];

/** About pages without a desktop nav item, listed under About Us in the mobile sheet. */
const ABOUT_SUB = [
  { href: aboutRoutes.team, key: 'team' },
  { href: aboutRoutes.milestones, key: 'milestones' },
] as const;

/** Desktop nav pill: rounded; the current page is magenta with white text (CR-01). */
const pill =
  'inline-flex min-h-tap items-center whitespace-nowrap rounded-full px-3 text-[0.9375rem] font-medium text-ink hover:text-rani-600 aria-[current=page]:bg-rani-500 aria-[current=page]:text-white';
const sheetLink = 'flex min-h-tap items-center text-h3 font-semibold text-ink aria-[current=page]:text-rani-600';

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const newTab = t('common.a11y.opensInNewTab');
  const label = (key: string) => t(`common.nav.${key}`);
  const languageSwitch = (
    <LanguageSwitch
      label={t('common.a11y.chooseLanguage')}
      options={routing.locales.map((l) => ({ locale: l, short: t(`common.languages.${l}Short`), full: t(`common.languages.${l}`) }))}
    />
  );

  const loansPanel = (
    <ul className="grid gap-1">
      {loans.map((loan, i) => {
        const Icon = LOAN_ICONS[loan.id];
        return (
          <li key={loan.id} data-stagger style={{ ['--i' as string]: i }}>
            <NavLink
              href={loan.href}
              exact
              className="group flex min-h-tap items-center gap-3 rounded-xl px-3 py-2 font-medium text-ink hover:bg-rani-50 aria-[current=page]:text-rani-600"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rani-50 text-rani-500 group-hover:bg-white">
                <Icon aria-hidden="true" strokeWidth={1.75} className="h-5 w-5" />
              </span>
              {t(loan.navKey)}
            </NavLink>
          </li>
        );
      })}
      <li data-stagger style={{ ['--i' as string]: loans.length }} className="border-t border-rani-100 px-3 pt-1">
        <Button href={loansHubHref} variant="link" arrow className="min-h-tap">
          {label('allLoans')}
        </Button>
      </li>
    </ul>
  );

  const mobileNav = (
    <nav aria-label={t('common.a11y.mainNavigation')} className="flex flex-1 flex-col gap-6 px-6 pb-10">
      <ul data-stagger style={{ ['--i' as string]: 0 }}>
        {BEFORE_LOANS.map((l) => (
          <li key={l.href}>
            <NavLink href={l.href} exact={'exact' in l} exclude={'exclude' in l ? l.exclude : undefined} className={sheetLink}>
              {label(l.key)}
            </NavLink>
            {l.key === 'aboutUs' && (
              <ul className="border-l-2 border-marigold-400 pl-4">
                {ABOUT_SUB.map((s) => (
                  <li key={s.href}>
                    <NavLink href={s.href} className="flex min-h-tap items-center font-medium text-ink aria-[current=page]:text-rani-600">
                      {label(s.key)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <div data-stagger style={{ ['--i' as string]: 1 }}>
        <p className="eyebrow mb-1">{label('loanProductsMenu')}</p>
        <ul>
          {loans.map((loan) => (
            <li key={loan.id}>
              <NavLink href={loan.href} exact className="flex min-h-tap items-center font-medium text-ink aria-[current=page]:text-rani-600">
                {t(loan.navKey)}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink href={loansHubHref} exact className="flex min-h-tap items-center font-semibold text-rani-600">
              {label('allLoans')}
            </NavLink>
          </li>
        </ul>
      </div>
      <ul data-stagger style={{ ['--i' as string]: 2 }}>
        {[...AFTER_LOANS, { href: '/careers/', key: 'careers' }].map((l) => (
          <li key={l.href}>
            <NavLink href={l.href} className={sheetLink}>
              {label(l.key)}
            </NavLink>
          </li>
        ))}
      </ul>
      <div data-stagger style={{ ['--i' as string]: 3 }} className="mt-auto grid gap-4">
        <Button href={membershipRoutes.register} size="lg" arrow>
          {t('common.buttons.register')}
        </Button>
        <ContactLinks t={t} newTab={newTab} className="grid gap-2 text-small text-ink-muted" />
      </div>
    </nav>
  );

  return (
    <HeaderShell>
      {/* Top bar (lg+): magenta, white text, marigold icons. Slides away with the scrolled state. */}
      <div className="hidden h-[var(--utility-h)] bg-rani-500 text-small text-white lg:block">
        <ContactLinks t={t} newTab={newTab} className="container-header flex h-full items-center justify-between gap-6" topBar />
      </div>

      <div data-bar className="header-bar relative">
        <div data-bar-inner className="container-header flex h-[var(--bar-h)] items-center justify-between gap-3">
          {/* Never shrinks: a squeezed lockup let its text run under the nav (Windows scrollbars). */}
          <Link id="site-logo" href="/" prefetch={false} className="shrink-0 rounded-lg">
            <BrandLockup
              line1={t('common.brand.nameLine1')}
              line2={t('common.brand.nameLine2')}
              tagline={[t('common.brand.tagline.financialInclusion'), t('common.brand.tagline.womenEmpowerment'), t('common.brand.tagline.communityGrowth')]}
              // Measured (docs/screenshots/cr-01/header-*): the full nav fits beside the lockup
              // from 1280px (xl) only without the tagline; with it, from 1400px.
              taglineClassName="hidden lg:flex xl:hidden min-[1400px]:flex"
              logoAlt={t('common.alt.logo')}
              priority
            />
          </Link>

          <nav aria-label={t('common.a11y.mainNavigation')} className="hidden xl:block">
            <ul className="flex items-center gap-0.5">
              {BEFORE_LOANS.map((l) => (
                <li key={l.href}>
                  <NavLink href={l.href} exact={'exact' in l} exclude={'exclude' in l ? l.exclude : undefined} className={pill}>
                    {label(l.key)}
                  </NavLink>
                </li>
              ))}
              <MegaMenu id="loans" label={label('loanProductsMenu')} activePrefix={loansHubHref}>
                {loansPanel}
              </MegaMenu>
              {AFTER_LOANS.map((l) => (
                <li key={l.href}>
                  <NavLink href={l.href} className={pill}>
                    {label(l.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {languageSwitch}
            <MobileMenu className="xl:hidden" openLabel={t('common.a11y.openMenu')} closeLabel={t('common.a11y.closeMenu')} dialogLabel={t('common.a11y.siteMenu')}>
              {mobileNav}
            </MobileMenu>
          </div>
        </div>
      </div>
    </HeaderShell>
  );
}

/**
 * Email, phone and address (opens Maps), plus WhatsApp when it exists. The top bar puts
 * them left / centre / right (CR-01); the mobile sheet stacks them.
 */
function ContactLinks({ t, newTab, className, topBar = false }: { t: T; newTab: string; className?: string; topBar?: boolean }) {
  const item = 'inline-flex items-center gap-2 underline-offset-4 hover:underline';
  const icon = topBar ? 'h-4 w-4 shrink-0 text-marigold-400' : 'h-4 w-4 shrink-0';
  return (
    <ul className={className}>
      <li>
        <a href={`mailto:${site.email}`} className={item}>
          <Mail aria-hidden="true" strokeWidth={1.75} className={icon} />
          {site.email}
        </a>
      </li>
      {site.phone && (
        <li>
          <a href={site.phone.href} className={item}>
            <Phone aria-hidden="true" strokeWidth={1.75} className={icon} />
            {site.phone.display}
          </a>
        </li>
      )}
      {site.whatsapp && (
        <li>
          <a href={site.whatsapp.href} target="_blank" rel="noopener noreferrer" className={item}>
            <MessageCircle aria-hidden="true" strokeWidth={1.75} className={icon} />
            {t('common.social.whatsapp')}
            <span className="sr-only">{newTab}</span>
          </a>
        </li>
      )}
      <li className="min-w-0">
        <a href={site.map.shortUrl} target="_blank" rel="noopener noreferrer" className={`${item} max-w-full`}>
          <MapPin aria-hidden="true" strokeWidth={1.75} className={icon} />
          <span className={topBar ? 'truncate' : undefined}>{t(site.address.textKey)}</span>
          <span className="sr-only">{newTab}</span>
        </a>
      </li>
    </ul>
  );
}
