import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { loanById, type LoanProduct } from '@/data/loans';

/**
 * generateMetadata for a loan product page: the crawled page title, and its purpose as
 * the description (published text; the old pages had no meta description).
 */
export function loanMetadata(id: LoanProduct['id']) {
  return async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const t = await getTranslations({ locale });
    const loan = loanById(id);
    return { title: t(`loans.products.${id}.meta.title`), description: t(loan.purposeKey) };
  };
}
