import { cn } from '@/lib/cn';
import { IconBadge } from './IconBadge';
import type { IconComponent } from './icons';

interface FeatureCardProps {
  icon: IconComponent;
  title: string;
  text: string;
  /** Icon beside the text (compact cards), instead of above it. */
  inlineIcon?: boolean;
  className?: string;
}

/**
 * ServiceCard (design-system), also used for About's "Why Choose" items: a duotone icon,
 * a title and a short text. Hover lifts the card and turns the icon (CSS only).
 */
export function FeatureCard({ icon, title, text, inlineIcon = false, className }: FeatureCardProps) {
  return (
    <article
      className={cn(
        'group flex h-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-soft transition-[transform,box-shadow] duration-card ease-growth hover:-translate-y-1 hover:shadow-lift md:p-6',
        inlineIcon && 'flex-row items-start',
        className,
      )}
    >
      <IconBadge icon={icon} />
      <div>
        <h3 className="font-display text-h3 font-bold text-rani-600">{title}</h3>
        <p className="mt-2 max-w-prose text-[0.9375rem] leading-relaxed text-ink-muted">{text}</p>
      </div>
    </article>
  );
}
