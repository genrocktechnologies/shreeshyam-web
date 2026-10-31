import { getTranslations } from 'next-intl/server';
import { GoldenThread, ImageReveal, Parallax, ReadingHighlight, Reveal, SplitHeading } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Picture } from '@/components/ui/Picture';
import { altKeyFor } from '@/data/images';
import { richTags } from '@/lib/rich';

/**
 * Home §3 (site-plan): eyebrow + heading from the old hero's slide 2, the "About the
 * Foundation" paragraphs and a "More about us" link (this also replaces the old hero
 * button that wrongly pointed at Contact).
 * Motion (motion-spec, Home §4): desktop reading highlight (words go from faint to full
 * as the section scrolls), arch photo parallax, and the thread stem (story step 2)
 * descending through the section. Mobile: simple reveals.
 */
export async function AboutIntro() {
  const t = await getTranslations();

  return (
    <section className="relative bg-ivory">
      <div className="container-site thread-gutter section-pad relative grid items-center gap-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <GoldenThread d="M50 0 C 50 22, 22 38, 28 55 S 50 80, 50 100" className="thread-col-wide inset-y-0 h-full" />

        <ImageReveal className="mx-auto aspect-[4/5] w-full max-w-[22rem] shadow-soft md:max-w-[26rem]">
          <Parallax className="h-full">
            <Picture
              image="aboutArch"
              alt={t(altKeyFor('aboutArch'))}
              sizes="(min-width: 768px) 26rem, 22rem"
              className="block h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
          </Parallax>
        </ImageReveal>

        <div>
          <Reveal>
            <Eyebrow>{t('home.aboutIntro.eyebrow')}</Eyebrow>
          </Reveal>
          <SplitHeading className="mt-4 text-balance">{t('home.aboutIntro.title')}</SplitHeading>
          <Reveal>
            <p className="accent-script mt-8 text-rani-600">{t('about.foundation.heading')}</p>
          </Reveal>
          <ReadingHighlight className="mt-3 grid gap-5 text-body text-ink">
            <p>{t.rich('about.foundation.body1', richTags)}</p>
            <p>{t('about.foundation.body2')}</p>
          </ReadingHighlight>
          <Reveal className="mt-8">
            <Button href="/about/" variant="ghost" arrow>
              {t('common.buttons.moreAboutUs')}
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
