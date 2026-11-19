import { expect, test } from '@playwright/test';
import loanMessages from '../messages/en/loans.json';
import faqMessages from '../messages/en/home.json';

/**
 * Phase 4 acceptance: the loans hub and the 4 product pages. Together with
 * scripts/verify-content.ts (crawl → messages) this proves crawl → rendered page.
 * Run against the static export.
 */

type Product = keyof typeof loanMessages.products;
const SLUGS: Record<Product, string> = {
  womenEmpowerment: 'women-empowerment',
  microBusiness: 'micro-business',
  agricultureLivelihood: 'agriculture-livelihood',
  livestock: 'livestock',
};
// Labels are uppercased with CSS, so compare case-insensitively.
const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Every string of a product's messages except the <title>. When the page has no intro,
 * the purpose value is the hero text and its "Purpose" row label (structure, not content)
 * isn't repeated, so that one label is skipped.
 */
function productStrings(id: Product): string[] {
  const { meta: _meta, ...rest } = loanMessages.products[id] as Record<string, unknown>;
  const out: string[] = [];
  if (!('intro' in rest)) {
    const facts = rest.facts as Record<string, { label: string; value: string }>;
    rest.facts = { ...facts, purpose: { value: facts.purpose.value } };
  }
  const walk = (v: unknown) => (typeof v === 'string' ? out.push(v) : v && typeof v === 'object' && Object.values(v).forEach(walk));
  walk(rest);
  return out;
}

for (const [id, slug] of Object.entries(SLUGS) as [Product, string][]) {
  test.describe(`/en/loans/${slug}/`, () => {
    test.beforeEach(async ({ page }) => page.goto(`/en/loans/${slug}/`));

    test('renders every crawled string for this product', async ({ page }) => {
      const text = norm(await page.locator('main').innerText());
      for (const s of productStrings(id)) expect(text, s).toContain(norm(s));
    });

    test('KeyFacts shows only the published fields', async ({ page }) => {
      const facts = (loanMessages.products[id] as { facts: Record<string, { label: string }> }).facts;
      const labels = (await page.locator('main dl dt').allInnerTexts()).map((s) => s.toLowerCase());
      for (const key of ['amount', 'tenure'] as const) {
        const label = facts[key]?.label.toLowerCase();
        if (label) expect(labels).toContain(label);
      }
      if (!facts.tenure) expect(labels).not.toContain('tenure');
      // Never published by the client yet: must not render (content rule 5).
      expect(labels.join(' ')).not.toMatch(/charges|repayment/);
    });

    test('documents: FAQ Q4 only when the product has no documents list', async ({ page }) => {
      const hasDocs = 'documents' in loanMessages.products[id].lists;
      const faq = page.getByRole('heading', { name: faqMessages.faq.items.documents.question });
      await expect(faq).toHaveCount(hasDocs ? 0 : 1);
    });

    test('related-loans nav links to the other 3 products and All loans', async ({ page }) => {
      const nav = page.getByRole('navigation', { name: loanMessages.related.heading });
      const hrefs = await nav.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
      expect(hrefs).toHaveLength(3);
      expect(hrefs).not.toContain(`/en/loans/${slug}/`);
      await expect(page.locator('main a[href="/en/loans/"]').first()).toBeVisible();
    });

    test('breadcrumb: Home › Loans › product', async ({ page }) => {
      const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
      await expect(crumbs.locator('a[href="/en/loans/"]')).toHaveCount(1);
      await expect(crumbs.locator('[aria-current="page"]')).toHaveText(loanMessages.products[id].name);
    });
  });
}

test('hub lists all 4 products with their published amounts, and Who can apply', async ({ page }) => {
  await page.goto('/en/loans/');
  for (const [id, slug] of Object.entries(SLUGS) as [Product, string][]) {
    await expect(page.locator(`main article a[href="/en/loans/${slug}/"]`)).toHaveCount(1);
    await expect(page.locator('main')).toContainText(loanMessages.products[id].facts.amount.value);
  }
  await expect(page.getByRole('heading', { level: 2, name: loanMessages.hub.whoCanApply })).toBeVisible();
  await expect(page.locator('main a[href="/en/membership/"]').first()).toBeVisible();
});

test('no placeholder or # links on loan pages', async ({ page }) => {
  for (const path of ['/en/loans/', ...Object.values(SLUGS).map((s) => `/en/loans/${s}/`)]) {
    await page.goto(path);
    const bad = await page.locator('main a').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? '').filter((h) => !h || h === '#' || /x{4}/i.test(h)));
    expect(bad, path).toEqual([]);
  }
});

for (const [id, slug] of Object.entries(SLUGS) as [Product, string][]) {
  test(`${slug}: "Apply for this loan" form with this loan pre-selected; sends the loan in the subject`, async ({ page }) => {
    await page.goto(`/en/loans/${slug}/`);
    const section = page.locator('#apply');
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(loanMessages.apply.heading);
    // The hero shortcut and the closing band both jump to the form.
    await expect(page.locator('main a[href="#apply"]')).toHaveCount(2);
    await page.locator('form[data-hydrated]').waitFor();
    await expect(page.locator('#register-loanProduct')).toHaveValue(id);
    // Same registration form as Membership: no ID numbers, bank details or uploads.
    await expect(section.locator('input[type="file"]')).toHaveCount(0);

    // Web3Forms is mocked: the suite never sends real mail.
    const sent: Record<string, unknown>[] = [];
    await page.route('https://api.web3forms.com/**', (route) => {
      sent.push(route.request().postDataJSON() as Record<string, unknown>);
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
    });
    await page.locator('#register-name').fill('Test Applicant');
    await page.locator('#register-mobile').fill('9876543210');
    await page.locator('#register-districtVillage').fill('Motihari');
    await page.locator('#register-ageConfirm').check();
    await page.locator('#register-consentPhone').check();
    await section.getByRole('button', { name: 'Submit' }).click();
    await expect.poll(() => sent.length).toBe(1);
    expect(sent[0].loan_product).toBe(id);
    expect(sent[0].subject).toBe(`Registration: ${loanMessages.products[id].name}`);
  });
}
