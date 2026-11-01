import { getTranslations } from 'next-intl/server';
import { GoldenThread, Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TeamCard } from '@/components/ui/TeamCard';
import { team, teamHeadingKey } from '@/data/team';

/**
 * Home §9 (site-plan): "Our team Members" (as crawled), 7 people in crawled order, and
 * "Meet the team". Arch portraits.
 * Motion (motion-spec, Home §10): the grid Reveals with stagger. On hover-capable devices
 * the portraits start in grayscale (a backdrop-filter overlay) and turn to colour on hover
 * by fading that overlay out, while a marigold underline draws under the name. Touch
 * devices always see colour. Phones: 2 columns.
 */
export async function TeamGrid() {
  const t = await getTranslations();

  return (
    <section id="team" className="relative bg-ivory-100">
      <div className="container-site thread-gutter section-pad relative">
        <GoldenThread className="thread-col inset-y-0 h-full" />
        <SectionHeading
          title={t(teamHeadingKey)}
          action={
            <Button href="/team/" variant="ghost" arrow>
              {t('common.buttons.meetTheTeam')}
            </Button>
          }
        />
        <Reveal stagger="tight" as="ul" className="mt-12 flex flex-wrap justify-center gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-14">
          {team.map((m) => (
            <li key={m.id} className="group w-[calc(50%-0.5rem)] md:w-[calc((100%-4rem)/3)] lg:w-[calc((100%-6rem)/4)]">
              <TeamCard member={m} sizes="(min-width: 1024px) 17rem, (min-width: 768px) 30vw, 45vw" />
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
