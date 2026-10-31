import type { Metadata, Viewport } from 'next';
import { Fraunces, Kalam, Mukta, Tiro_Devanagari_Hindi } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { MotionScript, SmoothScroll } from '@/components/motion';
import { pickMessages } from '@/i18n/pick';
import { clientNamespaces, routing } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import '../globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-display',
  display: 'swap',
});
const tiroHindi = Tiro_Devanagari_Hindi({
  weight: '400',
  subsets: ['devanagari', 'latin'],
  variable: '--font-display-hi',
  display: 'swap',
  preload: false,
});
const mukta = Mukta({
  weight: ['400', '500', '700'],
  subsets: ['latin', 'devanagari'],
  variable: '--font-body',
  display: 'swap',
});
const kalam = Kalam({
  weight: ['400', '700'],
  subsets: ['latin', 'devanagari'],
  variable: '--font-script',
  display: 'swap',
  preload: false,
});

// Do NOT export `dynamicParams = false` here or in any page: with `output: 'export'`,
// Next 14's dev server then fails every route with a misleading "missing
// generateStaticParams()" error. The static export only emits the listed locales
// anyway, and unknown locales hit notFound() below.

export { generateStaticParams } from '@/i18n/static-params';

export const viewport: Viewport = {
  themeColor: '#FFFCF6',
  colorScheme: 'light',
};

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'common' });
  return {
    title: { default: t('siteName'), template: `%s | ${t('siteName')}` },
  };
}

export default async function LocaleLayout({ children, params: { locale } }: { children: ReactNode; params: { locale: string } }) {
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <html
      lang={locale}
      className={cn(fraunces.variable, tiroHindi.variable, mukta.variable, kalam.variable)}
      suppressHydrationWarning // html.js-motion is added by the inline script before hydration
    >
      <head>
        <MotionScript />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-plum-900 focus:px-5 focus:py-3 focus:text-ivory"
        >
          {t('a11y.skipToContent')}
        </a>
        <NextIntlClientProvider messages={pickMessages(await getMessages(), clientNamespaces)}>
          <SmoothScroll>{children}</SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
