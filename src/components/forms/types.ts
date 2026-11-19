/** The site's three Web3Forms forms (site-plan, Forms). */
export type FormName = 'register' | 'contact' | 'careers';

/**
 * One field, described on the server (labels already translated), rendered by WebForm.
 * Never an ID number, bank detail or upload (CLAUDE.md content rule 7).
 */
export interface FieldSpec {
  /** Must match the field in schemas.ts. Sent to the inbox as snake_case. */
  name: string;
  type: 'text' | 'tel' | 'email' | 'select' | 'textarea' | 'checkbox';
  label: string;
  required: boolean;
  autoComplete?: string;
  /** Native maxlength (the zod schema enforces the same limit). */
  maxLength?: number;
  /** select only: value (English, for the inbox) and translated label. */
  options?: { value: string; label: string }[];
  /** Pre-selected value (e.g. the loan on a loan page's application form). */
  defaultValue?: string;
  /** Full row in the two-column grid (textareas always are). */
  wide?: boolean;
}

/** Strings shared by every form, translated on the server. */
export interface FormLabels {
  optional: string;
  required: string;
  honeypot: string;
  submit: string;
  sending: string;
  success: string;
  sendFailed: string;
  /** "Please fix N errors in the form." for N = index + 1. */
  errorsSummary: string[];
  errors: {
    required: string;
    nameTooShort: string;
    mobileInvalid: string;
    emailInvalid: string;
    /** Raw ICU text with "{max}" (filled in by the schema). */
    tooLong: string;
    chooseOption: string;
    ageRequired: string;
    consentRequired: string;
  };
}
