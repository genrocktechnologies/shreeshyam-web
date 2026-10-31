import { MessageCircle } from '@/components/ui/icons';
import type { SocialNetwork } from '@/data/site';
import { cn } from '@/lib/cn';

// lucide-react 1.x ships no brand icons, so these are drawn here: simple 24×24 glyphs.
const PATHS: Partial<Record<SocialNetwork, JSX.Element>> = {
  facebook: <path d="M14 8h3V4h-3c-2.76 0-5 2.24-5 5v2H7v4h2v8h4v-8h3l1-4h-4V9c0-.55.45-1 1-1z" fill="currentColor" />,
  linkedin: (
    <path
      d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.6 8.65 21 11.2 21 14.5V21h-4v-5.8c0-1.4 0-3.2-1.95-3.2S12.8 13.5 12.8 15.1V21H9z"
      fill="currentColor"
    />
  ),
  twitter: (
    <path
      d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43z"
      fill="currentColor"
    />
  ),
  instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </g>
  ),
};

export function SocialIcon({ network, className }: { network: SocialNetwork; className?: string }) {
  const glyph = PATHS[network];
  if (!glyph) return <MessageCircle aria-hidden="true" strokeWidth={1.75} className={cn('h-5 w-5', className)} />;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={cn('h-5 w-5', className)}>
      {glyph}
    </svg>
  );
}
