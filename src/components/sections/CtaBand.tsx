import { getTranslations } from 'next-intl/server';
import { MagneticButton, Reveal, SplitHeading } from '@/components/motion';
import { Button } from '@/components/ui/Button';

interface CtaBandProps {
  /** Defaults to the crawled hero eyebrow "Building Better Futures Together" (site-plan, Home §11). */
  heading?: string;
  text?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}

/**
 * Closing call-to-action band: rani gradient with grain, a heading, Register (primary,
 * magnetic) and Contact. The marigold bloom is added in Phase 3.
 */
export async function CtaBand({ heading, text, primary, secondary }: CtaBandProps) {
  const t = await getTranslations();
  const p = primary ?? { label: t('common.buttons.register'), href: '/register/' };
  const s = secondary ?? { label: t('common.buttons.contactUs'), href: '/contact/' };

  return (
    <section className="grain relative bg-gradient-to-br from-rani-600 to-rani-800 text-white">
      <div className="container-site section-pad text-center">
        <SplitHeading className="mx-auto max-w-3xl text-balance text-white">{heading ?? t('home.hero.eyebrow')}</SplitHeading>
        {text && (
          <Reveal className="mx-auto mt-5 max-w-prose text-body text-rani-50">
            <p>{text}</p>
          </Reveal>
        )}
        <Reveal stagger className="mt-10 flex flex-wrap items-center justify-center gap-4">
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
