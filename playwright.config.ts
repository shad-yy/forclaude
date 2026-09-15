// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

// A-10: testDir covers both tests/ and e2e/ so no spec file is orphaned.
// Was `testDir: './tests'`; the whole e2e/ directory was silently skipped.
// A-10: baseURL is env-driven so local + CI + prod-like runs each pick their
// own target. Default is localhost so an accidental `pnpm playwright test`
// never pings production.
export default defineConfig({
  testDir: '.',
  testMatch: ['tests/**/*.spec.ts', 'tests/**/*.test.ts', 'e2e/**/*.spec.ts'],
  testIgnore: [
    // Vitest specs (kept in tests/) that are not Playwright targets
    'tests/log-hygiene.test.ts',
    'tests/flaky-policy.test.ts',
    'tests/pii-redaction.test.ts',
    'tests/admin-provision-auth.test.ts',
    'tests/hcaptcha-server-verify.test.ts',
    'tests/client-ip-spoof.test.ts',
    'tests/fraud-redis-required.test.ts',
    'tests/provision-race.test.ts',
    'tests/middleware-never-throws.test.ts',
    'tests/ci-trigger-covers-active-branches.test.ts',
    'tests/playwright-config.test.ts',
    'tests/admin-auth.test.ts',
    'tests/admin-metrics.test.ts',
    'tests/fraud-detection.test.ts',
    'tests/fraud-detection-advanced.test.ts',
    'tests/orders-api.test.ts',
    'tests/panel-cms8k.test.ts',
    'tests/panel-cms8k-advanced.test.ts',
    'tests/routes.test.ts',
  ],
  timeout: 30000,
  retries: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari',  use: { ...devices['iPhone 14 Pro'] } },
    { name: 'Mobile Chrome',  use: { ...devices['Pixel 7'] } },
  ],
})
