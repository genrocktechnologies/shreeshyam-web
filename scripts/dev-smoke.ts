/**
 * Dev-server smoke check: every route under src/app/[locale], in every locale, must
 * load in `pnpm dev` with HTTP 200, no Next.js error overlay and no runtime errors.
 * (`pnpm build` alone misses dev-only failures, e.g. a page without
 * generateStaticParams under `output: 'export'`.)
 *
 *   pnpm dev                                  # in another terminal
 *   pnpm exec tsx scripts/dev-smoke.ts        # DEV_URL defaults to http://localhost:3000
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { routing } from '../src/i18n/routing';

const ROOT = path.resolve(__dirname, '..');
const APP = path.join(ROOT, 'src', 'app', '[locale]');
const BASE = (process.env.DEV_URL ?? 'http://localhost:3000').replace(/\/$/, '');

/** Routes from page.tsx files under [locale]; route groups "(x)" don't add a segment. */
function discoverRoutes(): { routes: string[]; dynamic: string[] } {
  const routes: string[] = [];
  const dynamic: string[] = [];
  const walk = (dir: string, segments: string[]) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const seg = entry.name;
        walk(path.join(dir, seg), /^\(.*\)$/.test(seg) ? segments : [...segments, seg]);
      } else if (entry.name === 'page.tsx') {
        const route = `/${segments.join('/')}${segments.length ? '/' : ''}`;
        (segments.some((s) => s.startsWith('[')) ? dynamic : routes).push(route);
      }
    }
  };
  walk(APP, []);
  return { routes: routes.sort(), dynamic };
}

async function main() {
  const { routes, dynamic } = discoverRoutes();
  if (dynamic.length) {
    // Extend this script with their params when such routes are added.
    console.error(`Dynamic routes need explicit params in dev-smoke.ts: ${dynamic.join(', ')}`);
    process.exit(1);
  }

  const browser = await chromium.launch();
  const failures: string[] = [];

  for (const locale of routing.locales) {
    for (const route of routes) {
      const url = `${BASE}/${locale}${route}`;
      const page = await browser.newPage();
      const errors: string[] = [];
      // First line only: React warnings carry long component stacks.
      const firstLine = (s: string) => s.split('\n')[0];
      page.on('pageerror', (e) => errors.push(`pageerror: ${firstLine(e.message)}`));
      page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${firstLine(m.text())}`));

      // The first request to a route compiles it, which can take a while.
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 180_000 }).catch((e: Error) => {
        errors.push(`navigation: ${e.message.split('\n')[0]}`);
        return null;
      });
      await page.waitForTimeout(1500);

      const status = res?.status() ?? 0;
      // Next 14 renders its error overlay / error toast inside <nextjs-portal> (shadow DOM).
      const overlay = await page.evaluate(() => {
        const portal = document.querySelector('nextjs-portal');
        const root = portal?.shadowRoot;
        if (!root) return null;
        const dialog = root.querySelector('[data-nextjs-dialog], [data-nextjs-toast]');
        return dialog ? (dialog.textContent ?? '').replace(/\s+/g, ' ').slice(0, 200) : null;
      });
      const html = await page.content();
      if (/missing exported function|Unhandled Runtime Error|Server Error/.test(html) && !overlay) errors.push('error text in page HTML');

      const ok = status === 200 && !overlay && errors.length === 0;
      console.log(`${ok ? '✓' : '✗'} ${status} ${url}${overlay ? `  overlay: ${overlay}` : ''}`);
      for (const e of errors) console.log(`    ${e}`);
      if (!ok) failures.push(url);
      await page.close();
    }
  }

  await browser.close();
  console.log(failures.length ? `\n${failures.length} route(s) failed.` : `\nAll ${routes.length * routing.locales.length} route(s) OK.`);
  if (failures.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
