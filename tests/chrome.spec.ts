import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Phase 2 acceptance: layout chrome. Run with `pnpm build && pnpm exec playwright test`. */

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 360, height: 740 };
const PAGES = ['/en/', '/hi/', '/en/loans/', '/hi/loans/', '/en/loans/livestock/', '/hi/loans/women-empowerment/', '/en/about/', '/hi/about/', '/en/about/vision-mission/', '/hi/about/vision-mission/', '/en/membership/', '/hi/membership/', '/en/about/team/', '/hi/about/team/', '/en/about/milestones/', '/hi/about/milestones/', '/en/about/gallery/', '/hi/about/gallery/', '/en/dev/layout/', '/hi/dev/layout/', '/en/dev/motion/', '/hi/dev/motion/'];

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

  test('Loan Products dropdown works with the keyboard only', async ({ page }) => {
    await page.goto('/en/dev/layout/');
    const loans = page.locator('button[aria-controls="mega-loans"]');

    await tabTo(page, `document.activeElement?.getAttribute('aria-controls') === 'mega-loans'`);
    await expect(loans).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Enter');
    await expect(loans).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mega-loans')).toBeVisible();

    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('#mega-loans'))).toBe(true);

    await page.keyboard.press('Escape');
    await expect(loans).toHaveAttribute('aria-expanded', 'false');
    await expect(loans).toBeFocused();
    await expect(page.locator('#mega-loans')).toBeHidden();

    // Closed panel links are skipped: the next Tab goes to the next nav item.
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('href', '/en/membership/');

    // Tabbing through and out of an open panel closes it.
    await loans.focus();
    await page.keyboard.press('Space');
    await expect(loans).toHaveAttribute('aria-expanded', 'true');
    await tabTo(page, `!document.activeElement?.closest('#mega-loans') && document.activeElement?.getAttribute('aria-controls') !== 'mega-loans'`);
    await expect(loans).toHaveAttribute('aria-expanded', 'false');
  });

  test('CR-01 nav: items in order, active pill, no desktop Register, Gallery hidden', async ({ page }) => {
    await page.goto('/en/about/team/');
    const nav = page.getByRole('navigation', { name: 'Main navigation' }).first();
    const items = await nav.locator(':scope > ul > li').evaluateAll((lis) => lis.map((li) => li.firstElementChild?.textContent?.trim()));
    expect(items).toEqual(['Home', 'About Us', 'Vision & Mission', 'Loan Products', 'Membership', 'Contact Us']);
    // About Us is the active pill on its sub-pages, but not on Vision & Mission.
    await expect(nav.locator('a[aria-current="page"]')).toHaveText('About Us');
    await page.goto('/en/about/vision-mission/');
    await expect(nav.locator('a[aria-current="page"]')).toHaveText('Vision & Mission');
    await page.goto('/en/loans/livestock/');
    await expect(nav.locator('button[aria-controls="mega-loans"]')).toHaveClass(/bg-rani-500/);
    await expect(page.locator('header a[href$="/register/"], header a[href$="#register"]:visible')).toHaveCount(0);
    await expect(page.locator('header a[href*="gallery"]')).toHaveCount(0);
  });

  test('top bar: email, phone and address (Maps)', async ({ page }) => {
    await page.goto('/en/');
    const bar = page.locator('header .bg-rani-500').first();
    await expect(bar.locator('a[href^="mailto:"]')).toBeVisible();
    await expect(bar.locator('a[href="tel:+918750971329"]')).toHaveText('+91 87509 71329');
    await expect(bar.locator('a[href^="https://maps.app.goo.gl/"]')).toBeVisible();
  });

  test('the nav never wraps: one row from 1280px, the hamburger below', async ({ page }) => {
    for (const width of [1280, 1366, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/en/');
      const nav = page.getByRole('navigation', { name: 'Main navigation' }).first();
      await expect(nav).toBeVisible();
      const tops = await nav.locator(':scope > ul > li').evaluateAll((lis) => new Set(lis.map((li) => Math.round(li.getBoundingClientRect().top))).size);
      expect(tops, `${width}px`).toBe(1);
      const overlap = await page.evaluate(() => {
        const logo = document.getElementById('site-logo')!.getBoundingClientRect();
        const nav = document.querySelector('header nav')!.getBoundingClientRect();
        return logo.right > nav.left;
      });
      expect(overlap, `logo overlaps nav at ${width}px`).toBe(false);
    }
    await page.setViewportSize({ width: 1279, height: 900 });
    await page.goto('/en/');
    await expect(page.locator('button[aria-haspopup="dialog"]')).toBeVisible();
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
    await expect(bar.getByRole('link', { name: /Register/ })).toHaveAttribute('href', '/en/membership/#register');
    await expect(bar.locator('a[href^="tel:"]')).toBeVisible();
  });
});

test('footer: copyright year from the build date, quick links, no Terms link yet', async ({ page }) => {
  await page.goto('/en/dev/layout/');
  const footer = page.locator('footer');
  await expect(footer).toContainText(`© ${new Date().getFullYear()} Shree Shyam Small Growth Foundation. All Rights Reserved.`);
  const links = await footer.getByRole('navigation', { name: 'Footer navigation' }).locator('a').allInnerTexts();
  expect(links.map((l) => l.trim())).toEqual(['About Us', 'Vision & Mission', 'Loan Products', 'Membership', 'Careers', 'Contact Us']);
  await expect(footer.getByText(/Terms/)).toHaveCount(0);
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
