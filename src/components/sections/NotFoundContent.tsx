import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import type { Locale } from '@/i18n/routing';

/** On-brand 404 body: seed-to-sprout drawing, one h1, and links home and to Loans. */
export async function NotFoundContent({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'common' });
  return (
    <section className="container-site grid min-h-[70vh] place-items-center pb-20 pt-[calc(var(--header-total)+3rem)] text-center">
      <div className="max-w-xl">
        <SproutIllustration className="mx-auto h-40 w-40" />
        <h1 className="mt-6 text-balance">{t('notFound.title')}</h1>
        <p className="mx-auto mt-4 text-body text-ink-muted">{t('notFound.text')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href="/" arrow>
            {t('buttons.backToHome')}
          </Button>
          <Button href="/loans/" variant="ghost">
            {t('buttons.exploreLoans')}
          </Button>
        </div>
        {locale !== 'hi' && (
          <p className="mt-6">
            <a href="/hi/" lang="hi" hrefLang="hi" className="font-bold text-rani-700 underline-offset-4 hover:underline">
              {t('notFound.hindiLink')}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}

/** A seed in the soil with a two-leaf sprout and a marigold bud. Decorative. */
function SproutIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" aria-hidden="true" focusable="false" className={className}>
      <circle cx="80" cy="80" r="76" className="fill-rani-50" />
      <path d="M24 122c18-8 36-10 56-10s38 2 56 10" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-rani-200" />
      <ellipse cx="80" cy="120" rx="10" ry="6" className="fill-plum-700" />
      <path d="M80 116V72" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-success" />
      <path d="M80 92c-4-14-16-20-30-18 2 14 14 22 30 18z" className="fill-success/80" />
      <path d="M80 84c4-14 16-20 30-18-2 14-14 22-30 18z" className="fill-success" />
      <circle cx="80" cy="66" r="8" className="fill-marigold-400" />
      <circle cx="80" cy="66" r="3" className="fill-marigold-600" />
    </svg>
  );
}
