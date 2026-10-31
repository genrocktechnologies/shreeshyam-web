'use client';

import type { ComponentProps } from 'react';
import { Link, usePathname } from '@/i18n/navigation';

type NavLinkProps = ComponentProps<typeof Link> & { href: string; exact?: boolean };

/** Locale-aware link that sets aria-current="page" on the current route (or a parent with `exact={false}`). */
export function NavLink({ href, exact = false, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const norm = (p: string) => (p.endsWith('/') ? p : `${p}/`);
  const active = exact || href === '/' ? norm(pathname) === norm(href) : norm(pathname).startsWith(norm(href));
  return <Link href={href} aria-current={active ? 'page' : undefined} {...props} />;
}
