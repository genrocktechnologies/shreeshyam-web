import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod/mini';
import { LIMITS } from './limits';
import type { FormLabels, FormName } from './types';

/**
 * The zod schemas of the three forms, with their react-hook-form resolvers. WebForm loads
 * this module on demand (first focus, or the first submit), so zod (~18 KB gzip) is never
 * in a page's first-load JS. Error texts come translated from the server.
 */
export function resolverFor(form: FormName, e: FormLabels['errors']) {
  const max = (n: number) => e.tooLong.replace('{max}', String(n));
  const name = z.string().check(z.trim(), z.minLength(1, e.required), z.minLength(3, e.nameTooShort), z.maxLength(LIMITS.name, max(LIMITS.name)));
  const mobile = z.string().check(z.trim(), z.minLength(1, e.required), z.regex(/^[6-9]\d{9}$/, e.mobileInvalid));
  const requiredText = (n: number) => z.string().check(z.trim(), z.minLength(1, e.required), z.maxLength(n, max(n)));
  const optionalText = (n: number) => z.string().check(z.trim(), z.maxLength(n, max(n)));
  const requiredEmail = z.string().check(z.trim(), z.minLength(1, e.required), z.maxLength(LIMITS.email, max(LIMITS.email)), z.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, e.emailInvalid));
  const optionalEmail = z.string().check(z.trim(), z.maxLength(LIMITS.email, max(LIMITS.email)), z.regex(/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, e.emailInvalid));
  const botcheck = z.boolean();

  const schemas = {
    register: z.object({
      name,
      mobile,
      districtVillage: requiredText(LIMITS.short),
      loanProduct: z.string().check(z.minLength(1, e.chooseOption)),
      message: optionalText(LIMITS.message),
      ageConfirm: z.boolean().check(z.refine((v) => v, e.ageRequired)),
      consentPhone: z.boolean().check(z.refine((v) => v, e.consentRequired)),
      botcheck,
    }),
    contact: z.object({
      name,
      mobile,
      email: optionalEmail,
      subject: requiredText(LIMITS.short),
      message: requiredText(LIMITS.message),
      botcheck,
    }),
    careers: z.object({
      name,
      mobile,
      email: requiredEmail,
      position: requiredText(LIMITS.short),
      message: optionalText(LIMITS.message),
      botcheck,
    }),
  };
  return zodResolver(schemas[form]);
}
