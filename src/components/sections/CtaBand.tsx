import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Leaf } from '@/components/ui/Decor';
import { membershipRoutes } from '@/data/membership';

interface CtaBandProps {
  /** Defaults to the crawled hero eyebrow "Building Better Futures Together" (site-plan, Home §11). */
  heading?: string;
  /** Defaults to Register (→ the Membership form) and Contact Us. */
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  id?: string;
}

/**
 * Slim closing call-to-action band for inner pages (CR-01: ≤ 220px on desktop; no longer
 * on home): magenta, the heading beside two buttons, a faint leaf. A plain reveal only.
 */
export async function CtaBand({ heading, primary, secondary, id }: CtaBandProps) {
  const t = await getTranslations();
  const p = primary ?? { label: t('common.buttons.register'), href: membershipRoutes.register };
  const s = secondary ?? { label: t('common.buttons.contactUs'), href: '/contact/' };

  return (
    <section id={id} className="relative overflow-hidden bg-rani-500 text-white">
      <Leaf className="absolute -right-2 -top-3 h-28 w-24 rotate-12 text-white opacity-10" />
      <Reveal className="container-site relative flex flex-col gap-5 py-10 md:flex-row md:items-center md:justify-between md:gap-10 md:py-12">
        <h2 className="max-w-2xl text-balance text-white">{heading ?? t('home.hero.eyebrow')}</h2>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Button href={p.href} size="lg" arrow>
            {p.label}
          </Button>
          <Button href={s.href} size="lg" variant="onDark">
            {s.label}
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
