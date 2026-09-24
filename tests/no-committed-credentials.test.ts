// Enforces: no provider key is hardcoded in source, and no browser
// network recording (.har) is committed.
//
// Found 2026-09-24 while checking a Gitleaks CI failure with a full
// working-tree scan (CI's Gitleaks only scans each push's new commits,
// so older files were never checked):
// - app/api/test-mma/route.ts sent a hardcoded RapidAPI key, and
//   README.env.example carried the same value — the key PROGRESS.md
//   Bug 5 says was removed. The route was public and unauthenticated.
// - cms-8k.com.har, a recording of the panel site, held two panel line
//   logins (username + password) in a response body.
// The repo is public, so both must be rotated at the source; this test
// stops them coming back.
//
// Red-first: failed on both before the fix.

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SKIP = new Set(["node_modules", ".next", ".git", "logs", "playwright-report", "test-results"]);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const path = dir === "." ? name : join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe("no committed credentials", () => {
  const files = walk(".");

  it("no .har network recordings in the repo", () => {
    expect(files.filter((f) => f.endsWith(".har"))).toEqual([]);
  });

  it("no hardcoded RapidAPI key in source or example env files", () => {
    const hardcoded = /x-rapidapi-key['"]?\s*:\s*['"][A-Za-z0-9]{20,}|RAPIDAPI[A-Z_]*\s*=\s*[A-Za-z0-9]{20,}/;
    const offenders = files
      .filter((f) => /\.(ts|tsx|js|mjs|cjs)$|\.env\.example$|env\.example$/.test(f))
      .filter((f) => hardcoded.test(readFileSync(f, "utf8")));
    expect(offenders, "read the key from process.env.RAPIDAPI_MMA_KEY; rotate any key that was committed").toEqual([]);
  });
});
