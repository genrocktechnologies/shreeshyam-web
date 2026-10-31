import { expect, test } from '@playwright/test';

/** Phase 3 acceptance: home page sections 4–11. Run against the static export. */

const SECTIONS = ['#services', '#loans', '#process', '#milestone', '#testimonials', '#team', '#faq', '#final-cta'];

test('every section is server-rendered and readable without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('/en/');
  for (const id of SECTIONS) await expect(page.locator(id)).toBeVisible();
  // No JS: every FAQ answer is open, and the loan cards stay a plain grid.
  await expect(page.locator('#faq [role="region"][inert]')).toHaveCount(0);
  await expect(page.locator('#loans')).not.toHaveAttribute('data-pinned', '');
  await expect(page.locator('#faq').getByText('Individuals above 18 years of age')).toBeVisible();
  await ctx.close();
});

test('FAQ accordion: first answer open, others inert, buttons toggle', async ({ page }) => {
  await page.goto('/en/');
  const buttons = page.locator('#faq h3 > button');
  await expect(buttons).toHaveCount(6);
  await expect(buttons.first()).toHaveAttribute('aria-expanded', 'true');
  await expect(buttons.nth(1)).toHaveAttribute('aria-expanded', 'false');
  const second = page.locator(`[id="${await buttons.nth(1).getAttribute('aria-controls')}"]`);
  await expect(second).toHaveAttribute('inert', '');
  await buttons.nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(buttons.nth(1)).toHaveAttribute('aria-expanded', 'true');
  await expect(second).not.toHaveAttribute('inert', '');
});

test('FAQPage JSON-LD lists all six questions', async ({ page }) => {
  await page.goto('/en/');
  const json = JSON.parse((await page.locator('#faq script[type="application/ld+json"]').textContent()) ?? '{}');
  expect(json['@type']).toBe('FAQPage');
  expect(json.mainEntity).toHaveLength(6);
});

test('testimonial deck: next/previous move the active dot; pause button on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en/');
  const deck = page.locator('#testimonials');
  await deck.scrollIntoViewIfNeeded();
  const dots = deck.locator('button[aria-label^="Go to item"]');
  await deck.getByRole('button', { name: 'Pause automatic slides' }).click();
  await deck.getByRole('button', { name: 'Go to item 1' }).click();
  await expect(dots.first()).toHaveAttribute('aria-current', 'true');
  await deck.getByRole('button', { name: 'Next' }).click();
  await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
  await expect(deck.getByRole('button', { name: 'Play automatic slides' })).toBeVisible();
});

test('loan cards link to their product pages with distinct names', async ({ page }) => {
  await page.goto('/en/');
  const links = page.locator('#loans article a');
  await expect(links).toHaveCount(4);
  const names = await links.evaluateAll((as) => as.map((a) => a.textContent?.replace(/\s+/g, ' ').trim()));
  expect(new Set(names).size).toBe(4);
  await expect(links.first()).toHaveAttribute('href', '/en/loans/women-empowerment/');
});
