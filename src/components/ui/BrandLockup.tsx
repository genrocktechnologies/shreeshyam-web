/* eslint-disable @next/next/no-img-element -- brand file from public/brand, not a processed content image */
import { site } from '@/data/site';
import { cn } from '@/lib/cn';
import { latinLang } from '@/lib/lang';
import { Logo } from './Logo';

interface BrandLockupProps {
  /** Translated: common.brand.nameLine1 / nameLine2 / tagline items, common.alt.logo. */
  line1: string;
  line2: string;
  tagline?: string[];
  /** Visibility of the tagline row, e.g. 'hidden xl:flex' (default: always shown). */
  taglineClassName?: string;
  logoAlt: string;
  /** `light`: header (magenta + cocoa on the cream bar). `onDark`: footer (white). */
  tone?: 'light' | 'onDark';
  priority?: boolean;
  className?: string;
}

/**
 * CR-01 logo lockup (design-system, Logo lockup): the client's real emblem, whole and
 * uncoloured, then the typeset name ("SHREE SHYAM" in Merriweather over "SMALL GROWTH
 * FOUNDATION") and, when given, the tagline with marigold bullets. The typeset name IS the
 * link's accessible name ("Shree Shyam Small Growth Foundation"; WCAG 2.5.3 label in name),
 * so the emblem's alt is empty and only the tagline is aria-hidden.
 * `site.logoLockup = 'image'` switches back to the client's full logo file.
 */
export function BrandLockup({ line1, line2, tagline, taglineClassName = 'flex', logoAlt, tone = 'light', priority = false, className }: BrandLockupProps) {
  if (site.logoLockup === 'image') {
    return <Logo variant={tone === 'onDark' ? 'white' : 'full'} alt={logoAlt} priority={priority} className={cn('h-12 lg:h-16', className)} />;
  }
  const dark = tone === 'onDark';

  return (
    <span className={cn('flex items-center gap-2 lg:gap-3', className)}>
      <img
        src="/brand/logo-mark-160.webp"
        alt=""
        width={160}
        height={186}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="h-[var(--lockup-mark,3rem)] w-auto shrink-0"
      />
      <span className="flex min-w-0 flex-col">
        <span
          lang={latinLang(line1)}
          className={cn(
            'whitespace-nowrap font-display font-black uppercase leading-[1.05] tracking-[0.01em] [font-size:var(--lockup-line1,1rem)]',
            dark ? 'text-white' : 'text-rani-500',
          )}
        >
          {line1}
        </span>{' '}
        <span
          lang={latinLang(line2)}
          className={cn(
            'whitespace-nowrap font-display font-bold uppercase leading-[1.15] [font-size:var(--lockup-line2,0.625rem)]',
            dark ? 'text-white' : 'text-cocoa',
          )}
        >
          {line2}
        </span>
        {tagline && (
          <span aria-hidden="true" className={cn('mt-1 items-center gap-1.5 whitespace-nowrap text-[0.75rem] leading-tight', taglineClassName, dark ? 'text-white' : 'text-ink')}>
            {tagline.map((item, i) => (
              <span key={item} className="flex items-center gap-1.5">
                {i > 0 && <span className="h-1.5 w-1.5 rounded-full bg-marigold-400" />}
                {item}
              </span>
            ))}
          </span>
        )}
      </span>
    </span>
  );
}
