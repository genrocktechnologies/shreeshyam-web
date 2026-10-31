import type { ImageKey } from './images';
import type { SocialLink } from './site';

export interface TeamMember {
  id: string;
  nameKey: string;
  roleKey: string;
  photo: ImageKey;
  /** Shown larger on the Team page (site-plan: Chairman and MD/CEO). */
  featured: boolean;
  /** Placeholders at the client's request; TeamCard renders icons only for real URLs. */
  socials: SocialLink[];
}

// The old team cards all linked to the networks' home pages.
const placeholderSocials = (): SocialLink[] => [
  { network: 'linkedin', url: 'https://www.linkedin.com/', placeholder: true },
  { network: 'twitter', url: 'https://twitter.com/', placeholder: true },
  { network: 'instagram', url: 'https://www.instagram.com/', placeholder: true },
];

const member = (id: string, photo: ImageKey, featured = false): TeamMember => ({
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
