import { expect, test } from '@playwright/test';
import common from '../messages/en/common.json';
import contact from '../messages/en/contact.json';
import careers from '../messages/en/careers.json';
import hrPolicy from '../messages/en/hrPolicy.json';
import privacy from '../messages/en/privacy.json';

/** Phase 6 acceptance: Contact, Careers, HR Policy and Privacy pages. */

const strings = (obj: unknown, skip = ['meta']): string[] => {
  const out: string[] = [];
  const walk = (v: unknown, key = '') => {
    if (skip.includes(key)) return;
    if (typeof v === 'string') out.push(v.replace(/<\/?b>/g, ''));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k);
  };
  walk(obj);
  return out;
};

for (const [path, texts] of [
  ['/en/contact/', strings(contact)],
  ['/en/careers/', strings(careers, ['meta', 'title'])],
  ['/en/hr-policy/', strings(hrPolicy)],
  ['/en/privacy-policy/', strings(privacy)],
] as const) {
  test(`${path} renders every crawled string`, async ({ page }) => {
    await page.goto(path);
    const text = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
    for (const s of texts) expect(text, s).toContain(s.replace(/\s+/g, ' '));
  });
}

test.describe('Contact', () => {
  test('details card with the confirmed phone, email, office time and the Maps link', async ({ page }) => {
    await page.goto('/en/contact/');
    const main = page.locator('main');
    await expect(main.locator('a[href="tel:+919229088829"]')).toHaveText('+91 92290 88829');
    await expect(main.locator('a[href="mailto:shreeshyamfoundation2026@gmail.com"]').first()).toBeVisible();
    await expect(main).toContainText(common.contact.hours);
    await expect(main.locator('a[href="https://maps.app.goo.gl/CE8evf9puHXMrTCe7"]').first()).toBeVisible();
  });

  test('the map makes no Google request until "Show map" is clicked', async ({ page }) => {
    const google: string[] = [];
    page.on('request', (r) => {
      if (/google\.|gstatic\.|googleapis\./.test(new URL(r.url()).hostname)) google.push(r.url());
    });
    await page.goto('/en/contact/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    expect(google).toEqual([]);
    await expect(page.locator('main')).toContainText(common.contact.mapPinName);
    await expect(page.locator('main iframe')).toHaveCount(0);
    // Don't hit Google from the test either: answer the embed request locally.
    await page.route(/google\.com\/maps\/embed/, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>map</p>' }));
    await page.getByRole('button', { name: common.buttons.showMap }).click();
    const frame = page.locator('main iframe');
    await expect(frame).toHaveAttribute('title', common.a11y.mapTitle);
    await expect(frame).toHaveAttribute('src', /Motihari%20Chini%20Mill/);
  });
});

test.describe('Careers', () => {
  test('CVs by email (mailto), no upload field, a link to the HR Policy', async ({ page }) => {
    await page.goto('/en/careers/');
    const main = page.locator('main');
    await expect(main.locator('a[href="mailto:shreeshyamfoundation2026@gmail.com"]')).toBeVisible();
    await expect(main).toContainText(common.form.careersCv.replace('{email}', 'shreeshyamfoundation2026@gmail.com'));
    await expect(main.locator('input[type="file"]')).toHaveCount(0);
    await expect(main.locator('a[href="/en/hr-policy/"]')).toBeVisible();
  });
});

for (const [path, count] of [['/en/hr-policy/', Object.keys(hrPolicy.sections).length], ['/en/privacy-policy/', Object.keys(privacy.sections).length]] as const) {
  test.describe(`long form ${path}`, () => {
    test('desktop: sticky contents for every section, active item follows the reading, progress bar', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      const toc = page.getByRole('navigation', { name: common.a11y.onThisPage });
      const links = toc.locator('a');
      await expect(links).toHaveCount(count);
      for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')!))) await expect(page.locator(href)).toHaveCount(1);
      await expect(links.first()).toHaveAttribute('aria-current', 'location');
      // Mid-page: the contents stay in view (sticky) and mark the section being read.
      const middle = links.nth(Math.floor(count / 2));
      await page.evaluate((id) => document.querySelector(id)!.scrollIntoView(), (await middle.getAttribute('href'))!);
      await expect(middle).toHaveAttribute('aria-current', 'location');
      expect((await toc.boundingBox())!.y).toBeGreaterThanOrEqual(0);
      // At the very bottom, the last section is marked.
      const last = links.last();
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect(last).toHaveAttribute('aria-current', 'location');
      const progress = page.getByRole('progressbar', { name: common.a11y.readingProgress });
      await expect(progress).toHaveAttribute('aria-valuenow', /^(9\d|100)$/);
    });

    test('phones: the contents fold into a details element; no horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(path);
      const details = page.locator('main details');
      await expect(details).toBeVisible();
      await details.locator('summary').click();
      await expect(details.locator('a')).toHaveCount(count);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
    });
  });
}
