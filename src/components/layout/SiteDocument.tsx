import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
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
 *
 * `fonts` is the next/font class list (app/fonts.ts). The route files import it and pass
 * it in: next/font only emits <link rel=preload> for fonts imported by the route entry
 * itself; imported from here, nothing was preloaded and the hero fonts swapped late.
 */
export async function SiteDocument({ locale, fonts, children }: { locale: Locale; fonts: string; children: ReactNode }) {
  const t = await getTranslations({ locale, namespace: 'common' });
  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={fonts}
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
            {/* overflow-x: clip keeps sideways motion (the Loans track) from adding a horizontal
                scrollbar. It sits here, not on the pinned section: an overflow clip on a pinned
                element makes Chrome report the pin as a full-viewport layout shift. It creates
                no scroll container, so position: sticky still works inside. */}
            <main id="main" tabIndex={-1} className="overflow-x-clip outline-none">
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
