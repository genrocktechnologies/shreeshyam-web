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
export const namespaces = ['common', 'dev'] as const;
