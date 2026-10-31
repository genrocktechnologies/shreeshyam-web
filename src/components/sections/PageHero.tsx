import type { ReactNode } from 'react';
import { GoldenThread, Reveal, SplitHeading } from '@/components/motion';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import type { PhotoKey } from '@/data/images';
import { cn } from '@/lib/cn';
import { pageHero } from '@/lib/motion';

interface PageHeroProps {
  /** The page's single <h1>. */
  title: string;
  eyebrow?: string;
  /** Crumbs after "Home"; the last one is the current page. */
  breadcrumbs: Crumb[];
  intro?: ReactNode;
  /** Photos only (cut-outs/illustrations are rejected); the frame shape comes from the image data. */
  image?: { key: PhotoKey; alt: string };
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
      <div
        className={cn(
          'container-site thread-gutter relative grid items-center gap-10 pb-14 pt-[calc(var(--header-total)+2rem)] md:pb-20 lg:pt-[calc(var(--header-total)+3rem)]',
          image && 'md:grid-cols-[1.25fr_1fr]',
        )}
      >
        {/* Inside the container so it sits on the shared thread rail (--thread-x). */}
        {/* Explicit height: an absolute <svg> doesn't stretch between top and bottom. */}
        <GoldenThread d="M50 0 C 50 30, 30 55, 50 100" className="thread-col top-[var(--header-total)] h-[calc(100%-var(--header-total))]" />
        <div>
          <Reveal delay={pageHero.breadcrumb}>
            <Breadcrumbs items={breadcrumbs} className="mb-6" />
          </Reveal>
          {eyebrow && (
            <Reveal delay={pageHero.eyebrow}>
              <p className="eyebrow mb-3">{eyebrow}</p>
            </Reveal>
          )}
          <SplitHeading as="h1" trigger="load" delay={pageHero.title} className="text-balance">
            {title}
          </SplitHeading>
          {intro && (
            <Reveal delay={pageHero.intro} className="mt-6 text-body text-ink-muted">
              {intro}
            </Reveal>
          )}
        </div>
        {image && (
          <PhotoFrame
            image={image.key}
            alt={image.alt}
            priority
            motion="reveal"
            sizes="(min-width: 768px) 22rem, 90vw"
            className="mx-auto w-full max-w-[22rem]"
          />
        )}
      </div>
    </section>
  );
}
