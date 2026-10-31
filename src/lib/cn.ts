import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Server components only: client components use cx() (lib/cx.ts), which skips
// tailwind-merge (~17 KB gzip in the browser).
// Teach tailwind-merge the custom font-size tokens so `text-h2` and `text-rani-600`
// are not treated as conflicting classes.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'h2', 'h3', 'body', 'small', 'eyebrow', 'accent', 'stat'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
