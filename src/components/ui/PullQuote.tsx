import { Reveal } from '@/components/motion';
import { cn } from '@/lib/cn';

/**
 * Pull-quote for a page's key statement (Mission, Vision): large display type beside a
 * marigold rule, with a Kalam quote mark. The text is the crawled statement, unchanged.
 */
export function PullQuote({ children, className }: { children: string; className?: string }) {
  return (
    <Reveal as="figure" className={cn('relative border-l-[3px] border-marigold-400 pl-6 md:pl-10', className)}>
      <span aria-hidden="true" className="absolute -top-6 left-4 font-script text-[4.5rem] font-bold leading-none text-rani-500 md:left-8">
        &ldquo;
      </span>
      <blockquote>
        <p className="font-display text-[1.5rem] font-semibold leading-snug text-plum-900 md:text-[2rem]">{children}</p>
      </blockquote>
    </Reveal>
  );
}
