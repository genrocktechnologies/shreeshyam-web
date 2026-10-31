import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowRight } from '@/components/ui/icons';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/**
 * Button styles from design-system.md. Only transform animates (hover lift, press,
 * arrow slide); colour changes are instant (CLAUDE.md motion rules).
 */
export const buttonVariants = cva(
  'group inline-flex select-none items-center justify-center gap-2 rounded-full font-body font-bold leading-none transition-transform duration-press ease-growth hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-marigold-400 text-plum-900 shadow-soft hover:bg-marigold-300',
        secondary: 'bg-rani-600 text-white hover:bg-rani-700',
        ghost: 'border-[1.5px] border-rani-600 text-rani-700 hover:bg-rani-50',
        onDark: 'border-[1.5px] border-ivory/80 text-ivory hover:bg-ivory/10',
        link: 'rounded-none px-0 text-rani-700 underline-offset-4 hover:translate-y-0 hover:underline',
      },
      size: {
        md: 'min-h-[48px] px-6 text-[1rem]',
        lg: 'min-h-[56px] px-8 text-[1.0625rem]',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'min-h-0 px-0' }],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

interface CommonProps extends Variants {
  children: ReactNode;
  /** Trailing arrow that slides 4px on hover. */
  arrow?: boolean;
  className?: string;
}

type LinkButtonProps = CommonProps & {
  href: string;
  /**
   * Internal links only. Off by default: most visitors are on metered, patchy 4G, so we
   * don't spend their data on pages they may never open.
   */
  prefetch?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>;
type NativeButtonProps = CommonProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//');

/**
 * `href` starting with "/" → locale-aware next-intl Link; any other href (tel:, mailto:,
 * https:) → plain <a>; no href → <button>.
 */
export function Button(props: LinkButtonProps | NativeButtonProps) {
  const { variant, size, arrow, className, children, ...rest } = props;
  const classes = cn(buttonVariants({ variant, size }), className);
  const content = (
    <>
      {children}
      {arrow && (
        <ArrowRight
          aria-hidden="true"
          strokeWidth={2}
          className="h-[1.1em] w-[1.1em] shrink-0 transition-transform duration-press ease-growth group-hover:translate-x-1"
        />
      )}
    </>
  );

  if (rest.href !== undefined) {
    const { href, prefetch = false, ...anchor } = rest as LinkButtonProps;
    return isInternal(href) ? (
      <Link href={href} prefetch={prefetch} className={classes} {...anchor}>
        {content}
      </Link>
    ) : (
      <a href={href} className={classes} {...anchor}>
        {content}
      </a>
    );
  }
  const { type = 'button', ...button } = rest as NativeButtonProps;
  return (
    <button type={type} className={classes} {...button}>
      {content}
    </button>
  );
}
