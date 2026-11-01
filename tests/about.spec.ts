import { expect, test, type Page } from '@playwright/test';
import about from '../messages/en/about.json';
import common from '../messages/en/common.json';
import milestones from '../messages/en/milestones.json';
import mission from '../messages/en/mission.json';
import team from '../messages/en/team.json';
import vision from '../messages/en/vision.json';

/** Phase 5 acceptance: the About cluster. Run against the static export. */

// Strips the <b> tags of rich messages, and the " – " between a core value's term and
// its description (the page shows them as a separate term and description).
const norm = (s: string) =>
  s
    .replace(/<\/?[a-z]+>/g, '')
    .replace(/ – /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/** All string leaves of a messages object, minus the <title> metadata. */
function strings(obj: unknown, skip: string[] = ['meta']): string[] {
  const out: string[] = [];
  const walk = (v: unknown, key = '') => {
    if (skip.includes(key)) return;
    if (typeof v === 'string') out.push(v);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k);
  };
  walk(obj);
  return out;
}

async function mainText(page: Page) {
  return norm(await page.locator('main').innerText());
}

const CONTENT: [string, string[]][] = [
  ['/en/about/', strings(about)],
  ['/en/about/mission/', strings(mission)],
  ['/en/about/vision/', strings(vision)],
  ['/en/about/milestones/', strings(milestones)],
  ['/en/about/team/', strings(team, ['heading'])],
];

for (const [path, texts] of CONTENT) {
  test(`${path} renders every crawled string`, async ({ page }) => {
    await page.goto(path);
    const text = await mainText(page);
    for (const s of texts) expect(text, s).toContain(norm(s));
  });
}

test('About hero uses its own crop, not the home hero photo', async ({ page }) => {
  await page.goto('/en/about/');
  const hero = page.locator('main section').first();
  await expect(hero.locator('img[src*="about-hero-arch"]')).toHaveCount(1);
  await expect(page.locator('main img[src*="/images/hero-arch"]')).toHaveCount(0);
});

test('Team: 7 members in crawled order, featured pair larger, no unconfirmed members', async ({ page }) => {
  await page.goto('/en/about/team/');
  const names = await page.locator('main h3').allInnerTexts();
  expect(names.map((n) => n.trim())).toEqual(Object.values(team.members).map((m) => m.name));
  await expect(page.locator('main')).not.toContainText('Pravin');

  const width = async (name: string) => (await page.locator('main li', { has: page.getByRole('heading', { name }) }).locator('picture').boundingBox())!.width;
  const regular = await width(team.members.satyamPushkar.name);
  expect(await width(team.members.vikramSinha.name)).toBeGreaterThan(regular * 1.2);
  expect(await width(team.members.sauravPrakash.name)).toBeGreaterThan(regular * 1.2);

  // LinkedIn placeholders: one per member, new tab, named for the member.
  const links = page.locator('main a[href="https://www.linkedin.com/"]');
  await expect(links).toHaveCount(7);
  await expect(links.first()).toHaveAttribute('target', '_blank');
  await expect(links.first()).toHaveAttribute('aria-label', `${team.members.satyamPushkar.name} on LinkedIn (opens in a new tab)`);
});

test('Mission and Vision: pull-quote and a link to the sibling page', async ({ page }) => {
  await page.goto('/en/about/mission/');
  await expect(page.locator('main figure blockquote')).toContainText(mission.intro);
  await expect(page.locator('main a[href="/en/about/vision/"]')).toHaveCount(1);
  await page.goto('/en/about/vision/');
  await expect(page.locator('main figure blockquote')).toContainText(vision.statement);
  await expect(page.locator('main a[href="/en/about/mission/"]')).toHaveCount(1);
});

test.describe('Gallery', () => {
  test('is noindex and not linked from navigation', async ({ page }) => {
    await page.goto('/en/about/gallery/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    for (const path of ['/en/', '/en/about/']) {
      await page.goto(path);
      await expect(page.locator('a[href*="/about/gallery"]')).toHaveCount(0);
    }
  });

  test('without JS every tile links to the full-size image', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/en/about/gallery/');
    const hrefs = await page.locator('a[data-gallery-index]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(hrefs.length).toBeGreaterThan(3);
    for (const h of hrefs) expect(h).toMatch(/^\/images\/.+\.webp$/);
    await ctx.close();
  });

  test('lightbox: opens on click, keyboard steps, Esc closes and returns focus', async ({ page }) => {
    await page.goto('/en/about/gallery/');
    const tiles = page.locator('a[data-gallery-index]');
    const total = await tiles.count();
    await tiles.nth(1).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: common.a11y.closeDialog })).toBeFocused();
    await expect(dialog).toContainText(`2 of ${total}`);
    await page.keyboard.press('ArrowRight');
    await expect(dialog).toContainText(`3 of ${total}`);
    // Focus stays inside the dialog.
    for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(tiles.nth(2)).toBeFocused();
  });
});
