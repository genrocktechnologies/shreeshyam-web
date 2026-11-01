import { getTranslations } from 'next-intl/server';
import { GoldenThread, MagneticButton, Reveal, SplitHeading, ThreadBloom } from '@/components/motion';
import { Button } from '@/components/ui/Button';

interface CtaBandProps {
  /** Defaults to the crawled hero eyebrow "Building Better Futures Together" (site-plan, Home §11). */
  heading?: string;
  /** Defaults to Register (primary, magnetic) and Contact Us. */
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  id?: string;
}

/**
 * Closing call-to-action band, the end of every page's golden thread (motion-spec story,
 * step 6): the thread arrives from the section above and blooms into a marigold flower
 * beside the heading, then the heading's lines rise. The primary CTA is magnetic on fine
 * pointers. Phones: a smaller bloom.
 */
export async function CtaBand({ heading, primary, secondary, id }: CtaBandProps) {
  const t = await getTranslations();
  const p = primary ?? { label: t('common.buttons.register'), href: '/register/' };
  const s = secondary ?? { label: t('common.buttons.contactUs'), href: '/contact/' };

  return (
    <section id={id} className="grain relative overflow-hidden bg-rani-600 text-white">
      <div className="container-site thread-gutter relative pb-20 pt-24 md:pb-28 md:pt-40">
        {/* Stem from the section top down to the bloom's centre. */}
        <GoldenThread className="thread-col top-0 h-[4.5rem] md:h-[6.5rem]" />
        <ThreadBloom className="absolute left-[var(--thread-x)] top-[4.5rem] h-12 w-12 -translate-x-1/2 -translate-y-1/2 md:top-[6.5rem] md:h-16 md:w-16" />

        <SplitHeading className="max-w-3xl text-balance font-display text-display text-white">{heading ?? t('home.hero.eyebrow')}</SplitHeading>
        <Reveal className="mt-10 flex flex-wrap items-center gap-3 md:gap-4">
          <MagneticButton>
            <Button href={p.href} size="lg" arrow>
              {p.label}
            </Button>
          </MagneticButton>
          <Button href={s.href} size="lg" variant="onDark">
            {s.label}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
