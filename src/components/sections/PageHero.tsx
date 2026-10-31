import type { ReactNode } from 'react';
import { GoldenThread, ImageReveal, Reveal, SplitHeading } from '@/components/motion';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';
import { Picture } from '@/components/ui/Picture';
import type { ImageKey } from '@/data/images';
import { cn } from '@/lib/cn';

interface PageHeroProps {
  /** The page's single <h1>. */
  title: string;
  eyebrow?: string;
  /** Crumbs after "Home"; the last one is the current page. */
  breadcrumbs: Crumb[];
  intro?: ReactNode;
  image?: { key: ImageKey; alt: string };
  className?: string;
}

/**
 * Compact inner-page hero (motion-spec, Inner pages): the breadcrumb fades in, the h1
 * rises line by line, an arch image opens, and the golden thread starts. Its top padding
 * clears the fixed header.
 */
export function PageHero({ title, eyebrow, breadcrumbs, intro, image, className }: PageHeroProps) {
  return (
    <section className={cn('relative overflow-hidden bg-rani-50', className)}>
      <GoldenThread
        d="M50 0 C 50 30, 30 55, 50 100"
        className="absolute bottom-0 left-[20px] top-[var(--header-total)] w-6 md:left-[8%] md:w-10"
      />
      <div
        className={cn(
          'container-site grid items-center gap-10 pb-14 pl-12 pt-[calc(var(--header-total)+2rem)] md:pb-20 md:pl-8 lg:pt-[calc(var(--header-total)+3rem)]',
          image && 'md:grid-cols-[1.25fr_1fr]',
        )}
      >
        <div>
          <Reveal>
            <Breadcrumbs items={breadcrumbs} className="mb-6" />
          </Reveal>
          {eyebrow && (
            <Reveal delay={0.05}>
              <p className="eyebrow mb-3">{eyebrow}</p>
            </Reveal>
          )}
          <SplitHeading as="h1" trigger="load" delay={0.1} className="text-balance">
            {title}
          </SplitHeading>
          {intro && (
            <Reveal delay={0.2} className="mt-6 text-body text-ink-muted">
              {intro}
            </Reveal>
          )}
        </div>
        {image && (
          <ImageReveal trigger="load" delay={0.2} className="mx-auto aspect-[4/5] w-full max-w-[22rem]">
            <Picture
              image={image.key}
              alt={image.alt}
              priority
              sizes="(min-width: 768px) 22rem, 90vw"
              className="block h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
          </ImageReveal>
        )}
      </div>
    </section>
  );
}
