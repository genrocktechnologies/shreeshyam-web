import { getTranslations } from 'next-intl/server';
import { altKeyFor } from '@/data/images';
import { isFeatured, type TeamMember } from '@/data/team';
import { cn } from '@/lib/cn';
import { latinLang } from '@/lib/lang';
import { PhotoFrame } from './PhotoFrame';
import { SocialIcon } from './SocialIcon';

/**
 * Team tree card (CR-01, section 5; design-system, TeamCard): a circular COLOUR portrait
 * (112px desktop, 88px phones; Chairman and MD/CEO slightly larger) in a 3px marigold
 * ring, the name (Merriweather), the role (Poppins) and the LinkedIn placeholder. Hover or
 * focus inside lifts the card and makes the ring glow (CSS). Phones: a compact row.
 * `data-tree-card` is what TreeConnectors measures.
 */
export async function TeamCard({ member, className }: { member: TeamMember; className?: string }) {
  const t = await getTranslations();
  const name = t(member.nameKey);
  const featured = isFeatured(member);

  return (
    <article
      data-tree-card=""
      className={cn(
        'group relative flex items-center gap-4 rounded-2xl bg-white p-3 shadow-soft transition-[transform,box-shadow] duration-card ease-growth focus-within:-translate-y-1 focus-within:shadow-lift hover:-translate-y-1 hover:shadow-lift md:flex-col md:gap-0 md:px-4 md:py-5 md:text-center',
        featured ? 'md:w-[15rem]' : 'md:w-[13rem] lg:w-[14rem]',
        className,
      )}
    >
      <PhotoFrame
        image={member.photo}
        alt={t(altKeyFor(member.photo), { name })}
        shape="circle"
        // The Chairman's card is first in the tree, above the fold (often the LCP on phones).
        priority={member.tier === 1}
        sizes={featured ? '(min-width: 768px) 128px, 96px' : '(min-width: 768px) 112px, 88px'}
        className={cn(
          'shrink-0 ring-[3px] ring-marigold-400 ring-offset-2 transition-shadow duration-card group-focus-within:shadow-lift group-hover:shadow-lift',
          featured ? 'w-24 md:w-32' : 'w-[88px] md:w-28',
        )}
      />
      <div className="min-w-0 flex-1 md:mt-3">
        <h3 lang={latinLang(name)} className={cn('font-display font-bold leading-snug text-rani-600', featured ? 'text-[1.0625rem] md:text-[1.1875rem]' : 'text-[1.0625rem]')}>{name}</h3>
        <p className="mt-0.5 text-small text-ink-muted">{t(member.roleKey)}</p>
      </div>
      {member.socials.length > 0 && (
        <ul className="flex shrink-0 justify-center md:mt-1">
          {member.socials.map((s) => (
            <li key={s.network}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('common.a11y.memberSocial', { name, network: t(`common.social.${s.network}`) })}
                className="grid h-12 w-12 place-items-center rounded-full text-rani-600 transition-transform duration-press ease-growth hover:-translate-y-0.5"
              >
                <SocialIcon network={s.network} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
