// Enforces: no route file under app/api/ contains a hardcoded
// `/json/123/` — the TheSportsDB public test key baked into a URL.
//
// From the ci-runs-without-secrets skill: "|| '123'" is the named trap;
// baking it into route source means even when THESPORTSDB_API_KEY is
// correctly set, these routes ignore it. Centralising through
// ENV.THESPORTSDB_KEY (in lib/config/env.ts) keeps the fallback in
// one place with a startup warning.
//
// Red-first (B-03): failed 6/one before the fix — 3 hits in
// app/api/fixtures/today/route.ts and 3 in app/api/spotlight/route.ts.

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx|js|mjs)$/.test(e)) out.push(full);
  }
  return out;
}

describe("B-03 no hardcoded TheSportsDB test key in route source", () => {
  const files = walk("app/api");

  it("scanner finds route files (control against vacuous walk)", () => {
    expect(files.length, "walker found no route files — path is wrong").toBeGreaterThan(20);
  });

  it("no `/json/123/` literal in executable code under app/api/", () => {
    // Strip fenced `/* */` and line `//` comments so a QA comment
    // documenting the removal (e.g. "no longer hardcode `/json/123/`")
    // does not trip the enforcer.
    function executableOnly(src: string): string {
      return src
        .replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, " "))
        .replace(/^[ \t]*\/\/.*$/gm, "");
    }
    const offenders: string[] = [];
    for (const f of files) {
      const src = executableOnly(readFileSync(f, "utf8"));
      src.split("\n").forEach((line, i) => {
        if (line.includes("/json/123/")) offenders.push(`${f}:${i + 1}`);
      });
    }
    expect(
      offenders,
      "these lines bake the public test key into the URL; route ignores THESPORTSDB_API_KEY when it is set",
    ).toEqual([]);
  });
});
