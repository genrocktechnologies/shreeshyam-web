import { expect, test, type Page } from '@playwright/test';
import about from '../messages/en/about.json';
import common from '../messages/en/common.json';
import home from '../messages/en/home.json';
import milestones from '../messages/en/milestones.json';
import mission from '../messages/en/mission.json';
import team from '../messages/en/team.json';
import vision from '../messages/en/vision.json';

/** Phase 5 + CR-01 acceptance: the About cluster. Run against the static export. */

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
  // CR-01: About also carries the services and testimonials that left home.
  ['/en/about/', [...strings(about), ...strings(home.services), ...strings(home.testimonials)]],
  ['/en/about/vision-mission/', [...strings(vision), ...strings(mission)]],
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

test.describe('Team tree', () => {
  const tiers = [
    [team.tiers.chairman, ['vikramSinha']],
    [team.tiers.leadership, ['sauravPrakash']],
    [team.tiers.executiveDirectors, ['ranjeetKumar', 'sumitKumar']],
    [team.tiers.headsOfficers, ['satyamPushkar', 'sonuKumar', 'shishirKumar']],
  ] as const;

  test('nested lists by tier, tier headings, crawled order within tiers, no unconfirmed members', async ({ page }) => {
    await page.goto('/en/about/team/');
    const headings = await page.locator('main li > h2').allInnerTexts();
    expect(headings.map((h) => h.trim())).toEqual(tiers.map(([label]) => label));
    // Each tier is nested inside the previous one: the HTML is the text version of the chart.
    for (let i = 1; i < tiers.length; i++) {
      const depth = await page.getByRole('heading', { level: 2, name: tiers[i][0] }).evaluate((h) => {
        let n = 0;
        for (let el = h.parentElement; el; el = el.parentElement) if (el.tagName === 'UL') n++;
        return n;
      });
      expect(depth).toBe(i + 1);
    }
    for (const [label, ids] of tiers) {
      const tier = page.locator('main li', { has: page.getByRole('heading', { level: 2, name: label }) }).last();
      const names = await tier.locator(':scope > [data-tier-cards] h3').allInnerTexts();
      expect(names.map((n) => n.trim())).toEqual(ids.map((id) => team.members[id].name));
    }
    await expect(page.locator('main')).not.toContainText('Pravin');
  });

  test('circular colour portraits; Chairman and MD/CEO larger; LinkedIn placeholders', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en/about/team/');
    const photo = (name: string) => page.locator('[data-tree-card]', { has: page.getByRole('heading', { name }) }).locator('[data-photo-frame="circle"]');
    const regular = (await photo(team.members.satyamPushkar.name).boundingBox())!.width;
    expect(regular).toBe(112);
    expect((await photo(team.members.vikramSinha.name).boundingBox())!.width).toBeGreaterThan(regular);
    expect((await photo(team.members.sauravPrakash.name).boundingBox())!.width).toBeGreaterThan(regular);
    // No grayscale overlay any more: colour portraits.
    await expect(page.locator('main .backdrop-grayscale')).toHaveCount(0);

    const links = page.locator('main a[href="https://www.linkedin.com/"]');
    await expect(links).toHaveCount(7);
    await expect(links.first()).toHaveAttribute('target', '_blank');
    await expect(links.first()).toHaveAttribute('aria-label', `${team.members.vikramSinha.name} on LinkedIn (opens in a new tab)`);
  });

  test('desktop: connectors are drawn tier to tier (3 gaps), hidden from assistive tech', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en/about/team/');
    const svg = page.locator('svg[data-tree-lines]');
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
    await expect(svg.locator('path')).toHaveCount(3);
    await svg.scrollIntoViewIfNeeded();
    await expect(svg).toHaveCSS('opacity', '1');
  });

  test('phones: a vertical tree with no horizontal scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/en/about/team/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
    await expect(page.locator('svg[data-tree-lines]')).toBeHidden();
    const lefts = await page.locator('[data-tree-card]').evaluateAll((cs) => new Set(cs.map((c) => Math.round(c.getBoundingClientRect().left))).size);
    expect(lefts).toBe(1);
  });
});

test('Vision & Mission: Vision first, then Mission, each with its pull-quote', async ({ page }) => {
  await page.goto('/en/about/vision-mission/');
  const quotes = page.locator('main figure blockquote');
  await expect(quotes).toHaveCount(2);
  await expect(quotes.nth(0)).toContainText(vision.statement);
  await expect(quotes.nth(1)).toContainText(mission.intro);
  await expect(page.locator('#vision h2')).toHaveText(vision.title);
  await expect(page.locator('#mission h2')).toHaveText(mission.title);
});

test('About links to the Team page and the merged Vision & Mission page', async ({ page }) => {
  await page.goto('/en/about/');
  await expect(page.locator('main a[href="/en/about/team/"]').first()).toBeVisible();
  await expect(page.locator('main a[href="/en/about/vision-mission/#mission"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/en/about/vision-mission/#vision"]')).toHaveCount(1);
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

test('About testimonials (moved from home): next/previous move the active dot; pause on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en/about/');
  const deck = page.locator('#testimonials');
  await deck.scrollIntoViewIfNeeded();
  const dots = deck.locator('button[aria-label^="Go to item"]');
  await deck.getByRole('button', { name: 'Pause automatic slides' }).click();
  await deck.getByRole('button', { name: 'Go to item 1' }).click();
  await expect(dots.first()).toHaveAttribute('aria-current', 'true');
  await deck.getByRole('button', { name: 'Next' }).click();
  await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
});
