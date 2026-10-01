// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

// A-10 / A-13: convention is vitest owns *.test.ts, playwright owns
// *.spec.ts. testMatch picks up every *.spec.ts under tests/ or e2e/
// (both directories carry them), and no enumerated testIgnore is
// needed. baseURL is env-driven so a stray run never pings production.
export default defineConfig({
  testDir: '.',
  testMatch: ['tests/**/*.spec.ts', 'e2e/**/*.spec.ts'],
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
