import { getTranslations } from 'next-intl/server';
import { GoldenThread, MagneticButton, Reveal, SplitHeading, ThreadBloom } from '@/components/motion';
import { Button } from '@/components/ui/Button';

/**
 * Home §11 (site-plan, new): the rani CTA band. The heading reuses existing copy
 * ("Building Better Futures Together"); Register and Contact Us.
 * Thread story, step 6: the thread arrives from the FAQ and blooms into a marigold
 * flower beside the heading; then the heading's lines rise. The Register CTA is magnetic
 * (fine pointers). Phones: a smaller bloom.
 */
export async function FinalCta() {
  const t = await getTranslations();

  return (
    <section id="final-cta" className="grain relative overflow-hidden bg-rani-600 text-white">
      <div className="container-site thread-gutter relative pb-20 pt-24 md:pb-28 md:pt-40">
        {/* Stem from the section top down to the bloom's centre. */}
        <GoldenThread className="thread-col top-0 h-[4.5rem] md:h-[6.5rem]" />
        <ThreadBloom className="absolute left-[var(--thread-x)] top-[4.5rem] h-12 w-12 -translate-x-1/2 -translate-y-1/2 md:top-[6.5rem] md:h-16 md:w-16" />

        <SplitHeading className="max-w-3xl text-balance font-display text-display text-white">{t('home.hero.eyebrow')}</SplitHeading>
        <Reveal className="mt-10 flex flex-wrap items-center gap-3 md:gap-4">
          <MagneticButton>
            <Button href="/register/" size="lg" arrow>
              {t('common.buttons.register')}
            </Button>
          </MagneticButton>
          <Button href="/contact/" size="lg" variant="onDark">
            {t('common.buttons.contactUs')}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
