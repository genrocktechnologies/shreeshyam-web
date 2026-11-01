import { expect, test } from '@playwright/test';
import about from '../messages/en/about.json';
import common from '../messages/en/common.json';
import home from '../messages/en/home.json';

/** CR-01 acceptance: the compact home page. Run against the static export. */

const SECTIONS = ['#hero', '#about', '#impact', '#loans'];
const plain = (s: string) => s.replace(/<\/?[a-z]+>/g, '');

test('every section is server-rendered and readable without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('/en/');
  for (const id of SECTIONS) await expect(page.locator(id)).toBeVisible();
  await expect(page.locator('h1')).toContainText(home.compact.heroTitle);
  await expect(page.locator('#impact')).toContainText('1200+');
  await ctx.close();
});

test('hero: script line + h1, intro, Join Us → Membership, Explore Loans', async ({ page }) => {
  await page.goto('/en/');
  const h1 = page.locator('h1');
  await expect(h1).toContainText(home.compact.heroScript);
  await expect(h1).toContainText(home.compact.heroTitle);
  await expect(page.locator('#hero')).toContainText(home.compact.heroIntro);
  await expect(page.locator('#hero').getByRole('link', { name: common.buttons.joinUs })).toHaveAttribute('href', '/en/membership/');
  await expect(page.locator('#hero').getByRole('link', { name: common.buttons.exploreLoans })).toHaveAttribute('href', '/en/loans/');
  // The real members photo in the curved panel (never a reference/stock photo).
  await expect(page.locator('#hero [data-photo-frame="panel"] img[src*="/images/hero-panel"]')).toHaveCount(1);
});

test('feature cards: proposed titles, live-site descriptions, one link each', async ({ page }) => {
  await page.goto('/en/');
  const cards = [
    [home.compact.cards.womenEmpowerment, home.services.items.womenEmpowerment.text, '/en/loans/women-empowerment/'],
    [home.compact.cards.financialInclusion, home.services.items.financialInclusion.text, '/en/loans/'],
    [home.compact.cards.communityGrowth, home.services.items.communityWelfare.text, '/en/about/'],
  ];
  for (const [title, text, href] of cards) {
    const card = page.locator('article', { has: page.getByRole('heading', { name: title, exact: true }) });
    await expect(card).toContainText(text);
    await expect(card.getByRole('link')).toHaveAttribute('href', href);
  }
});

test('About band: the FIRST foundation paragraph only, and Know More', async ({ page }) => {
  await page.goto('/en/');
  const section = page.locator('#about');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(common.siteName);
  await expect(section).toContainText(plain(about.foundation.body1));
  await expect(section).not.toContainText(about.foundation.body2);
  await expect(section.getByRole('link', { name: common.buttons.knowMore })).toHaveAttribute('href', '/en/about/');
});

test('impact band shows the live-site stats and never the reference figures', async ({ page }) => {
  await page.goto('/en/');
  const band = page.locator('#impact');
  for (const s of Object.values(home.stats)) {
    await expect(band).toContainText(s.value);
    await expect(band).toContainText(s.label);
  }
  await expect(band).toContainText(home.compact.impactSlogan);
  for (const invented of [/(^|[^\d])500\+/, /(^|[^\d])300\+/, /(^|[^\d])200\+/, /50 Lakh/, /Happy Families/, /Loan Disbursed/, /Community Projects/]) {
    await expect(page.locator('body')).not.toContainText(invented);
  }
});

test('loan strip: 4 products with their pages and published amounts, in one row on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en/');
  const links = page.locator('#loans article a');
  await expect(links).toHaveCount(4);
  await expect(links.first()).toHaveAttribute('href', '/en/loans/women-empowerment/');
  const tops = await page.locator('#loans article').evaluateAll((as) => new Set(as.map((a) => Math.round(a.getBoundingClientRect().top))).size);
  expect(tops).toBe(1);
});

test('loan strip is a horizontal snap row on phones, without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  const row = page.locator('#loans ul').first();
  expect(await row.evaluate((el) => getComputedStyle(el).scrollSnapType)).toContain('x');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('no old home sections, pins, magnetic buttons or golden thread on home', async ({ page }) => {
  await page.goto('/en/');
  for (const id of ['#services', '#process', '#milestone', '#testimonials', '#team', '#faq', '#final-cta']) await expect(page.locator(id)).toHaveCount(0);
  await expect(page.locator('[data-pinned], .pin-spacer, [data-thread], [data-magnetic]')).toHaveCount(0);
});
