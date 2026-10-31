import en from '../../messages/en/common.json';
import hi from '../../messages/hi/common.json';
import { routing } from '@/i18n/routing';

// On Vercel, vercel.json redirects "/" by Accept-Language before this file is served.
// This page is the fallback for any other static host. A meta refresh works without JS;
// next/navigation's redirect() would only redirect client-side in a static export.
export default function RootPage() {
  const target = `/${routing.defaultLocale}/`;
  return (
    <html lang={routing.defaultLocale}>
      <head>
        <meta httpEquiv="refresh" content={`0; url=${target}`} />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={target} />
        <title>{en.siteName}</title>
      </head>
      <body>
        <p>
          <a href={target}>{en.continueToSite}</a>
        </p>
        <p lang="hi">
          <a href="/hi/">{hi.continueToSite}</a>
        </p>
      </body>
    </html>
  );
}
