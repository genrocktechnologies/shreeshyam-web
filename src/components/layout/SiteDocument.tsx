import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { fontVariables } from '@/app/fonts';
import { MotionScript, SmoothScroll } from '@/components/motion';
import { pickMessages } from '@/i18n/pick';
import { clientNamespaces, type Locale } from '@/i18n/routing';
import { Footer } from './Footer';
import { Header } from './Header';
import { MobileActionBar } from './MobileActionBar';
import '@/app/globals.css';

/**
 * The full HTML document with the site chrome (header, footer, mobile action bar).
 * Shared by app/[locale]/layout.tsx and the root app/not-found.tsx (the static 404.html),
 * so both get the same fonts, motion boot script, providers and chrome.
 */
export async function SiteDocument({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = await getTranslations({ locale, namespace: 'common' });
  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={fontVariables}
      suppressHydrationWarning // html.js-motion is added by the inline script before hydration
    >
      {/* App Router document: <head> is correct here. The lint rule only exempts files under app/. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
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
        <NextIntlClientProvider locale={locale} messages={pickMessages(messages, clientNamespaces)}>
          <SmoothScroll>
            <Header locale={locale} />
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <Footer locale={locale} />
            <MobileActionBar />
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
