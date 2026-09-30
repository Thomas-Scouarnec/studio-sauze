import { defineConfig, devices } from '@playwright/test';

// Browser tests against the production build, served like GitHub Pages
// (scripts/serve-dist.mjs). Unit tests stay in Vitest: `npm test`.
const port = 4300;
const inCi = !!process.env['CI'];

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: inCi,
  retries: inCi ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${port}`,
    // The site honours reduced motion: jumps are instant, so tests don't wait on smooth scrolling.
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // The widths every Bolt has been checked at.
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'phone',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: devices['Pixel 7'].userAgent,
      },
    },
  ],
  webServer: {
    command: 'npm run build && node scripts/finish-static-build.mjs && node scripts/serve-dist.mjs',
    url: `http://localhost:${port}/`,
    // Locally, a server left running is reused and the build skipped.
    reuseExistingServer: !inCi,
    timeout: 5 * 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
