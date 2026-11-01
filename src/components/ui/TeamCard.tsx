import { getTranslations } from 'next-intl/server';
import { altKeyFor } from '@/data/images';
import type { TeamMember } from '@/data/team';
import { cn } from '@/lib/cn';
import { PhotoFrame } from './PhotoFrame';
import { SocialIcon } from './SocialIcon';

interface TeamCardProps {
  member: TeamMember;
  /** Chairman and MD/CEO on the Team page: larger type (the card width comes from the grid). */
  featured?: boolean;
  /** LinkedIn icon (Team page). Placeholders open the network's home page (site.ts rule). */
  showSocials?: boolean;
  sizes: string;
  className?: string;
}

/**
 * TeamCard (design-system): arch portrait, name, role. On hover-capable devices the photo
 * starts in grayscale (a backdrop-filter overlay faded out on hover) and a marigold line
 * draws under the name. Touch devices always see colour. Use it inside a `group` element.
 */
export async function TeamCard({ member, featured = false, showSocials = false, sizes, className }: TeamCardProps) {
  const t = await getTranslations();
  const name = t(member.nameKey);

  return (
    <div className={cn('flex flex-col items-center text-center', className)}>
      <div className="relative w-full">
        <PhotoFrame image={member.photo} alt={t(altKeyFor(member.photo), { name })} motion="none" sizes={sizes} className="w-full shadow-soft" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-arch opacity-0 backdrop-grayscale transition-opacity duration-portrait ease-growth [@media(hover:hover)]:opacity-100 [@media(hover:hover)]:group-hover:opacity-0"
        />
      </div>
      <h3 className={cn('mt-5 font-display font-semibold leading-snug text-ink', featured ? 'text-h3 md:text-[1.75rem]' : 'text-[1.1875rem] md:text-h3')}>
        <span className="relative after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-marigold-400 after:transition-transform after:duration-link after:ease-growth group-hover:after:scale-x-100">
          {name}
        </span>
      </h3>
      <p className={cn('mt-2 text-ink-muted', featured ? 'text-body' : 'text-small')}>{t(member.roleKey)}</p>
      {showSocials && member.socials.length > 0 && (
        <ul className="mt-2 flex justify-center">
          {member.socials.map((s) => (
            <li key={s.network}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('common.a11y.memberSocial', { name, network: t(`common.social.${s.network}`) })}
                className="grid h-12 w-12 place-items-center rounded-full text-rani-700 transition-transform duration-press ease-growth hover:-translate-y-0.5"
              >
                <SocialIcon network={s.network} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
