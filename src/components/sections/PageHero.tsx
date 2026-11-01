import type { ReactNode } from 'react';
import { GoldenThread, Reveal } from '@/components/motion';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { frameOf, type PhotoKey } from '@/data/images';
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
 * rises (CSS, transform only, so it can be the LCP element), an arch image opens, and the
 * golden thread starts. Its top padding
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
          {/* The h1 is usually the LCP element: painted at full opacity on the first frame and
              risen with a CSS transform, never hidden while it waits for JS + SplitText. */}
          <h1 className="animate-hero-title text-balance">{title}</h1>
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
            // Possibly the LCP element: painted on the first frame (no clip mask), settle only.
            motion={frameOf(image.key) === 'arch' ? 'hero' : 'none'}
            sizes="(min-width: 768px) 22rem, 90vw"
            className="mx-auto w-full max-w-[22rem]"
          />
        )}
      </div>
    </section>
  );
}
