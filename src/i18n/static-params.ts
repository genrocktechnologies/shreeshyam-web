import { routing } from './routing';

/**
 * Static params for every route under app/[locale]. With `output: 'export'`, the Next 14
 * dev server requires each page to export generateStaticParams itself; the layout's
 * export is not enough. Every page.tsx under [locale] must re-export this:
 *
 *   export { generateStaticParams } from '@/i18n/static-params';
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
