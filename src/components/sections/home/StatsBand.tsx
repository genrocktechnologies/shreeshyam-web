import { getTranslations } from 'next-intl/server';
import { CountUp, DrawLine, GoldenThread, Reveal } from '@/components/motion';
import { stats } from '@/data/stats';

/**
 * Home §2 (site-plan): the plum trust band, with the three published stats.
 * Motion (motion-spec, Home §3): the stats stagger in and count up, and thin marigold
 * dividers draw vertically between them. The golden thread passes straight through.
 * Mobile: stacked, same CountUp.
 */
export async function StatsBand() {
  const t = await getTranslations();

  return (
    <section className="grain relative bg-plum-900 text-ivory-100">
      <div className="container-site thread-gutter relative py-14 md:py-20">
        <GoldenThread d="M50 0 V100" className="thread-col inset-y-0 h-full" />
        <Reveal stagger as="dl" className="grid gap-10 md:grid-cols-3 md:gap-0">
          {stats.map((s, i) => (
            <div key={s.id} className="relative flex flex-col-reverse gap-2 md:px-8 md:first:pl-0">
              {i > 0 && <DrawLine axis="y" index={i} className="absolute inset-y-0 left-0 hidden w-px bg-marigold-400/50 md:block" />}
              <dt className="max-w-[18rem] text-body text-ivory-100">{t(s.labelKey)}</dt>
              <dd className="stat-number text-marigold-400">
                <CountUp value={t(s.valueKey)} />
              </dd>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
