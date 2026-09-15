// Enforces: .github/workflows/ci.yml fires on pushes and PRs targeting
// the branches this project actually uses — otherwise CI is a green
// tick from history that means nothing about today's push.
//
// Red-first: this test failed before A-09 because the workflow was
// scoped to `main` only; the active production branch is Version-3
// and my dev branch is claude/exciting-planck-6a4nbr, neither of
// which triggered any run. Coverage gap I-01.

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";

const CI_YML = ".github/workflows/ci.yml";

describe("A-09 CI trigger covers this project's branches", () => {
  it("workflow file exists", () => {
    expect(existsSync(CI_YML), "ci.yml missing").toBe(true);
  });

  it("triggers on push to Version-3 (the production branch)", () => {
    const yml = readFileSync(CI_YML, "utf8");
    expect(
      yml,
      "push trigger must include Version-3 — the production deploy branch",
    ).toMatch(/push:\s*\n\s*branches:\s*\[[^\]]*Version-3[^\]]*\]|push:[\s\S]*?branches:[\s\S]*?-\s*Version-3/);
  });

  it("triggers on pull_request against Version-3", () => {
    const yml = readFileSync(CI_YML, "utf8");
    expect(
      yml,
      "pull_request trigger must include Version-3",
    ).toMatch(/pull_request:\s*\n\s*branches:\s*\[[^\]]*Version-3[^\]]*\]|pull_request:[\s\S]*?branches:[\s\S]*?-\s*Version-3/);
  });

  it("triggers on push to claude/** short-lived dev branches", () => {
    const yml = readFileSync(CI_YML, "utf8");
    expect(
      yml,
      "push trigger must include claude/** so my working branches get a CI signal per commit",
    ).toMatch(/claude\/\*\*/);
  });
});
