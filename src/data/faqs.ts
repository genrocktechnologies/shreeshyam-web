export interface Faq {
  id: string;
  questionKey: string;
  answerKey: string;
}

const faq = (id: string): Faq => ({
  id,
  questionKey: `home.faq.items.${id}.question`,
  answerKey: `home.faq.items.${id}.answer`,
});

/** The six FAQs from the home page, in crawled order. Also feeds FAQPage JSON-LD. */
export const faqs: Faq[] = [
  faq('services'),
  faq('whoCanBenefit'),
  faq('financialInclusion'),
  faq('documents'),
  faq('entrepreneurship'),
  faq('membership'),
];

export const faqHeadingKey = 'home.faq.heading';

/** Source text for the Loans hub "Who can apply" (site-plan: FAQ Q2/Q6). */
export const whoCanApplyFaqIds = ['whoCanBenefit', 'membership'] as const;

/** Source text for the loan pages' "Documents usually needed" (site-plan: FAQ Q4). */
export const documentsFaqId = 'documents';
