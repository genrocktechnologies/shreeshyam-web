import { MessageCircle, Phone } from '@/components/ui/icons';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { site } from '@/data/site';
import { HideOnScroll } from './HideOnScroll';

/**
 * Fixed bottom bar below md: Register, plus Call and WhatsApp only when those numbers
 * exist (site.ts). Hides while scrolling down, returns on scroll up. The footer's bottom
 * row has matching padding below md, so the bar never covers it.
 */
export async function MobileActionBar() {
  const t = await getTranslations('common');
  return (
    <>
      <HideOnScroll className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        <nav
          aria-label={t('a11y.quickActions')}
          className="flex gap-2 border-t border-rani-100 bg-ivory/95 px-4 pt-3 shadow-lift backdrop-blur-md pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        >
          <Button href="/register/" prefetch={false} arrow className="flex-1">
            {t('buttons.register')}
          </Button>
          {site.phone && (
            <Button href={site.phone.href} variant="ghost" aria-label={t('a11y.callUs', { phone: site.phone.display })}>
              <Phone aria-hidden="true" strokeWidth={1.75} className="h-5 w-5" />
              {t('buttons.call')}
            </Button>
          )}
          {site.whatsapp && (
            <Button href={site.whatsapp.href} variant="ghost" target="_blank" rel="noopener noreferrer" aria-label={t('a11y.chatOnWhatsApp')}>
              <MessageCircle aria-hidden="true" strokeWidth={1.75} className="h-5 w-5" />
              {t('buttons.whatsApp')}
            </Button>
          )}
        </nav>
      </HideOnScroll>
    </>
  );
}
