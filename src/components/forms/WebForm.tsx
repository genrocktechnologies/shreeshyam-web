'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { cx } from '@/lib/cx';
import { sendToWeb3Forms, WEB3FORMS_ENDPOINT, WEB3FORMS_KEY } from '@/lib/web3forms';
import type { FieldSpec, FormLabels, FormName } from './types';

type Values = Record<string, string | boolean>;

/** The zod schemas + resolvers, fetched once per page (first focus, or the first submit). */
let schemaLoad: Promise<typeof import('./schemas')> | null = null;
const loadSchemas = () => (schemaLoad ??= import('./schemas'));

/** "districtVillage" → "district_village" (readable keys in the foundation's inbox). */
const snake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

interface WebFormProps {
  form: FormName;
  fields: FieldSpec[];
  labels: FormLabels;
  /** Email subject for the foundation's inbox. */
  subject: string;
  locale: string;
}

/**
 * The site's forms (Membership registration, Contact, Careers), posting to Web3Forms
 * (site-plan, Forms). Fields come from the server as data (fields.ts), already translated.
 *
 * - Without JS the same form posts straight to Web3Forms, with native required / pattern /
 *   type checks.
 * - With JS: zod validation on submit (the schema module loads on demand), an error summary
 *   that takes focus, inline errors tied to their fields (aria-describedby), a polite live
 *   status, and the hidden fields `form_name`, `locale` and `page_url`.
 * - Honeypot: `botcheck` (Web3Forms' name); a ticked honeypot is dropped silently.
 * - Never collects ID numbers, bank details or uploads (content rule 7).
 */
export function WebForm({ form, fields, labels, subject, locale }: WebFormProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [hydrated, setHydrated] = useState(false);
  const summary = useRef<HTMLDivElement>(null);

  // Async resolver: zod arrives with the first validation, not with the page.
  const resolver = useRef<Resolver<Values> | null>(null);
  const resolve: Resolver<Values> = async (values, context, options) => {
    resolver.current ??= (await loadSchemas()).resolverFor(form, labels.errors) as unknown as Resolver<Values>;
    return resolver.current(values, context, options);
  };

  const id = (name: string) => `${form}-${name}`;
  // The form is server-rendered and its script loads later, so people may already have
  // typed. Start from what is in the inputs (read once, during hydration) instead of
  // blanking them; on the server there is no document and the defaults are empty.
  const [defaults] = useState<Values>(() =>
    Object.fromEntries([
      ...fields.map((f) => {
        const el = typeof document === 'undefined' ? null : (document.getElementById(id(f.name)) as HTMLInputElement | null);
        return [f.name, f.type === 'checkbox' ? !!el?.checked : (el?.value ?? f.defaultValue ?? '')];
      }),
      ['botcheck', false],
    ]),
  );
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, submitCount },
  } = useForm<Values>({
    resolver: resolve,
    // The error summary takes focus instead (it says how many fields need fixing).
    shouldFocusError: false,
    defaultValues: defaults,
  });

  // Once attached, copy in anything typed while the form's script was still loading, then
  // mark the form ready (data-hydrated; it also switches to JS validation).
  useEffect(() => {
    for (const f of fields) {
      const el = document.getElementById(id(f.name)) as HTMLInputElement | null;
      if (el) setValue(f.name, f.type === 'checkbox' ? el.checked : el.value);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errorCount = Object.keys(errors).length;
  useEffect(() => {
    if (submitCount > 0 && errorCount > 0) summary.current?.focus();
  }, [submitCount, errorCount]);

  const onValid = async (v: Values) => {
    if (v.botcheck) return;
    setStatus('sending');
    const values = Object.fromEntries(fields.map((f) => [snake(f.name), v[f.name]]));
    const ok = await sendToWeb3Forms({
      subject,
      from_name: String(v.name ?? ''),
      form_name: form,
      locale,
      page_url: window.location.href,
      ...values,
    });
    setStatus(ok ? 'success' : 'error');
    if (ok) reset();
  };

  const aria = (name: string) => ({
    id: id(name),
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${id(name)}-error` : undefined,
  });
  const input =
    'mt-1.5 block min-h-tap w-full rounded-xl border border-rani-200 bg-white px-4 py-2.5 text-body text-ink outline-none transition-colors focus:border-rani-500 aria-[invalid=true]:border-danger';
  const error = (name: string) =>
    errors[name] ? (
      <p id={`${id(name)}-error`} className="mt-1.5 text-small font-medium text-danger">
        {String(errors[name]?.message)}
      </p>
    ) : null;
  const marker = (f: FieldSpec) =>
    f.required ? (
      <>
        <span aria-hidden="true" className="text-rani-600">
          {' '}
          *
        </span>
        <span className="sr-only"> ({labels.required})</span>
      </>
    ) : (
      <span className="font-normal text-ink-muted"> {labels.optional}</span>
    );

  const control = (f: FieldSpec) => {
    const common = { ...register(f.name), ...aria(f.name), required: f.required, maxLength: f.maxLength };
    if (f.type === 'textarea') return <textarea {...common} rows={4} className={cx(input, 'resize-y')} />;
    if (f.type === 'select')
      return (
        <select {...common} defaultValue={f.defaultValue ?? ''} className={cx(input, 'appearance-auto')}>
          <option value="" disabled>
            —
          </option>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    return (
      <input
        {...common}
        type={f.type}
        autoComplete={f.autoComplete}
        {...(f.type === 'tel' ? { inputMode: 'numeric' as const, pattern: '[6-9][0-9]{9}' } : {})}
        className={input}
      />
    );
  };

  const boxes = fields.filter((f) => f.type === 'checkbox');
  const others = fields.filter((f) => f.type !== 'checkbox');

  return (
    <form action={WEB3FORMS_KEY ? WEB3FORMS_ENDPOINT : undefined} method="post" noValidate={hydrated} data-hydrated={hydrated ? '' : undefined} onSubmit={handleSubmit(onValid)} onFocus={() => void loadSchemas().catch(() => undefined)} className="grid gap-5">
      {/* No-JS submissions: Web3Forms reads these directly. */}
      {WEB3FORMS_KEY && <input type="hidden" name="access_key" value={WEB3FORMS_KEY} />}
      <input type="hidden" name="subject" value={subject} />
      <input type="hidden" name="form_name" value={form} />
      <input type="hidden" name="locale" value={locale} />

      {errorCount > 0 && (
        <div ref={summary} tabIndex={-1} role="alert" className="rounded-xl border border-danger/40 bg-rani-50 px-4 py-3 font-medium text-danger outline-none">
          {labels.errorsSummary[Math.min(errorCount, labels.errorsSummary.length) - 1]}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {others.map((f) => (
          <div key={f.name} className={f.wide || f.type === 'textarea' ? 'sm:col-span-2' : undefined}>
            <label htmlFor={id(f.name)} className="block font-medium text-ink">
              {f.label}
              {marker(f)}
            </label>
            {control(f)}
            {error(f.name)}
          </div>
        ))}
      </div>

      {boxes.length > 0 && (
        <div className="grid gap-3">
          {boxes.map((f) => (
            <div key={f.name}>
              <label className="flex min-h-tap cursor-pointer items-start gap-3 py-1">
                <input {...register(f.name)} {...aria(f.name)} type="checkbox" required={f.required} className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer rounded border-rani-300 accent-rani-500" />
                <span className="text-ink">
                  {f.label}
                  {marker(f)}
                </span>
              </label>
              {error(f.name)}
            </div>
          ))}
        </div>
      )}

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
