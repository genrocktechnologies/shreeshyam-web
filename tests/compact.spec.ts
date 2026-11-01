import { expect, test, type Page } from '@playwright/test';

/**
 * CR-01, section 1: compactness targets (measurable). Heights are measured after scrolling
 * through the page, so every reveal and lazy image has settled. The footer is excluded.
 */

async function settle(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
}

const heightWithoutFooter = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollHeight - (document.querySelector('footer') as HTMLElement).offsetHeight);

for (const locale of ['en', 'hi']) {
  test(`/${locale}/ at 1440×900: ≤ 2.7 viewports, hero + cards within 1.3`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/`);
    await settle(page);
    const h = await heightWithoutFooter(page);
    console.log(`/${locale}/ 1440: ${h}px = ${(h / 900).toFixed(2)} viewports`);
    expect(h).toBeLessThanOrEqual(2.7 * 900);
    const cardsBottom = await page.locator('#hero + section').evaluate((s) => {
      const cards = s.querySelectorAll('article');
      return Math.max(...Array.from(cards).map((c) => c.getBoundingClientRect().bottom + window.scrollY));
    });
    expect(cardsBottom).toBeLessThanOrEqual(1.3 * 900);
  });

  test(`/${locale}/ at 390×844: ≤ 6 viewports; headline and CTA above the fold`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}/`);
    const cta = page.locator('#hero a[href$="/membership/"]');
    expect((await page.locator('h1').boundingBox())!.y + (await page.locator('h1').boundingBox())!.height).toBeLessThanOrEqual(844);
    expect((await cta.boundingBox())!.y + (await cta.boundingBox())!.height).toBeLessThanOrEqual(844);
    await settle(page);
    const h = await heightWithoutFooter(page);
    console.log(`/${locale}/ 390: ${h}px = ${(h / 844).toFixed(2)} viewports`);
    expect(h).toBeLessThanOrEqual(6 * 844);
  });
}

const INNER = ['/en/about/', '/en/about/vision-mission/', '/en/about/team/', '/en/about/milestones/', '/en/membership/', '/en/loans/', '/en/loans/micro-business/', '/hi/about/', '/hi/membership/', '/en/contact/', '/en/careers/', '/en/hr-policy/', '/en/privacy-policy/'];

for (const path of INNER) {
  test(`${path}: page hero ≤ 420px (desktop, below the header) and ≤ 60vh (phones)`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    const header = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--utility-h')) + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')));
    const desktop = (await page.locator('main > section').first().boundingBox())!.height - header;
    expect(desktop).toBeLessThanOrEqual(420);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    const phone = (await page.locator('main > section').first().boundingBox())!.height;
    expect(phone).toBeLessThanOrEqual(0.6 * 844);
  });
}

test('no photo is taller than ~70% of the viewport', async ({ page }) => {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const path of ['/en/', '/en/about/', '/en/about/milestones/', '/en/about/team/']) {
      await page.goto(path);
      const tallest = await page.locator('main [data-photo-frame]').evaluateAll((els) => Math.max(0, ...els.map((e) => e.getBoundingClientRect().height)));
      expect(tallest, `${path} at ${w}`).toBeLessThanOrEqual(0.7 * h + 1);
    }
  }
});

test('no pinned or horizontally pinned sections anywhere', async ({ page }) => {
  for (const path of ['/en/', '/en/about/', '/en/membership/', '/en/loans/']) {
    await page.goto(path);
    await expect(page.locator('.pin-spacer, [data-pinned]')).toHaveCount(0);
  }
});

test('slim CTA band on inner pages: ≤ 220px on desktop, absent on home', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en/about/team/');
  const band = page.locator('main > section').last();
  expect((await band.boundingBox())!.height).toBeLessThanOrEqual(220);
  await page.goto('/en/');
  await expect(page.locator('main a[href="/en/contact/"]')).toHaveCount(0);
});

test('footer: ≤ 260px on desktop, ≤ 520px on phones', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en/');
  expect((await page.locator('footer').boundingBox())!.height).toBeLessThanOrEqual(260);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  expect((await page.locator('footer').boundingBox())!.height).toBeLessThanOrEqual(520);
});
