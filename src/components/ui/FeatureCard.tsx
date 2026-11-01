import { cn } from '@/lib/cn';
import { IconBadge } from './IconBadge';
import type { IconComponent } from './icons';

interface FeatureCardProps {
  icon: IconComponent;
  title: string;
  text: string;
  /** Icon beside the text from lg up (wide bento cells), instead of above it. */
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
        'group flex h-full flex-col gap-6 rounded-2xl border border-rani-100 bg-ivory p-7 shadow-soft transition-[transform,box-shadow] duration-card ease-growth hover:-translate-y-1 hover:shadow-lift md:p-8',
        inlineIcon && 'lg:flex-row lg:items-start',
        className,
      )}
    >
      <IconBadge icon={icon} />
      <div>
        <h3 className="font-display text-h3 font-semibold text-ink">{title}</h3>
        <p className="mt-3 max-w-prose text-body text-ink-muted">{text}</p>
      </div>
    </article>
  );
}
