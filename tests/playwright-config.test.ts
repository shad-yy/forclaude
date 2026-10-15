// Enforces: playwright.config.ts actually picks up every checked-in
// spec file, and baseURL is env-driven (not hardcoded to production).
//
// Red-first (I-02): before A-10 the config had `testDir: './tests'` and
// hardcoded `baseURL: 'https://smartlivetv.co.uk'`. Every file under
// e2e/*.spec.ts was orphaned, and even the specs that DID run hit the
// live production site by default.
//
// Test strategy: structural read of playwright.config.ts + git-tracked
// spec inventory. Runtime `playwright test --list` is expensive and
// requires browsers; a config-shape test discriminates the fix without
// that cost.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const CFG = "playwright.config.ts";

function trackedSpecFiles(): string[] {
  // git-tracked *.spec.ts anywhere under tests/ or e2e/. Uses a pathspec
  // magic prefix (:(glob)) rather than shell-style ** because git's own
  // glob does not expand ** to arbitrary depth.
  const out = execSync(
    'git ls-files ":(glob)tests/**/*.spec.ts" ":(glob)e2e/**/*.spec.ts"',
    { encoding: "utf8" },
  ).trim();
  return out ? out.split("\n") : [];
}

describe("A-10 Playwright config covers every tracked spec file", () => {
  it("scanner finds spec files (control against vacuous walk)", () => {
    // Discrimination control: if this returns 0, later assertions pass
    // vacuously. Verifying the walk before trusting it. The repo has
    // ≥ 2 tracked *.spec.ts files today (e2e/smartlivetv.spec.ts and
    // e2e/smoke.spec.ts); the tests/ directory carries `*.test.ts`
    // Playwright-format specs which are covered by testIgnore in the
    // config so they're not orphaned either.
    expect(trackedSpecFiles().length).toBeGreaterThanOrEqual(2);
  });

  it("config picks up specs under BOTH tests/ and e2e/", () => {
    const cfg = readFileSync(CFG, "utf8");
    const specs = trackedSpecFiles();
    const hasTestsSpec = specs.some(s => s.startsWith("tests/"));
    const hasE2eSpec = specs.some(s => s.startsWith("e2e/"));
    if (hasE2eSpec) {
      expect(
        cfg.match(/e2e/) || cfg.match(/testMatch/),
        "e2e/*.spec.ts files exist but config does not mention e2e/ or a testMatch that would cover them — they are orphaned",
      ).toBeTruthy();
    }
    if (hasTestsSpec) {
      expect(
        cfg.match(/tests/) || cfg.match(/testMatch/),
        "tests/*.spec.ts files exist but config does not mention tests/ or a testMatch that would cover them",
      ).toBeTruthy();
    }
  });

  it("baseURL is env-driven, not hardcoded to production", () => {
    const cfg = readFileSync(CFG, "utf8");
    // The default localhost port is fine; the fail case is a bare
    // `baseURL: 'https://smartlivetv.co.uk'` with no env var reference.
    const hasEnvBaseUrl = /baseURL\s*:\s*(?:process\.env\.PLAYWRIGHT_BASE_URL|`\$\{[^}]*process\.env\.PLAYWRIGHT_BASE_URL)/.test(
      cfg,
    );
    expect(
      hasEnvBaseUrl,
      "baseURL must read from process.env.PLAYWRIGHT_BASE_URL so CI/dev/prod each pick their own — hardcoding production means every test run pings the live site",
    ).toBe(true);
  });
});
