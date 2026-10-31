import { getTranslations } from 'next-intl/server';
import { GoldenThread, Reveal, Shine } from '@/components/motion';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { altKeyFor } from '@/data/images';
import { team } from '@/data/team';
import { trigger } from '@/lib/motion';
import { richTags } from '@/lib/rich';

/** The award story is in the MD, CEO & Founder's own words (content rule 9). */
const author = team.find((m) => m.id === 'sauravPrakash')!;

/**
 * Home §7 (site-plan): the plum milestone band. Award photo (wide frame: an arch would
 * slice the presenter), both paragraphs, attributed to Saurav Prakash, MD, CEO, Founder.
 * Thread story, step 5: the thread comes down the rail and wraps around the photo frame
 * (scrubbed), then a single shine sweeps across the photo (desktop). Text Reveals.
 */
export async function Milestone() {
  const t = await getTranslations();

  return (
    <section id="milestone" className="grain relative bg-plum-900 text-ivory-100">
      <div className="container-site thread-gutter section-pad relative grid items-center gap-12 md:grid-cols-2 lg:gap-20">
        <GoldenThread wrap="[data-award-frame]" start={trigger.wrapStart} end={trigger.wrapEnd} className="absolute inset-0 h-full w-full" />

        <div data-award-frame="" className="relative overflow-hidden rounded-2xl">
          <PhotoFrame image="award" alt={t(altKeyFor('award'))} sizes="(min-width: 768px) 36rem, 90vw" className="w-full" />
          <Shine />
        </div>

        <div>
          <SectionHeading eyebrow={t('common.nav.milestones')} title={t('milestones.award.heading')} onDark />
          <Reveal className="mt-6 grid gap-5 text-body text-ivory-100/90">
            <p>{t.rich('milestones.award.body1', richTags)}</p>
            <p>{t('milestones.award.body2')}</p>
          </Reveal>
          <Reveal className="mt-8 border-l-2 border-marigold-400 pl-5">
            <p className="accent-script text-marigold-300">{t(author.nameKey)}</p>
            <p className="text-small text-ivory-100/80">{t(author.roleKey)}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
