import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion';
import { Award } from '@/components/ui/icons';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { aboutRoutes } from '@/data/about';
import { altKeyFor, type PhotoKey } from '@/data/images';
import { Link } from '@/i18n/navigation';
import { latinLang } from '@/lib/lang';

/** The foundation's awards, newest first (client photos, 19 Nov 2026). */
const AWARDS: { id: string; image: PhotoKey; category: boolean; story?: string }[] = [
  { id: 'dazzling', image: 'awardDazzling2026', category: true },
  // The Iconic Business Award is the one the Milestones page tells in the founder's words.
  { id: 'iconic', image: 'awardIconic2026', category: false, story: aboutRoutes.milestones },
];

/**
 * Home: Awards & Recognition, between the feature cards and About (client request,
 * 19 Nov 2026). Two compact cards: the real award photo (wide frame), the award's name,
 * its category, and a short description (proposed copy, client-requests). The Iconic card
 * links to the Milestones story. Reveal fades the cards in; the photos open on scroll.
 */
export async function Awards() {
  const t = await getTranslations();

  return (
    <section id="awards" aria-labelledby="awards-heading" className="relative bg-rani-50 pb-10 pt-4 md:pb-12 md:pt-6">
      <div className="container-site">
        <h2 id="awards-heading">{t('home.awards.heading')}</h2>
        <Reveal stagger as="ul" className="mt-5 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {AWARDS.map((a) => {
            const title = t(`home.awards.items.${a.id}.title`);
            return (
              <li key={a.id}>
                <article className="group flex h-full flex-col gap-4 rounded-2xl bg-white p-3 shadow-soft transition-[transform,box-shadow] duration-card ease-growth hover:-translate-y-1 hover:shadow-lift sm:flex-row sm:items-center sm:gap-5">
                  <PhotoFrame
                    image={a.image}
                    alt={t(altKeyFor(a.image))}
                    sizes="(min-width: 1024px) 15rem, (min-width: 640px) 40vw, 92vw"
                    className="w-full shrink-0 sm:w-[44%] lg:w-[15rem]"
                  />
                  <div className="px-2 pb-2 sm:px-0 sm:pb-0 sm:pr-3">
                    <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-marigold-300 text-cocoa">
                      <Award strokeWidth={1.75} className="h-5 w-5" />
                    </span>
                    <h3 lang={latinLang(title)} className="mt-3 font-display text-[1.1875rem] font-bold leading-snug text-rani-600">
                      {title}
                    </h3>
                    {a.category && <p className="mt-1 text-small font-semibold text-cocoa">{t(`home.awards.items.${a.id}.category`)}</p>}
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">{t(`home.awards.items.${a.id}.text`)}</p>
                    {a.story && (
                      <Link href={a.story} prefetch={false} className="mt-2 inline-flex min-h-tap items-center font-semibold text-rani-600 underline-offset-4 hover:underline">
                        {t('common.buttons.learnMore')}
                        <span className="sr-only"> {title}</span>
                      </Link>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
