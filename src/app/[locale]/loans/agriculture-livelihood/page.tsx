import { setRequestLocale } from 'next-intl/server';
import { LoanPage } from '@/components/sections/loans/LoanPage';
import { loanMetadata } from '@/components/sections/loans/metadata';

export { generateStaticParams } from '@/i18n/static-params';

export const generateMetadata = loanMetadata('agricultureLivelihood');

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <LoanPage id="agricultureLivelihood" />;
}
