import { expect, test, type Page, type Route } from '@playwright/test';
import en from '../messages/en/common.json';
import hi from '../messages/hi/common.json';

/**
 * Phase 6 acceptance: the three Web3Forms forms (Membership, Contact, Careers).
 * Web3Forms is ALWAYS mocked here (page.route), so the test suite never sends real mail.
 */

type Form = { form: 'register' | 'contact' | 'careers'; path: string; fill: Record<string, string>; check?: string[]; select?: Record<string, string> };

const FORMS: Form[] = [
  { form: 'register', path: 'membership/', fill: { name: 'Test Member', mobile: '9876543210', districtVillage: 'Motihari' }, select: { loanProduct: 'notSure' }, check: ['ageConfirm', 'consentPhone'] },
  { form: 'contact', path: 'contact/', fill: { name: 'Test Visitor', mobile: '9876543210', topic: 'Test', message: 'Test message' } },
  { form: 'careers', path: 'careers/', fill: { name: 'Test Applicant', mobile: '9876543210', email: 'test@example.com', position: 'Field Officer' } },
];

const submit = (page: Page, f: Form) => page.locator(`#${f.form}-name`).locator('xpath=ancestor::form').getByRole('button', { name: /Submit|भेजें/ }).click();

async function fillValid(page: Page, f: Form) {
  for (const [k, v] of Object.entries(f.fill)) await page.locator(`#${f.form}-${k}`).fill(v);
  for (const [k, v] of Object.entries(f.select ?? {})) await page.locator(`#${f.form}-${k}`).selectOption(v);
  for (const k of f.check ?? []) await page.locator(`#${f.form}-${k}`).check();
}

/** Captures the JSON sent to Web3Forms and answers like the real API. */
async function mockWeb3Forms(page: Page, success = true) {
  const sent: Record<string, unknown>[] = [];
  await page.route('https://api.web3forms.com/**', (route: Route) => {
    sent.push(route.request().postDataJSON() as Record<string, unknown>);
    return route.fulfill({ status: success ? 200 : 500, contentType: 'application/json', body: JSON.stringify({ success, message: success ? 'ok' : 'error' }) });
  });
  return sent;
}

for (const f of FORMS) {
  for (const [locale, m] of [['en', en], ['hi', hi]] as const) {
    test(`${f.form} (${locale}): empty submit shows the summary and required errors in ${locale.toUpperCase()}`, async ({ page }) => {
      await page.goto(`/${locale}/${f.path}`);
    await page.locator('form[data-hydrated]').first().waitFor();
      const sent = await mockWeb3Forms(page);
      await page.locator(`#${f.form}-name`).focus();
      await submit(page, f);
      const summary = page.locator(`#${f.form}-name`).locator('xpath=ancestor::form').getByRole('alert');
      await expect(summary).toBeFocused();
      await expect(page.locator(`#${f.form}-name`)).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator(`#${f.form}-name-error`)).toHaveText(m.form.errors.required);
      await page.locator(`#${f.form}-mobile`).fill('12345');
      await submit(page, f);
      await expect(page.locator(`#${f.form}-mobile-error`)).toHaveText(m.form.errors.mobileInvalid);
      expect(sent).toHaveLength(0);
    });
  }

  test(`${f.form}: a valid submission posts the fields + hidden fields to Web3Forms and shows success`, async ({ page }) => {
    await page.goto(`/en/${f.path}`);
    await page.locator('form[data-hydrated]').first().waitFor();
    const sent = await mockWeb3Forms(page);
    await fillValid(page, f);
    await submit(page, f);
    await expect(page.getByRole('status').filter({ hasText: en.form.status.success })).toBeVisible();
    expect(sent).toHaveLength(1);
    const body = sent[0];
    expect(body.form_name).toBe(f.form);
    expect(body.locale).toBe('en');
    expect(String(body.page_url)).toContain(`/en/${f.path}`);
    expect(String(body.access_key)).toMatch(/^[0-9a-f-]{36}$/i);
    expect(body.name).toBe(f.fill.name);
    // The email subject is always the form's own (Web3Forms reserves `subject`).
    expect(body.subject).toBe({ register: 'Registration', contact: 'Contact Us', careers: 'Apply For Jobs' }[f.form]);
    expect(body).not.toHaveProperty('botcheck');
    // Never ID numbers, bank details or uploads (content rule 7).
    for (const key of Object.keys(body)) expect(key).not.toMatch(/aadha|pan_|^pan$|bank|account|ifsc|upload|file/i);
  });

  test(`${f.form}: a Web3Forms failure shows "could not be sent"`, async ({ page }) => {
    await page.goto(`/en/${f.path}`);
    await page.locator('form[data-hydrated]').first().waitFor();
    await mockWeb3Forms(page, false);
    await fillValid(page, f);
    await submit(page, f);
    await expect(page.getByRole('status').filter({ hasText: en.form.errors.sendFailed })).toBeVisible();
  });

  test(`${f.form}: a ticked honeypot is dropped silently`, async ({ page }) => {
    await page.goto(`/en/${f.path}`);
    await page.locator('form[data-hydrated]').first().waitFor();
    const sent = await mockWeb3Forms(page);
    await fillValid(page, f);
    await page.locator(`#${f.form}-name`).locator('xpath=ancestor::form').locator('input[name="botcheck"]').evaluate((el: HTMLInputElement) => el.click());
    await submit(page, f);
    await page.waitForTimeout(500);
    expect(sent).toHaveLength(0);
  });

  test(`${f.form}: without JS the form posts natively to Web3Forms, with no upload fields`, async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(`/en/${f.path}`);
    const form = page.locator(`#${f.form}-name`).locator('xpath=ancestor::form');
    await expect(form).toHaveAttribute('action', 'https://api.web3forms.com/submit');
    await expect(form).toHaveAttribute('method', 'post');
    await expect(form.locator('input[name="access_key"]')).toHaveCount(1);
    await expect(form.locator('input[name="form_name"]')).toHaveValue(f.form);
    await expect(form.locator('input[type="file"]')).toHaveCount(0);
    await expect(page.locator(`#${f.form}-mobile`)).toHaveAttribute('pattern', '[6-9][0-9]{9}');
    await ctx.close();
  });
}

test('careers: an invalid email is rejected (EN and HI)', async ({ page }) => {
  for (const [locale, m] of [['en', en], ['hi', hi]] as const) {
    await page.goto(`/${locale}/careers/`);
    await page.locator('form[data-hydrated]').first().waitFor();
    await page.locator('#careers-email').fill('not-an-email');
    await page.locator('#careers-email').locator('xpath=ancestor::form').getByRole('button').last().click();
    await expect(page.locator('#careers-email-error')).toHaveText(m.form.errors.emailInvalid);
  }
});
