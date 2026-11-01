import { cn } from '@/lib/cn';
import type { IconComponent } from './icons';

/**
 * Duotone icon (design-system, Iconography): the lucide stroke in rani-600 over a
 * marigold-200 blob, inside a rani-50 circle. Inside a `group`, the icon turns
 * `rotate.icon` degrees on hover.
 */
export function IconBadge({ icon: Icon, className }: { icon: IconComponent; className?: string }) {
  return (
    <span aria-hidden="true" className={cn('relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-rani-50', className)}>
      <span className="absolute left-2.5 top-3 h-7 w-7 rounded-[45%_55%_60%_40%] bg-marigold-200" />
      <Icon className="relative h-6 w-6 text-rani-500 transition-transform duration-card ease-growth group-hover:rotate-icon" />
    </span>
  );
}
