// Enforces: /api/leagues distinguishes fault from absence per the
// hybrid api-fault-vs-absence rule (B-01, memory-bank/PATTERNS.md).
//
// Red-first (B-04, route 1 of 12): failed before the fix — a thrown
// UpstreamFaultError from the resolver produced a 200 with {data:[]}
// and 'error: "Data temporarily unavailable"'. Google reads a 200 with
// empty data as "this entity has nothing" and downweights the page.
// The fix returns 503 for fault; absence (resolver returned []
// legitimately) still returns 200 with empty data.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

const getLeaguesMock = vi.fn();

vi.mock("@/lib/api/unified-sports-api", () => ({
  unifiedSportsAPI: {
    getLeagues: (...args: unknown[]) => getLeaguesMock(...args),
  },
}));

function req(): NextRequest {
  return new NextRequest("http://localhost:3000/api/leagues");
}

describe("B-04 /api/leagues fault-vs-absence", () => {
  beforeEach(() => {
    getLeaguesMock.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 503 when the resolver throws (fault)", async () => {
    getLeaguesMock.mockRejectedValue(new Error("UpstreamFaultError: TheSportsDB → 502"));
    const { GET } = await import("@/app/api/leagues/route");
    const res = await GET(req());
    expect(
      res.status,
      "a thrown fault must surface as 503 — collapsing it into 200-empty gets the page deindexed by Google",
    ).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const body = await res.json();
    expect(body.error).toMatch(/upstream|temporarily unavailable|could not check/i);
  });

  it("returns 200 with empty data when the resolver returns [] (absence)", async () => {
    getLeaguesMock.mockResolvedValue([]);
    const { GET } = await import("@/app/api/leagues/route");
    const res = await GET(req());
    expect(
      res.status,
      "resolver returned empty (no exception) — that's a legitimate absence, keep 200",
    ).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });

  it("returns 200 with the resolver's data on the happy path (control that we didn't over-fix)", async () => {
    getLeaguesMock.mockResolvedValue([{ idLeague: "4328", strLeague: "Premier League" }]);
    const { GET } = await import("@/app/api/leagues/route");
    const res = await GET(req());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
  });
});
