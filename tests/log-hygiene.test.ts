// Enforces documentation-discipline (playbook/skills/documentation-discipline.md).
// - The four required memory-bank files exist.
// - Every commit hash cited in QA-LOG / PROGRESS / SETUP-REQUIRED resolves in git.
// - No relative dates ("yesterday", "recently", …) in those files.
// - Every process.env.<NAME> the app reads is documented in SETUP-REQUIRED.md.
//
// Red-first proof: this test file was committed BEFORE the four memory-bank files
// existed and failed with "the four required memory-bank files exist" — see
// memory-bank/QA-LOG.md entry A-01.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const REQUIRED = ["QA-LOG.md", "OPEN-WORK.md", "FLAKY-TESTS.md", "SETUP-REQUIRED.md"];
const HASH_SCANNED = [
  "memory-bank/QA-LOG.md",
  "memory-bank/PROGRESS.md",
  "memory-bank/SETUP-REQUIRED.md",
];

// Vercel / Next / Node runtime provide these; they are never user-set and need no SETUP-REQUIRED row.
const PLATFORM_ENV = new Set(["NODE_ENV", "VERCEL_ENV", "VERCEL_URL", "NEXT_RUNTIME"]);

// Directories whose process.env reads count as "the app". Tests, scripts and configs
// are excluded — they read env for their own harness, not for what the app depends on.
const APP_DIRS = ["lib", "app", "components"];
const APP_FILES = ["middleware.ts", "instrumentation.ts"];

// Strip both fenced ```blocks``` and inline `code` before scanning.
// Prose claims about hashes and dates are enforced; code examples (URL
// templates like `{today}`, partial leaked keys like `e0d3bf230a...`) are
// literal text, not claims.
function stripCode(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]*`/g, "");
}

function walkSource(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (e === "node_modules" || e === ".next") continue;
      out.push(...walkSource(full));
    } else if (/\.(ts|tsx|mjs|js|cjs)$/.test(e)) {
      out.push(full);
    }
  }
  return out;
}

function collectEnvReads(): Set<string> {
  const found = new Set<string>();
  const targets: string[] = [];
  for (const d of APP_DIRS) if (existsSync(d)) targets.push(...walkSource(d));
  for (const f of APP_FILES) if (existsSync(f)) targets.push(f);
  const re = /process\.env\.([A-Z0-9_]+)/g;
  for (const f of targets) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(re)) found.add(m[1]);
  }
  return found;
}

describe("documentation-discipline: the four files exist", () => {
  it("memory-bank/{QA-LOG,OPEN-WORK,FLAKY-TESTS,SETUP-REQUIRED}.md all exist", () => {
    const missing = REQUIRED.filter(f => !existsSync(join("memory-bank", f)));
    expect(missing, "the four required memory-bank files are missing").toEqual([]);
  });
});

describe("documentation-discipline: commit hashes resolve in git", () => {
  it("every 7-40 char hex token in tracked docs resolves as a commit", () => {
    const missing: string[] = [];
    for (const rel of HASH_SCANNED) {
      if (!existsSync(rel)) continue;
      const text = stripCode(readFileSync(rel, "utf8"));
      const hashes = [...text.matchAll(/\b([0-9a-f]{7,40})\b/g)].map(m => m[1]);
      for (const h of hashes) {
        try {
          execSync(`git rev-parse --verify ${h}^{commit}`, { stdio: "ignore" });
        } catch {
          missing.push(`${rel}: ${h}`);
        }
      }
    }
    expect(
      missing,
      "these hex tokens read like commit hashes but do not resolve in git — a stale hash reads as truth to the next person",
    ).toEqual([]);
  });
});

describe("documentation-discipline: no relative dates", () => {
  it("tracked docs contain no relative dates outside code fences", () => {
    const relative = /\b(yesterday|today|last week|recently|soon|later)\b/i;
    const offenders: string[] = [];
    for (const rel of HASH_SCANNED) {
      if (!existsSync(rel)) continue;
      const t = stripCode(readFileSync(rel, "utf8"));
      const hit = t.match(relative);
      if (hit) offenders.push(`${rel}: "${hit[0]}"`);
    }
    expect(
      offenders,
      "relative dates rot; a reader in six months will not know what day this means",
    ).toEqual([]);
  });
});

describe("documentation-discipline: SETUP-REQUIRED covers every process.env read", () => {
  it("every non-platform process.env.<NAME> the app reads is named in SETUP-REQUIRED.md", () => {
    const found = collectEnvReads();
    const setupPath = "memory-bank/SETUP-REQUIRED.md";
    const setup = existsSync(setupPath) ? readFileSync(setupPath, "utf8") : "";
    const missing: string[] = [];
    for (const name of [...found].sort()) {
      if (PLATFORM_ENV.has(name)) continue;
      // Backticked mention is required — a bare paragraph reference is too loose.
      if (!setup.includes("`" + name + "`")) missing.push(name);
    }
    expect(
      missing,
      "these env vars are read by the app but not documented in memory-bank/SETUP-REQUIRED.md",
    ).toEqual([]);
  });

  it("finds env reads to check (guards against a silently vacuous walk)", () => {
    // If the walk found nothing at all, the previous test would pass vacuously.
    // per layered-testing-strategy: every structural scan needs a discrimination control.
    const found = collectEnvReads();
    expect(found.size, "walk found no process.env reads — the scanner is broken").toBeGreaterThan(10);
  });
});
