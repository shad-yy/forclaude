// Enforces: the production build fails on stray `>` or `}` in JSX text
// (a typo) but not on `'` or `"`, which React renders exactly as typed.
// Note: in .tsx files `>`/`}` are already a parse error, so the build
// fails on them before this rule even runs; the rule keeps them listed
// for explicitness.
//
// O-06 turned ESLint errors into build failures. With the default
// react/no-unescaped-entities config, one apostrophe in new page copy
// ("Don't miss...") failed the Vercel build, so a content push to
// Version-3 would not deploy — a cosmetic rule blocking releases.
//
// Red-first: the apostrophe case reported 3 errors before .eslintrc.json
// narrowed the rule's `forbid` list.

import { describe, it, expect } from "vitest";
import { ESLint } from "eslint";

async function errorsFor(jsxText: string): Promise<number> {
  const eslint = new ESLint();
  const code = `export default function Copy() {\n  return <p>${jsxText}</p>\n}\n`;
  const [result] = await eslint.lintText(code, { filePath: "app/eslint-entities-probe.tsx" });
  // Any severity-2 message fails `next build` (parse errors included).
  return result.messages.filter((m) => m.severity === 2).length;
}

describe("react/no-unescaped-entities: block typos, not punctuation", () => {
  it("allows an apostrophe and quotes in page copy", async () => {
    expect(await errorsFor(`Don't miss the "big" match`)).toBe(0);
  });

  it("still fails the build on a stray closing brace", async () => {
    expect(await errorsFor("Kick-off }")).toBeGreaterThan(0);
  });

  it("still fails the build on a stray >", async () => {
    expect(await errorsFor("Score > 2")).toBeGreaterThan(0);
  });
}, 30_000);
