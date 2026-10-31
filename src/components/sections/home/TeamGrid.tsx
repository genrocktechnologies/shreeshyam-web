import { getTranslations } from 'next-intl/server';
import { GoldenThread, Reveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { altKeyFor } from '@/data/images';
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
          {team.map((m) => {
            const name = t(m.nameKey);
            return (
              <li key={m.id} className="group w-[calc(50%-0.5rem)] md:w-[calc((100%-4rem)/3)] lg:w-[calc((100%-6rem)/4)]">
                <div className="relative">
                  <PhotoFrame
                    image={m.photo}
                    alt={t(altKeyFor(m.photo), { name })}
                    motion="none"
                    sizes="(min-width: 1024px) 17rem, (min-width: 768px) 30vw, 45vw"
                    className="w-full shadow-soft"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-arch opacity-0 backdrop-grayscale transition-opacity duration-portrait ease-growth [@media(hover:hover)]:opacity-100 [@media(hover:hover)]:group-hover:opacity-0"
                  />
                </div>
                <h3 className="mt-5 text-center font-display text-[1.1875rem] font-semibold leading-snug text-ink md:text-h3">
                  <span className="relative after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-marigold-400 after:transition-transform after:duration-link after:ease-growth group-hover:after:scale-x-100">
                    {name}
                  </span>
                </h3>
                <p className="mt-2 text-center text-small text-ink-muted">{t(m.roleKey)}</p>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
