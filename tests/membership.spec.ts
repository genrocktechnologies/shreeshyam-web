import { expect, test } from '@playwright/test';
import common from '../messages/en/common.json';
import home from '../messages/en/home.json';
import howToJoin from '../messages/en/howToJoin.json';
import register from '../messages/en/register.json';

/** CR-01 acceptance: /membership/ (How to Join + Register + the moved process and FAQ). */

test('renders How to Join, the process, the checklists, the form and the FAQ', async ({ page }) => {
  await page.goto('/en/membership/');
    await page.locator('form[data-hydrated]').first().waitFor();
  const main = page.locator('main');
  await expect(page.locator('h1')).toHaveText(common.nav.membership);
  await expect(main).toContainText(howToJoin.intro);
  for (const step of Object.values(home.process.steps)) {
    await expect(page.locator('#process')).toContainText(step.title);
    await expect(page.locator('#process')).toContainText(step.text);
  }
  for (const item of [...Object.values(howToJoin.benefits.items), ...Object.values(howToJoin.eligibility.items)]) await expect(main).toContainText(item);
  await expect(main).toContainText(home.faq.items.documents.answer);
  await expect(page.locator('#register h2')).toHaveText(register.heading);
  for (const f of Object.values(home.faq.items)) await expect(page.locator('#faq')).toContainText(f.question);
});

test('FAQPage JSON-LD moved here with all six questions (and left home)', async ({ page }) => {
  await page.goto('/en/membership/');
    await page.locator('form[data-hydrated]').first().waitFor();
  const json = JSON.parse((await page.locator('#faq script[type="application/ld+json"]').textContent()) ?? '{}');
  expect(json['@type']).toBe('FAQPage');
  expect(json.mainEntity).toHaveLength(6);
  await page.goto('/en/');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
});

test('FAQ accordion: first answer open, others inert, buttons toggle', async ({ page }) => {
  await page.goto('/en/membership/');
    await page.locator('form[data-hydrated]').first().waitFor();
  const buttons = page.locator('#faq h3 > button');
  await expect(buttons).toHaveCount(6);
  await expect(buttons.first()).toHaveAttribute('aria-expanded', 'true');
  const second = page.locator(`[id="${await buttons.nth(1).getAttribute('aria-controls')}"]`);
  await expect(second).toHaveAttribute('inert', '');
  await buttons.nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(buttons.nth(1)).toHaveAttribute('aria-expanded', 'true');
  await expect(second).not.toHaveAttribute('inert', '');
});

test.describe('registration form', () => {
  test('never asks for ID numbers, bank details or uploads', async ({ page }) => {
    await page.goto('/en/membership/');
    await page.locator('form[data-hydrated]').first().waitFor();
    const form = page.locator('#register form');
    await expect(form.locator('input[type="file"]')).toHaveCount(0);
    const names = await form.locator('input, select, textarea').evaluateAll((els) => els.map((e) => e.getAttribute('name') ?? ''));
    for (const n of names) expect(n).not.toMatch(/aadha|pan|bank|account|ifsc|upload/i);
    // Visible labels for every field.
    for (const label of [common.form.fields.name, common.form.fields.mobile, common.form.fields.districtVillage, common.form.fields.loanProduct]) {
      await expect(form.getByLabel(label, { exact: false }).first()).toBeVisible();
    }
  });

  test('empty submit: error summary takes focus, inline errors are tied to their fields', async ({ page }) => {
    await page.goto('/en/membership/');
    await page.locator('form[data-hydrated]').first().waitFor();
    const form = page.locator('#register form');
    await form.getByLabel(common.form.fields.name, { exact: false }).first().focus();
    await form.getByRole('button', { name: common.buttons.submit }).click();
    const summary = form.getByRole('alert');
    await expect(summary).toBeFocused();
    await expect(summary).toContainText('errors');
    const name = page.locator('#register-name');
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator(`#${await name.getAttribute('aria-describedby')}`)).toHaveText(common.form.errors.required);
  });

  test('an invalid mobile number is rejected with the bilingual-ready message', async ({ page }) => {
    await page.goto('/en/membership/');
    await page.locator('form[data-hydrated]').first().waitFor();
    await page.locator('#register-mobile').fill('12345');
    await page.locator('#register form').getByRole('button', { name: common.buttons.submit }).click();
    await expect(page.locator('#register-mobile-error')).toHaveText(common.form.errors.mobileInvalid);
  });
});
