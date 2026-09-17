import { defineConfig, devices, ReporterDescription } from '@playwright/test';

const reporters: ReporterDescription[] = [
  ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ['list'],
];
if (process.env.CI) {
  reporters.push(['github']);
}

/**
 * Config for the Exclusive Resorts inquiry-form suite.
 * Tests run against the live staging site (there is no local server to
 * boot), so there is no `webServer` block -- baseURL points straight at
 * staging and every test starts from a stubbed /submit-form/ + /validate-email/
 * (see playwright/fixtures/inquiry.fixtures.ts) so no run ever creates a
 * real CRM lead.
 */
export default defineConfig({
  testDir: './playwright/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: reporters,
  use: {
    baseURL: 'https://public-site.stage.exclusiveresorts.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome-375',
      // Used for TC-14 (responsive @ 375px) -- a slightly narrower custom
      // viewport than the stock Pixel 5 profile, matching the assignment's
      // "375px" spec exactly.
      use: { ...devices['Pixel 5'], viewport: { width: 375, height: 812 } },
    },
  ],
});
