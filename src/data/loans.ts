import loanMessages from '../../messages/en/loans.json';
import type { ImageKey } from './images';

type ProductId = keyof typeof loanMessages.products;

export interface LabelledValue {
  labelKey: string;
  valueKey: string;
}

export interface LabelledList {
  id: string;
  labelKey: string;
  itemKeys: string[];
}

export interface LoanProduct {
  id: ProductId;
  /** Locale-less path; prefix with the locale when linking. */
  href: string;
  navKey: string;
  nameKey: string;
  /** One-line purpose for LoanCard: the page's intro paragraph, else its "Purpose" row. */
  purposeKey: string;
  /** The crawled "Purpose" row. LoanPage lists it in KeyFacts when the hero shows the intro instead. */
  purpose: LabelledValue | null;
  image: ImageKey | null;
  /**
   * KeyFacts. Only values published on the live loan pages are filled; everything else
   * is null until the client supplies it (docs/client-requests.md, C). KeyFacts renders
   * only non-null fields.
   */
  keyFacts: {
    amount: LabelledValue | null;
    tenure: LabelledValue | null;
    charges: LabelledValue | null;
    repayment: LabelledValue | null;
    eligibility: LabelledList | null;
    documents: LabelledList | null;
  };
  /** The other crawled lists (features, uses, suitable for…), in crawled order. */
  lists: LabelledList[];
}

const KEY_FACT_LISTS = new Set(['eligibility', 'documents']);

function product(id: ProductId, href: string): LoanProduct {
  const m = loanMessages.products[id] as {
    intro?: string;
    facts: Record<string, { label: string; value: string }>;
    lists: Record<string, { label: string; items: Record<string, string> }>;
  };
  const ns = `loans.products.${id}`;
  const fact = (k: string): LabelledValue | null =>
    m.facts[k] ? { labelKey: `${ns}.facts.${k}.label`, valueKey: `${ns}.facts.${k}.value` } : null;
  const list = (k: string): LabelledList | null =>
    m.lists[k]
      ? { id: k, labelKey: `${ns}.lists.${k}.label`, itemKeys: Object.keys(m.lists[k].items).map((i) => `${ns}.lists.${k}.items.${i}`) }
      : null;

  return {
    id,
    href,
    navKey: `common.nav.loanProducts.${id}`,
    nameKey: `${ns}.name`,
    purposeKey: m.intro ? `${ns}.intro` : `${ns}.facts.purpose.value`,
    purpose: fact('purpose'),
    image: null,
    keyFacts: {
      amount: fact('amount'),
      tenure: fact('tenure'),
      charges: null,
      repayment: null,
      eligibility: list('eligibility'),
      documents: list('documents'),
    },
    lists: Object.keys(m.lists)
      .filter((k) => !KEY_FACT_LISTS.has(k))
      .map((k) => list(k)!),
  };
}

/** Order follows the old Products menu. */
export const loans: LoanProduct[] = [
  product('womenEmpowerment', '/loans/women-empowerment/'),
  product('microBusiness', '/loans/micro-business/'),
  product('agricultureLivelihood', '/loans/agriculture-livelihood/'),
  product('livestock', '/loans/livestock/'),
];

export const loansHubHref = '/loans/';

/**
 * The hub's intro reuses published copy (there is no crawled hub page): the home page's
 * "Financial Inclusion Services" description. Listed for the client in client-requests.
 */
export const loansHubIntroKey = 'home.services.items.financialInclusion.text';
export const whoCanApplyHeadingKey = 'loans.hub.whoCanApply';
export const relatedLoansHeadingKey = 'loans.related.heading';

export function loanById(id: LoanProduct['id']): LoanProduct {
  const loan = loans.find((l) => l.id === id);
  if (!loan) throw new Error(`Unknown loan: ${id}`);
  return loan;
}

/** The other products, in menu order (the "Other loans" nav on each product page). */
export const relatedLoans = (id: LoanProduct['id']) => loans.filter((l) => l.id !== id);
