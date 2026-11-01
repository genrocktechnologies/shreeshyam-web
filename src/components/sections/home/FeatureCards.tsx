import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion';
import { ArrowRight, HandCoins, Sprout, UserRound, type IconComponent } from '@/components/ui/icons';
import { aboutRoutes } from '@/data/about';
import { loans, loansHubHref } from '@/data/loans';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/**
 * CR-01 cards: proposed titles, descriptions verbatim from the live site's services, and
 * the tint of the icon disc and arrow (pink, yellow, pink).
 */
const CARDS: { id: string; titleKey: string; textKey: string; href: string; icon: IconComponent; tint: 'pink' | 'yellow' }[] = [
  {
    id: 'womenEmpowerment',
    titleKey: 'home.compact.cards.womenEmpowerment',
    textKey: 'home.services.items.womenEmpowerment.text',
    href: loans.find((l) => l.id === 'womenEmpowerment')!.href,
    icon: UserRound,
    tint: 'pink',
  },
  {
    id: 'financialInclusion',
    titleKey: 'home.compact.cards.financialInclusion',
    textKey: 'home.services.items.financialInclusion.text',
    href: loansHubHref,
    icon: HandCoins,
    tint: 'yellow',
  },
  {
    id: 'communityGrowth',
    titleKey: 'home.compact.cards.communityGrowth',
    textKey: 'home.services.items.communityWelfare.text',
    href: aboutRoutes.about,
    icon: Sprout,
    tint: 'pink',
  },
];

/**
 * Home §2 (CR-01): three feature cards overlapping the hero's bottom edge. Each card is
 * one link (the title's link stretches over it); the round arrow is decorative. Reveal
 * fades them in with a stagger; hover lifts (CSS). Phones: compact rows, icon beside text.
 */
export async function FeatureCards() {
  const t = await getTranslations();

  return (
    <section className="relative z-10 bg-rani-50 pb-8 md:pb-12">
      <div className="container-site">
        {/* Pulled up over the hero's bottom edge (the hero leaves room for it). */}
        <Reveal stagger as="ul" className="relative -mt-16 grid gap-3 md:-mt-20 md:grid-cols-3 md:gap-6">
          {CARDS.map((c) => {
            const Icon = c.icon;
            const yellow = c.tint === 'yellow';
            return (
              <li key={c.id}>
                <article className="group relative flex h-full items-start gap-4 rounded-2xl bg-white p-4 shadow-soft transition-[transform,box-shadow] duration-card ease-growth hover:-translate-y-1 hover:shadow-lift md:flex-col md:items-center md:gap-0 md:px-6 md:py-7 md:text-center">
                  <span aria-hidden="true" className={cn('grid h-14 w-14 shrink-0 place-items-center rounded-full md:h-20 md:w-20', yellow ? 'bg-marigold-300' : 'bg-rani-100')}>
                    <Icon className={cn('h-7 w-7 transition-transform duration-card ease-growth group-hover:rotate-icon md:h-9 md:w-9', yellow ? 'text-cocoa' : 'text-rani-500')} />
                  </span>
                  <div className="md:mt-4">
                    <h2 className="text-h3">
                      <Link href={c.href} prefetch={false} className="after:absolute after:inset-0 after:rounded-2xl">
                        {t(c.titleKey)}
                      </Link>
                    </h2>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink md:mx-auto md:mt-2 md:max-w-[17rem]">{t(c.textKey)}</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-5 hidden h-9 w-9 place-items-center rounded-full transition-transform duration-press ease-growth group-hover:translate-x-1 md:grid',
                      yellow ? 'bg-marigold-400 text-plum-900' : 'bg-rani-500 text-white',
                    )}
                  >
                    <ArrowRight strokeWidth={2.25} className="h-4 w-4" />
                  </span>
                </article>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
