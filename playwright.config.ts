import { defineConfig } from '@playwright/test';

/**
 * Tests run against the static export (pnpm build → out/), served locally, so they
 * check exactly what gets deployed. The dev server is covered by scripts/dev-smoke.ts.
 */
const PORT = 4321;

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `node scripts/serve-static.mjs out ${PORT}`,
    url: `http://localhost:${PORT}/en/dev/layout/`,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
