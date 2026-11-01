import { getTranslations } from 'next-intl/server';
import { Reveal, Shine } from '@/components/motion';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { altKeyFor } from '@/data/images';
import { team } from '@/data/team';
import { richTags } from '@/lib/rich';

/** The award story is in the MD, CEO & Founder's own words (content rule 9). */
const author = team.find((m) => m.id === 'sauravPrakash')!;

/**
 * Milestone band (on About; CR-01 removed it from home): the award photo (wide frame: an
 * arch would slice the presenter), both paragraphs, attributed to Saurav Prakash, MD, CEO
 * & Founder. Light pink band (plum is text-only in CR-01). One shine sweeps across the
 * photo on desktop; the text Reveals.
 */
export async function Milestone() {
  const t = await getTranslations();

  return (
    <section id="milestone" className="relative bg-rani-50">
      <div className="container-site section-pad relative grid items-center gap-8 md:grid-cols-2 lg:gap-14">

        <div className="relative overflow-hidden rounded-2xl shadow-soft">
          <PhotoFrame image="award" alt={t(altKeyFor('award'))} sizes="(min-width: 768px) 36rem, 90vw" className="w-full" />
          <Shine />
        </div>

        <div>
          <SectionHeading eyebrow={t('common.nav.milestones')} title={t('milestones.award.heading')} />
          <Reveal className="mt-5 grid gap-4 text-body text-ink">
            <p>{t.rich('milestones.award.body1', richTags)}</p>
            <p>{t('milestones.award.body2')}</p>
          </Reveal>
          <Reveal className="mt-6 border-l-2 border-marigold-400 pl-5">
            <p className="font-script text-[1.75rem] font-bold leading-tight text-rani-600">{t(author.nameKey)}</p>
            <p className="text-small text-ink-muted">{t(author.roleKey)}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
