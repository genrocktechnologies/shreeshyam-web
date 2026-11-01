import type { PhotoKey } from './images';
import type { SocialLink } from './site';

export interface TeamMember {
  id: string;
  nameKey: string;
  roleKey: string;
  photo: PhotoKey;
  /** Shown larger on the Team page (site-plan: Chairman and MD/CEO). */
  featured: boolean;
  /** LinkedIn, a placeholder at the client's request (rendered per the site.ts social-link rules). */
  socials: SocialLink[];
}

// Team LinkedIn: a placeholder for now (client-requests: "Team LinkedIn | Placeholders for
// now | Same rule as social links"). It opens LinkedIn's home page in a new tab, and the
// Phase 8 launch check fails while any placeholder remains. The old cards' X and Instagram
// icons also only pointed at the networks' home pages; they are not carried over.
const placeholderSocials = (): SocialLink[] => [{ network: 'linkedin', url: 'https://www.linkedin.com/', placeholder: true }];

const member = (id: string, photo: PhotoKey, featured = false): TeamMember => ({
  id,
  nameKey: `team.members.${id}.name`,
  roleKey: `team.members.${id}.role`,
  photo,
  featured,
  socials: placeholderSocials(),
});

/** In the crawled order (content rule 9: names and roles exactly as crawled). */
export const team: TeamMember[] = [
  member('satyamPushkar', 'teamSatyamPushkar'),
  member('ranjeetKumar', 'teamRanjeetKumar'),
  member('sumitKumar', 'teamSumitKumar'),
  member('sauravPrakash', 'teamSauravPrakash', true),
  member('vikramSinha', 'teamVikramSinha', true),
  member('sonuKumar', 'teamSonuKumar'),
  member('shishirKumar', 'teamShishirKumar'),
];

export const teamHeadingKey = 'team.heading';
