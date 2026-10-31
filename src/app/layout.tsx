import type { ReactNode } from 'react';

// The real <html> lives in app/[locale]/layout.tsx. This root layout only exists so
// app/page.tsx (the locale redirect) has a parent.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
