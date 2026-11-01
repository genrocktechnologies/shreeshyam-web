import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { HeartFlourish, Lotus } from '@/components/ui/Decor';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { altKeyFor } from '@/data/images';
import { loansHubHref } from '@/data/loans';
import { membershipRoutes } from '@/data/membership';

/**
 * Home §1 (CR-01): blush hero. Left: the script line and h1 (one heading), the intro, the
 * yellow "Join Us" CTA (→ Membership) and an "Explore Loans" text link. Right: the real
 * hero photo in the curved panel. Side slogan with a heart flourish from xl only.
 * All hero copy is CR-01 proposed copy (client-requests); the revert is home.hero.*.
 *
 * Load sequence (motion-spec, Home §1): the h1 is painted on the first frame and rises
 * with CSS (it is the LCP on phones); the photo is painted at once (LCP on desktop) and
 * only its marigold band draws in; the CTAs scale in. Nothing above the fold waits for JS.
 */
export async function Hero() {
  const t = await getTranslations();

  return (
    <section id="hero" className="relative overflow-hidden bg-blush">
      <Lotus className="absolute -left-8 top-[calc(var(--header-total)+0.5rem)] hidden h-28 w-40 text-rani-400 opacity-[0.14] md:block" />
      {/* Wider than the page container from xl, like the reference: the text column takes the
          two-line headline, the photo grows towards the right edge. */}
      <div className="container-site relative grid items-center gap-7 pb-24 pt-[calc(var(--header-total)+1.25rem)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-8 md:pb-28 lg:pt-[calc(var(--header-total)+1.75rem)] xl:max-w-[1360px] xl:grid-cols-[minmax(0,33rem)_minmax(0,1fr)_7rem] xl:gap-8">
        <div>
          <h1 className="animate-hero-title xl:text-[2.875rem]">
            <span className="mb-1 block font-script text-accent font-bold text-rani-600">{t('home.compact.heroScript')}</span>
            {t('home.compact.heroTitle')}
          </h1>
          <p className="mt-4 text-body text-ink md:mt-5">{t('home.compact.heroIntro')}</p>
          <div className="mt-6 flex animate-hero-ctas flex-wrap items-center gap-x-6 gap-y-3 md:mt-7">
            <Button href={membershipRoutes.membership} size="lg" arrow>
              {t('common.buttons.joinUs')}
            </Button>
            <Button href={loansHubHref} variant="link" arrow className="min-h-tap">
              {t('common.buttons.exploreLoans')}
            </Button>
          </div>
        </div>

        <PhotoFrame
          image="heroPanel"
          alt={t(altKeyFor('heroPanel'))}
          priority
          motion="hero"
          sizes="(min-width: 1280px) 40rem, (min-width: 768px) 50vw, 92vw"
          className="w-full"
        />

        <p className="hidden -rotate-6 text-center font-script text-[1.75rem] font-bold leading-tight text-rani-600 xl:block">
          {t('home.compact.heroSlogan')}
          <HeartFlourish className="mx-auto mt-1 h-6 w-20 text-rani-500" />
        </p>
      </div>
    </section>
  );
}
