import type { ReactNode } from 'react';
import { Reveal, SplitHeading } from '@/components/motion';
import { cn } from '@/lib/cn';
import { Eyebrow } from './Eyebrow';

interface SectionHeadingProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  lead?: ReactNode;
  /** A link or button shown beside the heading from md up (below it on phones). */
  action?: ReactNode;
  onDark?: boolean;
  className?: string;
}

/**
 * Eyebrow + h2 (SplitHeading line reveal) + optional lead and action (design-system,
 * SectionHeading). Text is server-rendered; the reveal only runs under html.js-motion.
 */
export function SectionHeading({ title, eyebrow, lead, action, onDark = false, className }: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10', className)}>
      <div className="max-w-3xl">
        {eyebrow && (
          <Reveal className="mb-4">
            <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow>
          </Reveal>
        )}
        <SplitHeading className={cn('text-balance', onDark && 'text-ivory')}>{title}</SplitHeading>
        {lead && (
          <Reveal>
            <p className={cn('mt-5 max-w-prose text-body', onDark ? 'text-ivory-100/90' : 'text-ink-muted')}>{lead}</p>
          </Reveal>
        )}
      </div>
      {action && <Reveal className="shrink-0">{action}</Reveal>}
    </div>
  );
}
