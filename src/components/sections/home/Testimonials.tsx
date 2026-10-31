import { getTranslations } from 'next-intl/server';
import { GoldenThread } from '@/components/motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { initials, testimonials, testimonialsHeadingKey, testimonialsLeadKey } from '@/data/testimonials';
import { TestimonialDeck } from './TestimonialDeck';

/**
 * Home §8 (site-plan): "What Our Members Say" + subtitle and the 4 quotes, exactly as
 * crawled, with initials avatars (no photos exist). The deck is a client component fed
 * with translated strings, so no message formatter ships to the browser.
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
    <section id="testimonials" className="relative bg-ivory">
      <div className="container-site thread-gutter section-pad relative">
        <GoldenThread className="thread-col inset-y-0 h-full" />
        <SectionHeading title={t(testimonialsHeadingKey)} lead={t(testimonialsLeadKey)} />
        <div className="mt-12">
          <TestimonialDeck items={items} labels={labels} />
        </div>
      </div>
    </section>
  );
}
