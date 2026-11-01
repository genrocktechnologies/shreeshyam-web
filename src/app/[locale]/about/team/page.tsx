import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GoldenThread, Reveal } from '@/components/motion';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { TeamCard } from '@/components/ui/TeamCard';
import { aboutRoutes } from '@/data/about';
import { team, type TeamMember } from '@/data/team';
import { cn } from '@/lib/cn';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return { title: t('common.nav.team'), description: t('team.heading') };
}

/** Desktop column start that centres a short trailing row of regular (4-column) cards. */
const CENTRE_START: Record<number, string> = { 1: 'md:col-start-5', 2: 'md:col-start-3' };

/**
 * Grid placement that keeps the crawled order and makes the featured members larger.
 * 12 columns from md: regular cards span 4, featured span 6, so a run of featured cards
 * forms its own row; a trailing row of 1–2 regular cards is centred. Phones: 2 columns,
 * featured full width, and an odd regular card before a featured run is centred alone.
 */
function placement(members: TeamMember[]): string[] {
  return members.map((m, i) => {
    if (m.featured) return 'col-span-2 md:col-span-6';
    // Length of the run of regular cards this one belongs to, and its position in it.
    let start = i;
    while (start > 0 && !members[start - 1].featured) start--;
    let end = i;
    while (end < members.length - 1 && !members[end + 1].featured) end++;
    const run = end - start + 1;
    const pos = i - start;
    const lastRow = Math.floor(pos / 3) === Math.floor((run - 1) / 3);
    const inLastRow = run % 3 || 3;
    return cn(
      'md:col-span-4',
      lastRow && pos % 3 === 0 && inLastRow < 3 && CENTRE_START[inLastRow],
      // Phones: an odd card left at the end of a run takes the full row, centred.
      run % 2 === 1 && pos === run - 1 && 'col-span-2',
    );
  });
}

/**
 * Our Team (site-plan): the 7 members in crawled order, with the client-confirmed name
 * spellings; Chairman and MD/CEO featured larger. LinkedIn icons are placeholders
 * (site.ts rule 6).
 */
export default async function TeamPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const classes = placement(team);

  return (
    <>
      <PageHero title={t('common.nav.team')} breadcrumbs={[{ label: t('about.title'), href: aboutRoutes.about }, { label: t('common.nav.team') }]} />

      <section className="relative bg-ivory">
        <div className="container-site thread-gutter section-pad relative">
          <GoldenThread className="thread-col inset-y-0 h-full" />
          <Reveal stagger="tight" as="ul" className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-12 md:gap-x-8 md:gap-y-16">
            {team.map((m, i) => (
              <li key={m.id} className={cn('group', classes[i])}>
                <TeamCard
                  member={m}
                  featured={m.featured}
                  showSocials
                  sizes={m.featured ? '(min-width: 768px) 22rem, 80vw' : '(min-width: 768px) 16rem, 45vw'}
                  className={cn('mx-auto', m.featured ? 'max-w-[22rem]' : 'max-w-[16rem]')}
                />
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
