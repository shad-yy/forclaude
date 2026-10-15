// Enforces: next.config.mjs never silently re-enables the two flags
// that let build errors reach production unnoticed.
//
// O-06 (2026-09-22): both `typescript.ignoreBuildErrors` and
// `eslint.ignoreDuringBuilds` are now `false`, verified by a real
// `next build` (not just `next lint`/`tsc --noEmit`) completing
// successfully with both gates live. Flipping either back to `true`
// removes that signal without anyone deciding to.
//
// Red-first: this file fails if a future edit sets either flag back
// to `true` — the exact regression this guards against.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("O-06 next.config.mjs build gates stay enabled", () => {
  const cfg = readFileSync("next.config.mjs", "utf8");

  it("typescript.ignoreBuildErrors is false", () => {
    const match = cfg.match(/typescript\s*:\s*\{\s*ignoreBuildErrors\s*:\s*(true|false)/);
    expect(match, "could not locate typescript.ignoreBuildErrors in next.config.mjs").not.toBeNull();
    expect(
      match![1],
      "typescript.ignoreBuildErrors must stay false — flipping it back to true lets TypeScript errors reach production silently (see CLAUDE.md Known open issues)",
    ).toBe("false");
  });

  it("eslint.ignoreDuringBuilds is false", () => {
    const match = cfg.match(/eslint\s*:\s*\{\s*ignoreDuringBuilds\s*:\s*(true|false)/);
    expect(match, "could not locate eslint.ignoreDuringBuilds in next.config.mjs").not.toBeNull();
    expect(
      match![1],
      "eslint.ignoreDuringBuilds must stay false — flipping it back to true lets ESLint errors (including real bugs like a Rules-of-Hooks violation, see QA-LOG O-06) reach production silently",
    ).toBe("false");
  });
});
