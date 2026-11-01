import type { getTranslations } from 'next-intl/server';
import type { PolicySection } from '@/data/policies';
import { richTags } from '@/lib/rich';
import type { LongFormSection } from './LongForm';

type T = Awaited<ReturnType<typeof getTranslations>>;

/** Policy sections → LongForm sections: paragraphs and bulleted lists in crawled order. */
export function policySections(sections: PolicySection[], t: T): LongFormSection[] {
  return sections.map((s) => ({
    id: s.id,
    heading: t(s.headingKey),
    body: s.blocks.map((b, i) =>
      b.kind === 'p' ? (
        <p key={i}>{t.rich(b.key, richTags)}</p>
      ) : (
        <ul key={i}>
          {b.keys.map((k) => (
            <li key={k}>{t.rich(k, richTags)}</li>
          ))}
        </ul>
      ),
    ),
  }));
}
