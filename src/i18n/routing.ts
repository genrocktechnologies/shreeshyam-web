import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'hi'],
  defaultLocale: 'en',
  // Static export has no middleware, so every URL carries its locale.
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

/**
 * Message files loaded for every page (messages/<locale>/<namespace>.json).
 * Add a namespace here when its files are added for both locales.
 */
export const namespaces = [
  'common',
  'home',
  'about',
  'team',
  'mission',
  'vision',
  'milestones',
  'loans',
  'howToJoin',
  'register',
  'careers',
  'contact',
  'hrPolicy',
  'privacy',
  'dev',
] as const;

export type Namespace = (typeof namespaces)[number];

/**
 * Namespaces sent to the browser by the root NextIntlClientProvider. Everything else
 * stays on the server. Client components needing more wrap themselves in a nested
 * provider with just the keys they use.
 */
export const clientNamespaces = ['common'] as const satisfies readonly Namespace[];
