import missionMessages from '../../messages/en/mission.json';
import type { IllustrationKey, PhotoKey } from './images';

/** About-cluster routes (locale-less). */
export const aboutRoutes = {
  about: '/about/',
  mission: '/about/mission/',
  vision: '/about/vision/',
  team: '/about/team/',
  milestones: '/about/milestones/',
  gallery: '/about/gallery/',
} as const;

export interface KeyedItem {
  id: string;
  titleKey: string;
  textKey: string;
}

/** About: "Why Choose…" items, in crawled order. */
export const whyChoose: KeyedItem[] = [
  'trustedFinancial',
  'womenEmpowerment',
  'customerCentric',
  'financialLiteracy',
  'sustainableGrowth',
  'transparentOperations',
].map((id) => ({ id, titleKey: `about.whyChoose.items.${id}.title`, textKey: `about.whyChoose.items.${id}.text` }));

/** About page images: the hero crop and the crawled "About the Foundation" picture (a cut-out). */
export const aboutImages = { hero: 'aboutHeroArch', foundation: 'membersCircle' } as const satisfies { hero: PhotoKey; foundation: IllustrationKey };

/** Vision page: the crawled vision picture (a cut-out, so an illustration slot). */
export const visionImage: IllustrationKey = 'visionGroup';

/** Mission: the goal and core-value keys, in crawled order. */
export const missionGoalKeys = Object.keys(missionMessages.goals.items).map((k) => `mission.goals.items.${k}`);
export const missionValueKeys = Object.keys(missionMessages.coreValues.items).map((k) => `mission.coreValues.items.${k}`);

/**
 * Core values are crawled as "Integrity – Honest, transparent, and ethical operations."
 * The page shows the term and its description separately; the text itself is unchanged.
 */
export function splitValue(text: string): { term: string; description: string } {
  const [term, ...rest] = text.split(' – ');
  return rest.length ? { term, description: rest.join(' – ') } : { term: '', description: text };
}
