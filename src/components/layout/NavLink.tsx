'use client';

import type { ComponentProps } from 'react';
import { Link, usePathname } from '@/i18n/navigation';

type NavLinkProps = ComponentProps<typeof Link> & {
  href: string;
  exact?: boolean;
  /** A sub-path that has its own nav item, so it doesn't also mark this one (About vs Vision & Mission). */
  exclude?: string;
};

/**
 * Locale-aware link that sets aria-current="page" on the current route (or a parent with
 * `exact={false}`). Navigation chrome repeats on every page, so prefetch is off by
 * default: prefetching ~16 routes per visit wastes data on patchy rural 4G.
 */
export function NavLink({ href, exact = false, exclude, prefetch = false, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const norm = (p: string) => (p.endsWith('/') ? p : `${p}/`);
  const active =
    (exact || href === '/' ? norm(pathname) === norm(href) : norm(pathname).startsWith(norm(href))) &&
    !(exclude && norm(pathname).startsWith(norm(exclude)));
  return <Link href={href} prefetch={prefetch} aria-current={active ? 'page' : undefined} {...props} />;
}
