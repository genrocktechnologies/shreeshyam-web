import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { TreeConnectors } from '@/components/motion';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { TeamCard } from '@/components/ui/TeamCard';
import { aboutRoutes } from '@/data/about';
import { teamTiers } from '@/data/team';

export { generateStaticParams } from '@/i18n/static-params';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return { title: t('common.nav.team'), description: t('team.heading') };
}

/**
 * Our Team (CR-01, section 5): a tiered leadership tree, grouped by the published titles.
 * The markup IS the text version of the chart: nested lists, each tier a list item with
 * its heading, its members, and the next tier nested inside (University of Missouri
 * org-chart guidance). Members keep the crawled order within a tier.
 * - Desktop (md+): centred top-down rows; TreeConnectors draws tier-to-tier lines.
 * - Phones: a vertical tree; a marigold spine runs down the left and each card branches
 *   off it (CSS). No horizontal scroll, zoom or pan.
 */
export default async function TeamPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  // Build the nesting from the bottom tier up.
  const tree = teamTiers.reduceRight<ReactNode>(
    (inner, tier) => (
      <ul className={tier.tier === 1 ? undefined : 'mt-6 md:mt-16'}>
        <li className="relative">
          <h2 className="mb-3 flex items-center gap-2 font-body text-small font-semibold text-rani-600 md:mb-4 lg:absolute lg:left-0 lg:top-0 lg:mb-0">
            {/* Phones: the tier's node on the spine. */}
            <span aria-hidden="true" className="-ml-[1.375rem] h-3 w-3 rounded-full bg-marigold-400 ring-4 ring-ivory md:hidden" />
            <span className="rounded-full bg-rani-50 px-3 py-1">{t(tier.labelKey)}</span>
          </h2>
          <ul data-tier-cards="" className="grid gap-3 md:flex md:flex-wrap md:justify-center md:gap-6">
            {tier.members.map((m) => (
              <li
                key={m.id}
                className="relative before:absolute before:-left-4 before:top-1/2 before:h-[3px] before:w-4 before:-translate-y-1/2 before:bg-marigold-400 md:before:hidden"
              >
                <TeamCard member={m} />
              </li>
            ))}
          </ul>
          {inner}
        </li>
      </ul>
    ),
    null,
  );

  return (
    <>
      <PageHero title={t('common.nav.team')} breadcrumbs={[{ label: t('about.title'), href: aboutRoutes.about }, { label: t('common.nav.team') }]} />

      <section className="relative bg-ivory">
        <div className="container-site section-pad">
          <div className="relative pl-7 md:pl-0">
            {/* Phones: the spine of the vertical tree. */}
            <span aria-hidden="true" className="absolute bottom-6 left-2.5 top-2 w-[3px] rounded-full bg-marigold-400 md:hidden" />
            <TreeConnectors />
            {tree}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
