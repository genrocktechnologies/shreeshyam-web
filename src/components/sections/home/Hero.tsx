import { getTranslations } from 'next-intl/server';
import { GoldenThread, MagneticButton, ScrollDrift, ThreadSeed } from '@/components/motion';
import { accentTags } from '@/components/ui/Accent';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { altKeyFor } from '@/data/images';
import { trigger } from '@/lib/motion';
import { HeroTitle } from './HeroTitle';

/**
 * Home §1 (site-plan): eyebrow, h1, Register + Explore Loans, arch photo.
 *
 * Load sequence (motion-spec, Home §2), all timings in lib/motion.ts `hero`:
 * - The LCP candidates (h1 on phones, arch photo on desktop) are fully painted on the
 *   first frame and animate transform only: the h1 rises, the photo settles from 1.15×.
 *   Both run as CSS from first paint, so nothing above the fold waits for JS.
 * - The eyebrow fades up, the CTAs scale in, then the Kalam accent underline draws.
 * - The golden-thread seed pops in under the CTAs; the stem below it draws as the
 *   hero scrolls away and runs straight into the stats band.
 * On scroll (desktop): the photo parallaxes inside its arch and the text drifts up.
 * Mobile: the photo (capped at 34svh) sits above the text, so the headline and the
 * Register button fit above the fold at 390×844; no parallax or drift.
 */
export async function Hero() {
  const t = await getTranslations();

  return (
    <section id="hero" className="relative overflow-hidden bg-ivory">
      <div className="container-site thread-gutter grid gap-5 pt-[calc(var(--header-total)+0.75rem)] md:grid-cols-12 md:gap-10 lg:pt-[calc(var(--header-total)+2.5rem)]">
        {/* Text column (7/12): keeps the headline to 4 lines at 1280–1440px. */}
        <div className="flex flex-col md:col-span-7 md:justify-center">
          <ScrollDrift className="md:pt-4">
            <div className="animate-hero-eyebrow">
              <Eyebrow>{t('home.hero.eyebrow')}</Eyebrow>
            </div>
            <HeroTitle className="mt-3 text-balance md:mt-4">{t.rich('home.hero.title', accentTags)}</HeroTitle>
            <div className="mt-6 flex animate-hero-ctas flex-wrap items-center gap-3 md:mt-9 md:gap-4">
              <MagneticButton>
                <Button href="/register/" size="lg" arrow>
                  {t('common.buttons.register')}
                </Button>
              </MagneticButton>
              <Button href="/loans/" size="lg" variant="ghost">
                {t('common.buttons.exploreLoans')}
              </Button>
            </div>
          </ScrollDrift>

          {/* Thread story, step 1: the seed under the CTAs and the stem down to the hero's
              bottom edge, where the stats band's segment continues it. */}
          <div className="relative mt-6 h-16 md:mt-8 md:h-24">
            <ThreadSeed className="thread-col thread-in-content top-0" />
            <GoldenThread
              d="M50 0 V100"
              start={trigger.heroThreadStart}
              end={trigger.heroThreadEnd}
              trigger="#hero"
              // An absolutely positioned <svg> doesn't stretch between top/bottom (it
              // keeps its intrinsic ratio), so the height is explicit: block minus top-3.
              className="thread-col thread-in-content top-3 h-[calc(100%-0.75rem)]"
            />
          </div>
        </div>

        {/* Arch photo (5/12): above the text on mobile, height-capped at 34svh there. */}
        <div className="order-first md:order-none md:col-span-5 md:self-center md:pb-10">
          <PhotoFrame
            image="heroArch"
            alt={t(altKeyFor('heroArch'))}
            priority
            motion="hero"
            sizes="(min-width: 1024px) 26rem, (min-width: 768px) 40vw, 28svh"
            className="mx-auto w-full max-w-[calc(34svh*0.8)] shadow-lift md:max-w-[26rem]"
          />
        </div>
      </div>
    </section>
  );
}
