import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { BookOpen, Briefcase, HeartHandshake, Landmark, Sprout, Users, type IconComponent } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { services, servicesHeadingKey } from '@/data/services';

const ICONS: Record<string, IconComponent> = {
  financialInclusion: Landmark,
  womenEmpowerment: Users,
  financialLiteracy: BookOpen,
  entrepreneurshipDevelopment: Briefcase,
  livelihoodPromotion: Sprout,
  communityWelfare: HeartHandshake,
};

/**
 * "What we do" (CR-01: moved from home to About): the six services in crawled order, a
 * compact 3 × 2 grid with the icon beside the text. Cards fade in with a stagger; hover
 * lifts (CSS).
 */
export async function Services() {
  const t = await getTranslations();

  return (
    <section id="services" className="relative bg-ivory">
      <div className="container-site section-pad">
        <SectionHeading title={t(servicesHeadingKey)} />
        <Reveal stagger as="ul" className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {services.map((s) => (
            <li key={s.id}>
              <FeatureCard icon={ICONS[s.id]} title={t(s.titleKey)} text={t(s.textKey)} inlineIcon />
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
