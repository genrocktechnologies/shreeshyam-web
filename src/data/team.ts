import type { PhotoKey } from './images';
import type { SocialLink } from './site';

/** Leadership tiers of the Team tree (CR-01, section 5), grouped by the published titles. */
export type Tier = 1 | 2 | 3 | 4;

export interface TeamMember {
  id: string;
  nameKey: string;
  roleKey: string;
  photo: PhotoKey;
  tier: Tier;
  /**
   * Who this member reports to (another member's id). Unknown for everyone until the
   * client confirms (client-requests, CR-01): the tree then draws connectors tier to tier,
   * never person to person, because drawing reporting lines would invent them. Once set,
   * the tree can switch to exact lines.
   */
  reportsTo?: string;
  /** LinkedIn, a placeholder at the client's request (rendered per the site.ts social-link rules). */
  socials: SocialLink[];
}

// Team LinkedIn: a placeholder for now (client-requests: "Team LinkedIn | Placeholders for
// now | Same rule as social links"). It opens LinkedIn's home page in a new tab, and the
// Phase 8 launch check fails while any placeholder remains. The old cards' X and Instagram
// icons also only pointed at the networks' home pages; they are not carried over.
const placeholderSocials = (): SocialLink[] => [{ network: 'linkedin', url: 'https://www.linkedin.com/', placeholder: true }];

const member = (id: string, photo: PhotoKey, tier: Tier): TeamMember => ({
  id,
  nameKey: `team.members.${id}.name`,
  roleKey: `team.members.${id}.role`,
  photo,
  tier,
  socials: placeholderSocials(),
});

/** In the crawled order (content rule 9: names and roles exactly as crawled). */
export const team: TeamMember[] = [
  member('satyamPushkar', 'teamSatyamPushkar', 4),
  member('ranjeetKumar', 'teamRanjeetKumar', 3),
  member('sumitKumar', 'teamSumitKumar', 3),
  member('sauravPrakash', 'teamSauravPrakash', 2),
  member('vikramSinha', 'teamVikramSinha', 1),
  member('sonuKumar', 'teamSonuKumar', 4),
  member('shishirKumar', 'teamShishirKumar', 4),
];

/** Tier labels (CR-01 proposed copy, client-requests) in tree order; members keep crawled order. */
export const teamTiers: { tier: Tier; labelKey: string; members: TeamMember[] }[] = (
  [
    [1, 'team.tiers.chairman'],
    [2, 'team.tiers.leadership'],
    [3, 'team.tiers.executiveDirectors'],
    [4, 'team.tiers.headsOfficers'],
  ] as const
).map(([tier, labelKey]) => ({ tier, labelKey, members: team.filter((m) => m.tier === tier) }));

/** Chairman and MD/CEO cards are slightly larger. */
export const isFeatured = (m: TeamMember) => m.tier <= 2;

export const teamHeadingKey = 'team.heading';
