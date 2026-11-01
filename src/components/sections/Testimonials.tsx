import { getTranslations } from 'next-intl/server';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { initials, testimonials, testimonialsHeadingKey, testimonialsLeadKey } from '@/data/testimonials';
import { TestimonialDeck } from './TestimonialDeck';

/**
 * "What Our Members Say" (CR-01: moved from home to About): heading + subtitle and the 4
 * quotes exactly as crawled, with initials avatars (no photos exist), in a compact
 * single-card carousel. The deck gets translated strings, so no message formatter ships.
 */
export async function Testimonials() {
  const t = await getTranslations();
  const total = testimonials.length;

  const items = testimonials.map((x) => {
    const name = t(x.nameKey);
    return { id: x.id, quote: t(x.quoteKey), name, initials: initials(name) };
  });
  const labels = {
    track: t(testimonialsHeadingKey),
    previous: t('common.a11y.previous'),
    next: t('common.a11y.next'),
    pause: t('common.a11y.pauseSlides'),
    play: t('common.a11y.playSlides'),
    slideOf: items.map((_, i) => t('common.a11y.slideOf', { current: i + 1, total })),
    goTo: items.map((_, i) => t('common.a11y.goToSlide', { number: i + 1 })),
  };

  return (
    <section id="testimonials" className="relative bg-blush">
      <div className="container-site section-pad">
        <SectionHeading title={t(testimonialsHeadingKey)} lead={t(testimonialsLeadKey)} />
        <div className="mt-8">
          <TestimonialDeck items={items} labels={labels} />
        </div>
      </div>
    </section>
  );
}
