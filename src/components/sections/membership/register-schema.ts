import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod/mini';
import type { RegisterFormLabels } from './RegisterForm';

export const MESSAGE_MAX = 500;

/**
 * The registration schema and its react-hook-form resolver. Loaded on demand by
 * RegisterForm (first focus, or submit), so zod (~18 KB gzip) stays out of every page's
 * first-load JS (CLAUDE.md bundle budget).
 */
export function registerResolver(e: RegisterFormLabels['errors']) {
  const max = (n: number) => e.tooLong.replace('{max}', String(n));
  const schema = z.object({
    name: z.string().check(z.trim(), z.minLength(1, e.required), z.minLength(3, e.nameTooShort), z.maxLength(80, max(80))),
    mobile: z.string().check(z.trim(), z.minLength(1, e.required), z.regex(/^[6-9]\d{9}$/, e.mobileInvalid)),
    ageConfirm: z.boolean().check(z.refine((v) => v, e.ageRequired)),
    districtVillage: z.string().check(z.trim(), z.minLength(1, e.required), z.maxLength(120, max(120))),
    loanProduct: z.string().check(z.minLength(1, e.chooseOption)),
    message: z.string().check(z.maxLength(MESSAGE_MAX, max(MESSAGE_MAX))),
    consentPhone: z.boolean().check(z.refine((v) => v, e.consentRequired)),
    botcheck: z.boolean(),
  });
  return zodResolver(schema);
}
