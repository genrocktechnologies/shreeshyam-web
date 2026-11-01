import { expect, test } from '@playwright/test';

/**
 * CR-01 acceptance: old URLs redirect. Runs against scripts/serve-static.mjs, which applies
 * the vercel.json redirects, so this checks the real rules (verify again on the Vercel
 * preview before switching DNS: docs/redirect-map.md).
 */
const PERMANENT: [string, string][] = [
  ['/index.php', '/en/'],
  ['/about-us.php', '/en/about/'],
  ['/our-mission.php', '/en/about/vision-mission/#mission'],
  ['/our-vision.php', '/en/about/vision-mission/#vision'],
  ['/team.php', '/en/about/team/'],
  ['/milestone.php', '/en/about/milestones/'],
  ['/registration-process.php', '/en/membership/'],
  ['/registration.php', '/en/membership/'],
  ['/women-empowerment-loan.php', '/en/loans/women-empowerment/'],
  ['/livestock-loan.php', '/en/loans/livestock/'],
  // Retired by CR-01, both locales, with and without the trailing slash.
  ['/en/about/mission/', '/en/about/vision-mission/#mission'],
  ['/hi/about/mission', '/hi/about/vision-mission/#mission'],
  ['/en/about/vision/', '/en/about/vision-mission/#vision'],
  ['/hi/about/vision/', '/hi/about/vision-mission/#vision'],
  ['/en/how-to-join/', '/en/membership/'],
  ['/hi/how-to-join', '/hi/membership/'],
  ['/en/register/', '/en/membership/#register'],
  ['/hi/register/', '/hi/membership/#register'],
];

for (const [from, to] of PERMANENT) {
  test(`${from} → 301 ${to}`, async ({ request }) => {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers().location).toBe(to);
  });
}

test('every redirect target exists', async ({ request }) => {
  for (const to of new Set(PERMANENT.map(([, t]) => t.split('#')[0]))) {
    expect((await request.get(to)).status(), to).toBe(200);
  }
});

test('the anchors exist on the merged pages', async ({ page }) => {
  await page.goto('/en/about/vision-mission/');
  await expect(page.locator('#vision')).toHaveCount(1);
  await expect(page.locator('#mission')).toHaveCount(1);
  await page.goto('/en/membership/');
  await expect(page.locator('#register')).toHaveCount(1);
});

test('root sends Hindi browsers to /hi/ and others to /en/', async ({ request }) => {
  expect((await request.get('/', { maxRedirects: 0, headers: { 'accept-language': 'hi-IN,hi;q=0.9' } })).headers().location).toBe('/hi/');
  expect((await request.get('/', { maxRedirects: 0, headers: { 'accept-language': 'en-IN' } })).headers().location).toBe('/en/');
});
