'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, type FieldErrors, type Resolver } from 'react-hook-form';
import { cx } from '@/lib/cx';
import { sendToWeb3Forms, WEB3FORMS_ENDPOINT, WEB3FORMS_KEY } from '@/lib/web3forms';

/** Every visible string, translated on the server (no message formatter in the browser). */
export interface RegisterFormLabels {
  name: string;
  mobile: string;
  ageConfirm: string;
  districtVillage: string;
  loanProduct: string;
  message: string;
  consentPhone: string;
  optional: string;
  required: string;
  honeypot: string;
  submit: string;
  sending: string;
  success: string;
  sendFailed: string;
  /** "Please fix N errors in the form." for N = index (1-based). */
  errorsSummary: string[];
  errors: {
    required: string;
    nameTooShort: string;
    mobileInvalid: string;
    tooLong: string;
    chooseOption: string;
    ageRequired: string;
    consentRequired: string;
  };
  /** Loan options (4 products + "Not sure"); value is the English name sent to the inbox. */
  loanOptions: { value: string; label: string }[];
  /** Email subject for the foundation's inbox. */
  subject: string;
}

/** Must match register-schema.ts (kept here so the native maxlength needs no zod import). */
const MESSAGE_MAX = 500;

interface Values {
  name: string;
  mobile: string;
  ageConfirm: boolean;
  districtVillage: string;
  loanProduct: string;
  message: string;
  consentPhone: boolean;
  botcheck: boolean;
}

/** The zod schema + resolver chunk, fetched once (first focus, or the first submit). */
let schemaLoad: Promise<typeof import('./register-schema')> | null = null;
const loadSchema = () => (schemaLoad ??= import('./register-schema'));

/**
 * Membership registration (site-plan, Forms → Register; CR-01: on /membership/#register).
 * Name, mobile, 18+; district/village, preferred loan; optional message and phone consent.
 * It NEVER asks for Aadhaar, PAN, bank details or uploads (content rule 7): documents are
 * verified at the office.
 *
 * Without JS the same form posts straight to Web3Forms (native required/pattern checks).
 * With JS: zod validation on submit (the schema chunk loads on demand), an error summary that takes focus, inline errors tied
 * to their fields (aria-describedby), and a polite live status. Honeypot: `botcheck`.
 */
export function RegisterForm({ labels, locale }: { labels: RegisterFormLabels; locale: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [hydrated, setHydrated] = useState(false);
  const summary = useRef<HTMLDivElement>(null);
  const e = labels.errors;
  useEffect(() => setHydrated(true), []);

  // Async resolver: zod arrives with the first validation, not with the page.
  const resolver = useRef<Resolver<Values> | null>(null);
  const resolve: Resolver<Values> = async (values, context, options) => {
    if (!resolver.current) resolver.current = (await loadSchema()).registerResolver(e) as unknown as Resolver<Values>;
    return resolver.current(values, context, options);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, submitCount },
  } = useForm<Values>({
    resolver: resolve,
    defaultValues: { name: '', mobile: '', ageConfirm: false, districtVillage: '', loanProduct: '', message: '', consentPhone: false, botcheck: false },
  });

  const errorCount = Object.keys(errors).length;
  // After a failed submit, move focus to the summary so screen readers hear it.
  useEffect(() => {
    if (submitCount > 0 && errorCount > 0) summary.current?.focus();
  }, [submitCount, errorCount]);

  const onValid = async (v: Values) => {
    if (v.botcheck) return; // a bot filled the hidden field: drop silently
    setStatus('sending');
    const ok = await sendToWeb3Forms({
      subject: labels.subject,
      from_name: v.name,
      form_name: 'register',
      locale,
      page_url: window.location.href,
      name: v.name,
      mobile: v.mobile,
      age_18_or_above: v.ageConfirm,
      district_village: v.districtVillage,
      loan_product: v.loanProduct,
      message: v.message,
      consent_phone: v.consentPhone,
    });
    setStatus(ok ? 'success' : 'error');
    if (ok) reset();
  };

  const field = (name: keyof Values, err: FieldErrors<Values>) => ({
    id: `register-${name}`,
    'aria-invalid': err[name] ? true : undefined,
    'aria-describedby': err[name] ? `register-${name}-error` : undefined,
  });
  const input =
    'mt-1.5 block min-h-tap w-full rounded-xl border border-rani-200 bg-white px-4 py-2.5 text-body text-ink outline-none transition-colors focus:border-rani-500 aria-[invalid=true]:border-danger';
  const label = 'block font-medium text-ink';
  const Err = ({ name }: { name: keyof Values }) =>
    errors[name] ? (
      <p id={`register-${name}-error`} className="mt-1.5 text-small font-medium text-danger">
        {String(errors[name]?.message)}
      </p>
    ) : null;
  const Required = () => (
    <>
      <span aria-hidden="true" className="text-rani-600">
        {' '}
        *
      </span>
      <span className="sr-only"> ({labels.required})</span>
    </>
  );

  return (
    <form
      action={WEB3FORMS_KEY ? WEB3FORMS_ENDPOINT : undefined}
      method="post"
      noValidate={hydrated}
      onSubmit={handleSubmit(onValid)}
      onFocus={() => void loadSchema().catch(() => undefined)}
      className="grid gap-5"
    >
      {/* No-JS submissions: Web3Forms reads these directly. */}
      {WEB3FORMS_KEY && <input type="hidden" name="access_key" value={WEB3FORMS_KEY} />}
      <input type="hidden" name="subject" value={labels.subject} />
      <input type="hidden" name="form_name" value="register" />
      <input type="hidden" name="locale" value={locale} />

      {errorCount > 0 && (
        <div ref={summary} tabIndex={-1} role="alert" className="rounded-xl border border-danger/40 bg-rani-50 px-4 py-3 font-medium text-danger outline-none">
          {labels.errorsSummary[Math.min(errorCount, labels.errorsSummary.length) - 1]}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="register-name" className={label}>
            {labels.name}
            <Required />
          </label>
          <input {...register('name')} {...field('name', errors)} type="text" autoComplete="name" required minLength={3} maxLength={80} className={input} />
          <Err name="name" />
        </div>
        <div>
          <label htmlFor="register-mobile" className={label}>
            {labels.mobile}
            <Required />
          </label>
          <input
            {...register('mobile')}
            {...field('mobile', errors)}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            required
            pattern="[6-9][0-9]{9}"
            maxLength={10}
            className={input}
          />
          <Err name="mobile" />
        </div>
        <div>
          <label htmlFor="register-districtVillage" className={label}>
            {labels.districtVillage}
            <Required />
          </label>
          <input {...register('districtVillage')} {...field('districtVillage', errors)} type="text" autoComplete="address-level2" required maxLength={120} className={input} />
          <Err name="districtVillage" />
        </div>
        <div>
          <label htmlFor="register-loanProduct" className={label}>
            {labels.loanProduct}
            <Required />
          </label>
          <select {...register('loanProduct')} {...field('loanProduct', errors)} required className={cx(input, 'appearance-auto')}>
            <option value="" disabled>
              —
            </option>
            {labels.loanOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Err name="loanProduct" />
        </div>
      </div>

      <div>
        <label htmlFor="register-message" className={label}>
          {labels.message} <span className="font-normal text-ink-muted">{labels.optional}</span>
        </label>
        <textarea {...register('message')} {...field('message', errors)} rows={3} maxLength={MESSAGE_MAX} className={cx(input, 'resize-y')} />
        <Err name="message" />
      </div>

      <div className="grid gap-3">
        {(['ageConfirm', 'consentPhone'] as const).map((name) => (
          <div key={name}>
            <label className="flex min-h-tap cursor-pointer items-start gap-3 py-1">
              <input
                {...register(name)}
                {...field(name, errors)}
                type="checkbox"
                required
                className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer rounded border-rani-300 accent-rani-500"
              />
              <span className="text-ink">
                {labels[name]}
                <Required />
              </span>
            </label>
            <Err name={name} />
          </div>
        ))}
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots tick it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          {labels.honeypot}
          <input {...register('botcheck')} type="checkbox" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-marigold-400 px-8 text-[1.0625rem] font-bold text-plum-900 shadow-soft transition-transform duration-press ease-growth hover:-translate-y-0.5 hover:bg-marigold-500 disabled:opacity-60"
        >
          {status === 'sending' ? labels.sending : labels.submit}
        </button>
        <p role="status" aria-live="polite" className={cx('font-medium', status === 'error' ? 'text-danger' : 'text-success')}>
          {status === 'success' ? labels.success : status === 'error' ? labels.sendFailed : ''}
        </p>
      </div>
    </form>
  );
}
