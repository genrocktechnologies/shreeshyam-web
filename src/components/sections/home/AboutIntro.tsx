import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Lotus } from '@/components/ui/Decor';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Sprout } from '@/components/ui/icons';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { aboutRoutes } from '@/data/about';
import { altKeyFor } from '@/data/images';
import { richTags } from '@/lib/rich';

/**
 * Home §3 (CR-01): blush About band. Left: the real About photo in the curved panel (its
 * band draws in on scroll) with a small sprout disc as the inset. Right: "About Us", the
 * foundation's name as the h2, the FIRST "About the Foundation" paragraph verbatim (the
 * second is on the About page) and "Know More". Plain reveals; no scroll scrub.
 */
export async function AboutIntro() {
  const t = await getTranslations();

  return (
    <section id="about" className="relative overflow-hidden bg-blush">
      <Lotus className="absolute -bottom-2 right-2 hidden h-24 w-36 text-rani-400 opacity-[0.14] md:block" />
      <div className="container-site section-pad relative grid items-center gap-8 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
        <div className="relative">
          <PhotoFrame image="aboutPanel" alt={t(altKeyFor('aboutPanel'))} motion="reveal" sizes="(min-width: 1280px) 33rem, (min-width: 768px) 46vw, 92vw" className="w-full" />
          <span aria-hidden="true" className="absolute -bottom-3 left-[12%] grid h-14 w-14 place-items-center rounded-full bg-white shadow-soft md:h-16 md:w-16">
            <Sprout strokeWidth={1.75} className="h-7 w-7 text-rani-500 md:h-8 md:w-8" />
          </span>
        </div>

        <Reveal>
          <Eyebrow>{t('common.nav.aboutUs')}</Eyebrow>
          <h2 className="mt-2 text-balance">{t('common.siteName')}</h2>
          <p className="mt-4 text-body text-ink">{t.rich('about.foundation.body1', richTags)}</p>
          <Button href={aboutRoutes.about} arrow className="mt-6">
            {t('common.buttons.knowMore')}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
