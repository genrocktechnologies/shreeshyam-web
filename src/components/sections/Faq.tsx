import { getLocale, getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion';
import { Accordion } from '@/components/ui/Accordion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { faqHeadingKey, faqs } from '@/data/faqs';

/**
 * FAQ (CR-01: moved from home to Membership, with its FAQPage JSON-LD): the 6 crawled
 * Q&As in an accordion (first one open), JSON-LD built from the same messages.
 */
export async function Faq() {
  const t = await getTranslations();
  const locale = await getLocale();
  const items = faqs.map((f) => ({ id: f.id, title: t(f.questionKey), body: t(f.answerKey) }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: items.map((q) => ({ '@type': 'Question', name: q.title, acceptedAnswer: { '@type': 'Answer', text: q.body } })),
  };

  return (
    <section id="faq" className="relative bg-ivory">
      <div className="container-site section-pad relative grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
        <SectionHeading title={t(faqHeadingKey)} className="lg:sticky lg:top-32 lg:self-start" />
        <Reveal>
          <Accordion items={items} />
        </Reveal>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </section>
  );
}
