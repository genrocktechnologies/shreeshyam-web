import { ChevronRight } from '@/components/ui/icons';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

export interface Crumb {
  label: string;
  /** Omit for the current page (the last crumb). */
  href?: string;
}

/** Home › … › Current page. The last item has aria-current="page" and is not a link. */
export async function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const t = await getTranslations('common');
  const all: Crumb[] = [{ label: t('nav.home'), href: '/' }, ...items];

  return (
    <nav aria-label={t('a11y.breadcrumb')} className={className}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-small text-ink-muted">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="inline-flex items-center gap-1">
              {last || !c.href ? (
                <span aria-current={last ? 'page' : undefined} className={cn(last && 'font-bold text-plum-900')}>
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="link-draw inline-flex min-h-tap items-center hover:text-rani-700">
                  {c.label}
                </Link>
              )}
              {!last && <ChevronRight aria-hidden="true" strokeWidth={1.75} className="h-4 w-4 shrink-0 text-rani-300" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
