import type { ReactNode } from 'react';
import { GoldenThread } from '@/components/motion';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { frameOf, type PhotoKey } from '@/data/images';
import { cn } from '@/lib/cn';

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
 * Compact inner-page hero (CR-01: ≤ 420px on desktop below the header, ≤ 60vh on phones;
 * motion-spec, Inner pages): the breadcrumb fades in, the h1
 * rises (CSS, transform only, so it can be the LCP element), an arch image opens, and the
 * golden thread starts. Its top padding
 * clears the fixed header.
 */
export function PageHero({ title, eyebrow, breadcrumbs, intro, image, className }: PageHeroProps) {
  return (
    <section className={cn('relative overflow-hidden bg-blush', className)}>
      <div
        className={cn(
          'container-site thread-gutter relative grid items-center gap-6 pb-8 pt-[calc(var(--header-total)+1.25rem)] md:gap-10 md:pb-10 lg:pt-[calc(var(--header-total)+1.75rem)]',
          // Phones: a small photo beside the text, so the hero stays within 60vh.
          image && 'grid-cols-[minmax(0,1fr)_5.5rem] items-start md:grid-cols-[1.25fr_1fr] md:items-center',
        )}
      >
        {/* Inside the container so it sits on the shared thread rail (--thread-x). */}
        {/* Explicit height: an absolute <svg> doesn't stretch between top and bottom. */}
        <GoldenThread d="M50 0 C 50 30, 30 55, 50 100" className="thread-col top-[var(--header-total)] h-[calc(100%-var(--header-total))]" />
        <div>
          {/* Everything above the fold animates with CSS from first paint, never behind a JS
              Reveal: on a slow phone hydration takes seconds, and the intro is often the LCP. */}
          <div className="animate-hero-eyebrow">
            <Breadcrumbs items={breadcrumbs} className="mb-3" />
          </div>
          {eyebrow && <p className="eyebrow mb-2 animate-hero-eyebrow">{eyebrow}</p>}
          {/* The h1 is usually the LCP element: painted at full opacity on the first frame and
              risen with a CSS transform, never hidden while it waits for JS + SplitText. */}
          <h1 className="animate-hero-title text-balance">{title}</h1>
          {intro && <div className="mt-4 animate-hero-title text-body text-ink-muted">{intro}</div>}
        </div>
        {image && (
          <PhotoFrame
            image={image.key}
            alt={image.alt}
            priority
            // Possibly the LCP element: painted on the first frame (no clip mask), settle only.
            motion={frameOf(image.key) === 'arch' ? 'hero' : 'none'}
            sizes="(min-width: 768px) 15rem, 5.5rem"
            className="w-full md:mx-auto md:max-w-[15rem]"
          />
        )}
      </div>
    </section>
  );
}
