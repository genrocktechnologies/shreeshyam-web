import hrMessages from '../../messages/en/hrPolicy.json';
import privacyMessages from '../../messages/en/privacy.json';

/** One block of a policy section, in crawled order: a paragraph or a bulleted list. */
export type PolicyBlock = { kind: 'p'; key: string } | { kind: 'list'; keys: string[] };

export interface PolicySection {
  id: string;
  headingKey: string;
  blocks: PolicyBlock[];
}

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Policy sections from the message files, keeping the crawled order of every paragraph
 * (`p1`, `p2`…) and list (`list1`… in the HR Policy; each `l1`, `l2`… of the Privacy Policy
 * is one bullet, so consecutive bullets form one list). The page renders the text as is.
 */
function sectionsOf(ns: string, sections: Record<string, Record<string, unknown>>): PolicySection[] {
  return Object.entries(sections).map(([id, s]) => {
    const blocks: PolicyBlock[] = [];
    for (const [k, v] of Object.entries(s)) {
      const key = `${ns}.sections.${id}.${k}`;
      if (k === 'heading') continue;
      if (/^p\d+$/.test(k)) blocks.push({ kind: 'p', key });
      else if (/^list\d+$/.test(k)) blocks.push({ kind: 'list', keys: Object.keys(v as object).map((i) => `${key}.${i}`) });
      else if (/^l\d+$/.test(k)) {
        const last = blocks[blocks.length - 1];
        if (last?.kind === 'list') last.keys.push(key);
        else blocks.push({ kind: 'list', keys: [key] });
      }
    }
    return { id: kebab(id), headingKey: `${ns}.sections.${id}.heading`, blocks };
  });
}

export const hrPolicySections = sectionsOf('hrPolicy', hrMessages.sections);
export const privacySections = sectionsOf('privacy', privacyMessages.sections);

/** HR Policy contact block: the directors in crawled order (incl. Pravin Kumar Singh, as published there). */
export const hrDirectorKeys = Object.keys(hrMessages.contact.directors.names).map((k) => `hrPolicy.contact.directors.names.${k}`);
