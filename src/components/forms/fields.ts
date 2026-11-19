import type { getTranslations } from 'next-intl/server';
import { loans } from '@/data/loans';
import { LIMITS } from './limits';
import type { FieldSpec, FormLabels, FormName } from './types';

type T = Awaited<ReturnType<typeof getTranslations>>;

const ERROR_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8];

/** Shared form strings, translated on the server (so no formatter ships to the browser). */
export function formLabels(t: T): FormLabels {
  return {
    optional: t('common.form.optional'),
    required: t('common.a11y.requiredField'),
    honeypot: t('common.form.fields.honeypot'),
    submit: t('common.buttons.submit'),
    sending: t('common.form.status.sending'),
    success: t('common.form.status.success'),
    sendFailed: t('common.form.errors.sendFailed'),
    errorsSummary: ERROR_COUNTS.map((count) => t('common.a11y.formErrorsSummary', { count })),
    errors: {
      required: t('common.form.errors.required'),
      nameTooShort: t('common.form.errors.nameTooShort'),
      mobileInvalid: t('common.form.errors.mobileInvalid'),
      emailInvalid: t('common.form.errors.emailInvalid'),
      tooLong: t.raw('common.form.errors.tooLong') as string,
      chooseOption: t('common.form.errors.chooseOption'),
      ageRequired: t('common.form.errors.ageRequired'),
      consentRequired: t('common.form.errors.consentRequired'),
    },
  };
}

/**
 * The fields of each form (site-plan, Forms). `options.loan` (loan pages) limits the Register
 * form's preferred loan to that one loan, pre-selected. Names match schemas.ts. No ID numbers, bank
 * details or uploads, ever (content rule 7); Careers CVs go by email (a mailto link).
 */
export function formFields(form: FormName, t: T, options: { loan?: string } = {}): FieldSpec[] {
  const f = (name: string) => t(`common.form.fields.${name}`);
  const name: FieldSpec = { name: 'name', type: 'text', label: f('name'), required: true, autoComplete: 'name', maxLength: LIMITS.name };
  const mobile: FieldSpec = { name: 'mobile', type: 'tel', label: f('mobile'), required: true, autoComplete: 'tel-national', maxLength: 10 };
  const message = (required: boolean): FieldSpec => ({ name: 'message', type: 'textarea', label: f('message'), required, maxLength: LIMITS.message });

  switch (form) {
    case 'register':
      return [
        name,
        mobile,
        { name: 'districtVillage', type: 'text', label: f('districtVillage'), required: true, autoComplete: 'address-level2', maxLength: LIMITS.short },
        {
          name: 'loanProduct',
          type: 'select',
          label: f('loanProduct'),
          required: true,
          // On a loan page only that loan is offered (and pre-selected); elsewhere all four
          // and "Not sure".
          options: options.loan
            ? loans.filter((l) => l.id === options.loan).map((l) => ({ value: l.id, label: t(l.navKey) }))
            : [...loans.map((l) => ({ value: l.id, label: t(l.navKey) })), { value: 'notSure', label: f('notSure') }],
          defaultValue: options.loan,
        },
        message(false),
        { name: 'ageConfirm', type: 'checkbox', label: f('ageConfirm'), required: true },
        { name: 'consentPhone', type: 'checkbox', label: f('consentPhone'), required: true },
      ];
    case 'contact':
      return [
        name,
        mobile,
        { name: 'email', type: 'email', label: f('email'), required: false, autoComplete: 'email', maxLength: LIMITS.email },
        // Named "topic": Web3Forms reserves `subject` for the email subject ("Contact Us").
        { name: 'topic', type: 'text', label: f('subject'), required: true, maxLength: LIMITS.short },
        message(true),
      ];
    case 'careers':
      return [
        name,
        mobile,
        { name: 'email', type: 'email', label: f('email'), required: true, autoComplete: 'email', maxLength: LIMITS.email },
        { name: 'position', type: 'text', label: f('position'), required: true, maxLength: LIMITS.short },
        message(false),
      ];
  }
}
