import { getTranslations } from 'next-intl/server';
import { GoldenThread, Reveal } from '@/components/motion';
import { IconBadge } from '@/components/ui/IconBadge';
import { BookOpen, Briefcase, HeartHandshake, Landmark, Sprout, Users, type IconComponent } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { services, servicesHeadingKey } from '@/data/services';
import { scale } from '@/lib/motion';

const ICONS: Record<string, IconComponent> = {
  financialInclusion: Landmark,
  womenEmpowerment: Users,
  financialLiteracy: BookOpen,
  entrepreneurshipDevelopment: Briefcase,
  livelihoodPromotion: Sprout,
  communityWelfare: HeartHandshake,
};

/** Bento rhythm on the 6-column desktop grid: wide·narrow / narrow·wide / half·half. */
const SPANS = ['lg:col-span-4', 'lg:col-span-2', 'lg:col-span-2', 'lg:col-span-4', 'lg:col-span-3', 'lg:col-span-3'];

/**
 * Home §4 (site-plan): the six services, in crawled order.
 * Motion (motion-spec, Home §5): cards Reveal with stagger from scale.revealCard; hover
 * lifts the card and turns its icon (CSS). The thread runs straight through.
 * Mobile: one column.
 */
export async function Services() {
  const t = await getTranslations();

  return (
    <section id="services" className="relative bg-ivory-100">
      <div className="container-site thread-gutter section-pad relative">
        <GoldenThread className="thread-col inset-y-0 h-full" />
        <SectionHeading title={t(servicesHeadingKey)} />
        <Reveal stagger fromScale={scale.revealCard} as="ul" className="mt-12 grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-6">
          {services.map((s, i) => (
            <li key={s.id} className={SPANS[i]}>
              <article className="group flex h-full flex-col gap-6 rounded-2xl border border-rani-100 bg-ivory p-7 shadow-soft transition-[transform,box-shadow] duration-card ease-growth hover:-translate-y-1 hover:shadow-lift md:p-8 lg:flex-row lg:items-start">
                <IconBadge icon={ICONS[s.id]} />
                <div>
                  <h3 className="font-display text-h3 font-semibold text-ink">{t(s.titleKey)}</h3>
                  <p className="mt-3 max-w-prose text-body text-ink-muted">{t(s.textKey)}</p>
                </div>
              </article>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
