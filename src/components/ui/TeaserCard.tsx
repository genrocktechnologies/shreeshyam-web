import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { ArrowRight } from './icons';

interface TeaserCardProps {
  title: string;
  text: string;
  href: string;
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

/**
 * A linked summary of another page (About's Mission/Vision teasers, the sibling link at
 * the end of Mission and Vision). The whole card is the link target; "Learn more" carries
 * the page name for screen readers.
 */
export async function TeaserCard({ title, text, href, headingLevel: H = 'h2', className }: TeaserCardProps) {
  const t = await getTranslations();
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-2xl bg-white p-5 shadow-soft transition-[transform,box-shadow] duration-card ease-growth focus-within:shadow-lift hover:-translate-y-1 hover:shadow-lift md:p-7',
        className,
      )}
    >
      <span aria-hidden="true" className="absolute inset-x-7 top-0 h-[3px] origin-left scale-x-0 rounded-full bg-marigold-400 transition-transform duration-link ease-growth group-focus-within:scale-x-100 group-hover:scale-x-100" />
      <H className="font-display text-h3 font-bold text-rani-600">{title}</H>
      <p className="mt-3 text-body text-ink-muted">{text}</p>
      <Link href={href} prefetch={false} className="mt-auto inline-flex min-h-tap items-center gap-2 pt-4 font-bold text-rani-600 after:absolute after:inset-0 after:rounded-2xl">
        {t('common.buttons.learnMore')}{' '}
        <span className="sr-only">{title}</span>
        <ArrowRight className="h-[1.1em] w-[1.1em] transition-transform duration-press ease-growth group-hover:translate-x-1" />
      </Link>
    </article>
  );
}
