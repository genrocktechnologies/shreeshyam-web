import { getTranslations } from 'next-intl/server';
import { CountUp, Reveal } from '@/components/motion';
import { Leaf, Swash } from '@/components/ui/Decor';
import { BookOpen, HeartHandshake, Users, type IconComponent } from '@/components/ui/icons';
import { stats } from '@/data/stats';

const ICONS: Record<string, IconComponent> = { women: Users, literacy: BookOpen, trust: HeartHandshake };

/**
 * Impact band (CR-01, Home §4; also on About): a full-width diagonal split. Left, on
 * magenta: the script slogan (CR-01 proposed copy) with a marigold swash and leaf. Right,
 * on yellow: the three LIVE-SITE stats (D15: 1200+ / 150+ / 98%; never the reference's
 * invented numbers), each with a magenta icon disc, a Merriweather number that counts up,
 * and its label. Phones: the slogan block stacks above the stats.
 */
export async function ImpactBand() {
  const t = await getTranslations();

  return (
    <section id="impact" className="impact-split relative overflow-hidden">
      <div className="container-site grid md:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)] md:items-center">
        <div className="-mx-5 bg-rani-500 px-5 py-8 md:mx-0 md:bg-transparent md:px-0 md:py-10">
          <p className="max-w-[16rem] -rotate-6 font-script text-accent font-bold text-white">
            {t('home.compact.impactSlogan')}
            <Leaf className="ml-2 inline-block h-8 w-7 align-middle text-marigold-400" />
          </p>
          <Swash className="-mt-1 h-5 w-52 -rotate-6 text-marigold-400" />
        </div>

        <Reveal stagger as="ul" className="grid gap-5 py-8 sm:grid-cols-3 sm:gap-0 md:py-8 md:pl-10">
          {stats.map((s) => {
            const Icon = ICONS[s.id];
            return (
              <li key={s.id} className="flex items-center gap-4 sm:flex-col sm:gap-2 sm:border-l sm:border-rani-500/25 sm:px-3 sm:text-center sm:first:border-l-0">
                <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-rani-500 text-white md:h-14 md:w-14">
                  <Icon strokeWidth={1.75} className="h-6 w-6 md:h-7 md:w-7" />
                </span>
                <p className="flex flex-col sm:items-center">
                  <span className="stat-number text-rani-600">
                    <CountUp value={t(s.valueKey)} />
                  </span>
                  <span className="text-small font-semibold text-rani-700">{t(s.labelKey)}</span>
                </p>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
