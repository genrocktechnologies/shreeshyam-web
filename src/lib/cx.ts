/**
 * Class joiner for client components: clsx only, no tailwind-merge.
 *
 * `cn()` (lib/cn.ts) adds tailwind-merge, which is ~17 KB gzip. In a server component
 * that costs nothing, but one `cn` import in a client component ships it to every page.
 * Client components therefore use `cx` and must not pass conflicting utilities.
 */
export { clsx as cx } from 'clsx';
