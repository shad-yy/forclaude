// Enforces: the header search bar never shows hard-coded results.
//
// When the four /api/search/* calls came back empty (no match, or every
// provider down), search-bar.tsx showed a fixed list — "Manchester
// United", "Cristiano Ronaldo", "Premier League" — filtered by the
// query. That is made-up data presented as a real result, and the links
// were slugs the detail pages do not resolve: /leagues/premier-league
// rendered "League Not Found" on the production deployment (checked
// 2026-09-24; league ids are TheSportsDB numbers such as "4328").
//
// Real rows build their url from the API id with a template literal
// (`/teams/${team.id}`); a quoted literal url is a fabricated row.
//
// Red-first: failed on the three quoted urls before the fix.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("search bar shows only real results", () => {
  const src = readFileSync("components/layout/search-bar.tsx", "utf8");

  it("has no result row with a hard-coded /teams, /players or /leagues url", () => {
    const fabricated = src.match(/url:\s*["']\/(teams|players|leagues)\/[^"']*["']/g) ?? [];
    expect(fabricated, "hard-coded search results are made-up data; show the empty state instead").toEqual([]);
  });

  it("keeps the honest empty state", () => {
    expect(src).toContain("No results found for");
  });
});
