import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Phase 2 acceptance: layout chrome. Run with `pnpm build && pnpm exec playwright test`. */

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 360, height: 740 };
const PAGES = ['/en/', '/hi/', '/en/dev/layout/', '/hi/dev/layout/', '/en/dev/motion/', '/hi/dev/motion/'];

/** Tab until `predicate` holds for the focused element; fail after `max` presses. */
async function tabTo(page: Page, predicate: string, max = 60) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(predicate)) return;
  }
  throw new Error(`Never focused: ${predicate}`);
}

/** Wait until window.scrollY stops changing (smooth scroll has finished). */
async function settleScroll(page: Page) {
  let last = -1;
  for (let i = 0; i < 50; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y === last) return;
    last = y;
    await page.waitForTimeout(100);
  }
}

/** Scroll through the page so every scroll-triggered reveal has finished. */
async function revealAll(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
}

test.describe('desktop header', () => {
  test.use({ viewport: DESKTOP });

  test('mega menus work with the keyboard only', async ({ page }) => {
    await page.goto('/en/dev/layout/');
    const about = page.locator('button[aria-controls="mega-about"]');
    const loans = page.locator('button[aria-controls="mega-loans"]');

    await tabTo(page, `document.activeElement?.getAttribute('aria-controls') === 'mega-about'`);
    await expect(about).toHaveAttribute('aria-expanded', 'false');

    await page.keyboard.press('Enter');
    await expect(about).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mega-about')).toBeVisible();

    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('#mega-about'))).toBe(true);

    await page.keyboard.press('Escape');
    await expect(about).toHaveAttribute('aria-expanded', 'false');
    await expect(about).toBeFocused();
    await expect(page.locator('#mega-about')).toBeHidden();

    // Closed panel links are skipped: the next Tab goes straight to the Loans trigger.
    await page.keyboard.press('Tab');
    await expect(loans).toBeFocused();
    await page.keyboard.press('Space');
    await expect(loans).toHaveAttribute('aria-expanded', 'true');

    // Tabbing through and out of the panel closes it.
    await tabTo(page, `!document.activeElement?.closest('#mega-loans') && document.activeElement?.getAttribute('aria-controls') !== 'mega-loans'`);
    await expect(loans).toHaveAttribute('aria-expanded', 'false');
  });

  test('mega menu opens on hover and closes on leave', async ({ page }) => {
    await page.goto('/en/dev/layout/');
    await page.locator('button[aria-controls="mega-loans"]').hover();
    await expect(page.locator('#mega-loans')).toBeVisible();
    await page.mouse.move(700, 850);
    await expect(page.locator('#mega-loans')).toBeHidden();
  });

  test('header shrinks, hides on scroll down and returns on scroll up', async ({ page }) => {
    await page.goto('/en/dev/layout/');
    const header = page.locator('header.site-header');
    await expect(header).toHaveAttribute('data-scrolled', 'false');
    await page.mouse.wheel(0, 1200);
    await expect(header).toHaveAttribute('data-hidden', 'true');
    await expect(header).toHaveAttribute('data-scrolled', 'true');
    // Lenis eases toward its target; wait until scrolling has settled before reversing,
    // otherwise the "up" wheel only shortens a scroll that is still moving down.
    await settleScroll(page);
    await page.mouse.wheel(0, -300);
    await expect(header).toHaveAttribute('data-hidden', 'false');
  });

  test('language switch keeps the current path', async ({ page }) => {
    await page.goto('/en/dev/layout/');
    await expect(page.locator('a[hreflang="hi"]').first()).toHaveAttribute('href', '/hi/dev/layout/');
  });
});

test.describe('mobile', () => {
  test.use({ viewport: MOBILE, hasTouch: true, isMobile: true });

  test('menu sheet traps focus and closes with Escape', async ({ page }) => {
    await page.goto('/en/dev/layout/');
    const trigger = page.locator('button[aria-haspopup="dialog"]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.locator('dialog[open]');
    await expect(dialog).toBeVisible();

    for (const key of ['Tab', 'Shift+Tab']) {
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press(key);
        expect(await page.evaluate(() => !!document.activeElement?.closest('dialog[open]')), `${key} #${i} left the sheet`).toBe(true);
      }
    }

    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('action bar offers Register and Call', async ({ page }) => {
    await page.goto('/en/dev/layout/');
    const bar = page.getByRole('navigation', { name: 'Quick actions' });
    await expect(bar.getByRole('link', { name: /Register/ })).toBeVisible();
    await expect(bar.locator('a[href^="tel:"]')).toBeVisible();
  });
});

test('footer copyright year comes from the build date', async ({ page }) => {
  await page.goto('/en/dev/layout/');
  await expect(page.locator('footer')).toContainText(`Copyright © ${new Date().getFullYear()} Shree Shyam Small Growth Foundation.`);
});

test('unknown URLs get the branded 404 page', async ({ page }) => {
  const res = await page.goto('/en/no-such-page/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText("We couldn't find this page");
  await expect(page.locator('header.site-header')).toBeVisible();
});

for (const viewport of [DESKTOP, MOBILE]) {
  for (const path of [...PAGES, '/en/no-such-page/']) {
    test(`${path} at ${viewport.width}px: one h1, no serious axe issues`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(path);
      await revealAll(page);
      await expect(page.locator('h1')).toHaveCount(1);
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
    });
  }
}
