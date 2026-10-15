// Red-first for B-02 (per O-12). Refuses any `"use client"` React
// file under `app/` or `components/` that imports a low-level provider
// client directly — PATTERNS.md non-negotiable: "Never import
// LOW-LEVEL clients (`theSportsDB` / `newsAPI` / `ufcScraper`)
// directly into React components." Direct low-level imports in a
// client component ship the scraper module (and its transitive
// dependencies) into the browser bundle, and any per-provider retry /
// dedup / auth logic runs client-side where an attacker can observe
// it.
//
// Scope: only `"use client"` files (server components legitimately
// call resolvers directly). The list of banned modules matches the
// entries PATTERNS.md flags plus the other keyless-scraper modules
// this repo now has.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

// git ls-files understands the repo layout without ambient shell globs.
function listCandidateFiles(): string[] {
  const out = execSync(
    "git ls-files ':(glob)app/**/*.tsx' ':(glob)components/**/*.tsx'",
    { encoding: "utf8" },
  );
  return out.split("\n").filter(Boolean);
}

const BANNED_MODULE = /from\s+["']@\/lib\/api\/(news|the-sports-db|mma-rapidapi|ufc-scraper|espn|football-data)(?:["']|\/)/;
const USE_CLIENT = /^\s*(?:"use client"|'use client')\s*;?/m;
// `import type ...` and `export type ...` are erased at build time
// (0 bytes shipped), so a type-only reference to a low-level module's
// exported types is not a bundle bloat / secret-leak risk.
const TYPE_ONLY_IMPORT = /^\s*(?:import|export)\s+type\s/;

describe("B-02 no low-level API imports in client components (PATTERNS.md non-negotiable)", () => {
  const files = listCandidateFiles();

  it("has files to check — guards against a zero-match vacuous pass", () => {
    expect(files.length, "no .tsx files listed under app/ + components/").toBeGreaterThan(0);
  });

  it("no `\"use client\"` file imports a low-level provider client", () => {
    const violations: Array<{ file: string; line: string }> = [];
    for (const file of files) {
      let src: string;
      try {
        src = readFileSync(file, "utf8");
      } catch {
        continue;
      }
      if (!USE_CLIENT.test(src)) continue;
      const lines = src.split("\n");
      for (const line of lines) {
        // Skip comment lines so a warning that mentions the path
        // does not count as a violation.
        if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
        // Skip type-only imports (erased at build time).
        if (TYPE_ONLY_IMPORT.test(line)) continue;
        if (BANNED_MODULE.test(line)) {
          violations.push({ file, line: line.trim() });
        }
      }
    }
    expect(
      violations,
      `Client components must go through a proxy route (e.g. \`fetch("/api/news/search")\`), not import provider modules directly.\nViolations:\n${violations.map(v => `  ${v.file}: ${v.line}`).join("\n")}`,
    ).toEqual([]);
  });
});
