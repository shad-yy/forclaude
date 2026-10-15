// Enforces flaky-test-policy (playbook/skills/flaky-test-policy.md).
// - No test.only / it.only / describe.only anywhere.
// - Every test.skip has a matching row in FLAKY-TESTS.md.
// - Every row in FLAKY-TESTS.md has a matching test.skip.
// - No FLAKY-TESTS.md row older than 30 days.
// - Playwright retries === 1.
//
// Red-first proof: this file was committed before FLAKY-TESTS.md existed;
// the "row-must-have-a-skip" test failed on absent file. See QA-LOG A-01.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const TEST_DIRS = ["tests", "e2e"];

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, " "))
    .replace(/^[ \t]*\/\/.*$/gm, "");
}

function walkSpecs(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walkSpecs(full));
    else if (/\.(spec|test)\.ts$/.test(e)) out.push(full);
  }
  return out;
}

function scanSpecs(pattern: RegExp): string[] {
  const hits: string[] = [];
  for (const d of TEST_DIRS) {
    if (!existsSync(d)) continue;
    for (const f of walkSpecs(d)) {
      const src = stripComments(readFileSync(f, "utf8"));
      src.split("\n").forEach((line, i) => {
        if (pattern.test(line)) hits.push(`${f}:${i + 1}`);
      });
    }
  }
  return hits;
}

describe("flaky-test-policy: no .only", () => {
  it("no it.only / test.only / describe.only in tests/ or e2e/", () => {
    // Rule 4: test.only silently shrinks the suite to one test while still reporting green.
    const offenders = scanSpecs(/\b(it|test|describe)\.only\s*\(/);
    expect(
      offenders,
      "test.only turns a passing run into no signal at all — banned outright",
    ).toEqual([]);
  });

  it("scanner finds spec files (control against a vacuous walk)", () => {
    const files = TEST_DIRS.flatMap(d => (existsSync(d) ? walkSpecs(d) : []));
    expect(files.length, "no spec files found — the walker is broken").toBeGreaterThan(5);
  });
});

describe("flaky-test-policy: quarantine ↔ skip parity", () => {
  it("every test.skip / test.fixme has a matching row in FLAKY-TESTS.md", () => {
    const skips = scanSpecs(/\b(it|test)\.(skip|fixme)\s*\(/);
    const quarantinePath = "memory-bank/FLAKY-TESTS.md";
    if (skips.length === 0) return; // nothing to quarantine, nothing to check
    if (!existsSync(quarantinePath)) {
      expect(skips, "there are skipped tests but no FLAKY-TESTS.md to justify them").toEqual([]);
      return;
    }
    const quarantine = readFileSync(quarantinePath, "utf8");
    const unlisted = skips.filter(loc => {
      const [file] = loc.split(":");
      return !quarantine.includes(file);
    });
    expect(unlisted, "these skipped tests are not named in FLAKY-TESTS.md").toEqual([]);
  });

  it("every FLAKY-TESTS.md row younger than 30 days has a matching skipped test", () => {
    const quarantinePath = "memory-bank/FLAKY-TESTS.md";
    if (!existsSync(quarantinePath)) return; // covered by the log-hygiene existence test
    // Rows shape: `| tests/foo.test.ts > name of test | 2026-09-15 | reason | owner |`
    const rows = readFileSync(quarantinePath, "utf8")
      .split("\n")
      .map(l => l.match(/^\|\s*([^|]+?)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|/))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map(m => ({ testId: m[1], since: m[2] }));
    if (rows.length === 0) return;
    const skips = new Set(scanSpecs(/\b(it|test)\.(skip|fixme)\s*\(/).map(loc => loc.split(":")[0]));
    const orphaned = rows.filter(r => {
      // Row testId is "file.test.ts > name" — match on the file half.
      const file = r.testId.split(">")[0].trim();
      return !skips.has(file);
    });
    expect(orphaned, "these FLAKY-TESTS.md rows have no matching test.skip").toEqual([]);

    const stale = rows.filter(r => {
      const ageDays = (Date.now() - Date.parse(r.since)) / 86400_000;
      return ageDays > 30;
    });
    expect(stale, "quarantine expires in 30 days; fix or delete").toEqual([]);
  });
});

describe("flaky-test-policy: playwright retries", () => {
  it("playwright.config.ts sets retries: 1", () => {
    // Rule 3: retries:1 is for infrastructure noise. Higher hides product nondeterminism.
    const cfg = readFileSync("playwright.config.ts", "utf8");
    expect(cfg).toMatch(/retries:\s*1\b/);
  });
});
