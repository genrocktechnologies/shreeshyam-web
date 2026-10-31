import { getTranslations } from 'next-intl/server';
import { GoldenThread, MagneticButton, Parallax, ScrollDrift, ThreadSeed } from '@/components/motion';
import { accentTags } from '@/components/ui/Accent';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Picture } from '@/components/ui/Picture';
import { altKeyFor } from '@/data/images';
import { trigger } from '@/lib/motion';
import { HeroTitle } from './HeroTitle';

/**
 * Home §1 (site-plan): eyebrow, h1, Register + Explore Loans, arch photo.
 *
 * Load sequence (motion-spec, Home §2), all timings in lib/motion.ts `hero`:
 * - Eyebrow fades up, the CTAs scale in and the arch photo opens via CSS keyframes,
 *   from first paint (no JS needed, so the photo, the LCP element, is never held back).
 * - The h1 lines rise (SplitHeading) once hydrated and fonts are ready, then the
 *   Kalam accent underline draws.
 * - The golden-thread seed pops in under the CTAs; the stem below it draws as the
 *   hero scrolls away.
 * On scroll (desktop): the photo parallaxes inside its arch and the text drifts up.
 * Mobile: the photo sits above the text; no parallax or drift.
 */
export async function Hero() {
  const t = await getTranslations();

  return (
    <section id="hero" className="relative overflow-hidden bg-ivory">
      <div className="container-site thread-gutter grid gap-8 pt-[calc(var(--header-total)+1.25rem)] md:grid-cols-[1.15fr_1fr] md:gap-12 lg:min-h-[100svh] lg:pt-[calc(var(--header-total)+3rem)]">
        {/* Text column: stretches to the section bottom so the thread stem can exit there. */}
        <div className="flex flex-col md:justify-center">
          <ScrollDrift className="md:pt-6">
            <div className="animate-hero-eyebrow">
              <Eyebrow>{t('home.hero.eyebrow')}</Eyebrow>
            </div>
            <HeroTitle className="mt-4 text-balance">{t.rich('home.hero.title', accentTags)}</HeroTitle>
            <div className="mt-9 flex animate-hero-ctas flex-wrap items-center gap-4">
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

          {/* Thread story, step 1: the seed under the CTAs, and the stem to the hero's
              bottom edge (continued by the stats band). */}
          <div className="relative mt-8 min-h-[6rem] flex-1 md:min-h-[8rem]">
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

        {/* Arch photo: above the text on mobile. */}
        <div className="order-first md:order-none md:self-center md:pb-16">
          <div className="mx-auto aspect-[4/5] w-full max-w-[19rem] animate-hero-arch overflow-hidden rounded-arch shadow-lift sm:max-w-[22rem] md:max-w-[28rem]">
            <Parallax className="h-full">
              <div className="h-full animate-hero-settle">
                <Picture
                  image="heroArch"
                  alt={t(altKeyFor('heroArch'))}
                  priority
                  sizes="(min-width: 1024px) 28rem, (min-width: 640px) 22rem, 19rem"
                  className="block h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </div>
            </Parallax>
          </div>
        </div>
      </div>
    </section>
  );
}
