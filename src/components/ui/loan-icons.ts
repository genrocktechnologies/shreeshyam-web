import type { LoanProduct } from '@/data/loans';
import { HandCoins, Milk, Sprout, Store, type IconComponent } from './icons';

/** One icon per loan product (mega menu, footer, home Loans cards). */
export const LOAN_ICONS: Record<LoanProduct['id'], IconComponent> = {
  womenEmpowerment: HandCoins,
  microBusiness: Store,
  agricultureLivelihood: Sprout,
  livestock: Milk,
};
