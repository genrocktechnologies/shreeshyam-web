import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { namespaces, routing } from './routing';

type Messages = Record<string, unknown>;

const isObject = (v: unknown): v is Messages => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Deep-merges `over` onto `base`; keys missing from `over` keep the base value. */
function merge(base: Messages, over: Messages): Messages {
  const out: Messages = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = isObject(v) && isObject(base[k]) ? merge(base[k] as Messages, v) : v;
  return out;
}

async function load(locale: string, ns: string): Promise<Messages | null> {
  try {
    return (await import(`../../messages/${locale}/${ns}.json`)).default as Messages;
  } catch {
    return null;
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // English is complete by definition. Other locales fall back to English key by key
  // until their drafts exist (Phase 7 checks the en/hi key trees match).
  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      const en = (await load(routing.defaultLocale, ns)) ?? {};
      const localized = locale === routing.defaultLocale ? null : await load(locale, ns);
      return [ns, localized ? merge(en, localized) : en] as const;
    }),
  );

  return { locale, messages: Object.fromEntries(entries) };
});
