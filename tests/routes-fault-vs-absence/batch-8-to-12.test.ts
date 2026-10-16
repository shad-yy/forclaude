// B-04.8..12 fault-vs-absence for the last 5 grandfathered S-03 routes:
//   search, events/[id]/lineups, spotlight, fixtures/today, news.
// news was already returning 500 on fault; only its body is tightened
// (was: {status:"error", articles:[], totalResults:0}; now: {error:...}).

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const searchAllMock = vi.fn();
const lookupLineupMock = vi.fn();
const eventsDayMock = vi.fn();
const getLatestSportsNewsMock = vi.fn();

vi.mock("@/lib/api/unified-sports-api", () => ({
  unifiedSportsAPI: { searchAll: (...a: unknown[]) => searchAllMock(...a) },
}));
vi.mock("@/lib/api/the-sports-db", () => ({
  lookupLineup: (...a: unknown[]) => lookupLineupMock(...a),
  // Spotlight and fixtures/today read through eventsDay(). Without it here,
  // both routes crashed on a missing export and their 503 tests passed for
  // that reason, not because a fault was handled.
  eventsDay: (...a: unknown[]) => eventsDayMock(...a),
}));
vi.mock("@/lib/api/news", () => ({
  getLatestSportsNews: (...a: unknown[]) => getLatestSportsNewsMock(...a),
}));

const url = (p: string) => new NextRequest(`http://localhost:3000${p}`);

describe("B-04.8 /api/search", () => {
  beforeEach(() => { searchAllMock.mockReset(); vi.resetModules(); });

  it("fault → 503+no-store", async () => {
    searchAllMock.mockRejectedValue(new Error("UpstreamFaultError"));
    const { GET } = await import("@/app/api/search/route");
    const res = await GET(url("/api/search?q=arsenal"));
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("empty query → 200 (input rejection, not fault)", async () => {
    const { GET } = await import("@/app/api/search/route");
    const res = await GET(url("/api/search"));
    expect(res.status).toBe(200);
  });
});

describe("B-04.9 /api/events/[id]/lineups", () => {
  beforeEach(() => { lookupLineupMock.mockReset(); vi.resetModules(); });

  it("fault → 503+no-store", async () => {
    lookupLineupMock.mockRejectedValue(new Error("UpstreamFaultError"));
    const { GET } = await import("@/app/api/events/[id]/lineups/route");
    const res = await GET(url("/api/events/1/lineups"), { params: { id: "1" } });
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns [] → 200 (absence)", async () => {
    lookupLineupMock.mockResolvedValue([]);
    const { GET } = await import("@/app/api/events/[id]/lineups/route");
    const res = await GET(url("/api/events/1/lineups"), { params: { id: "1" } });
    expect(res.status).toBe(200);
  });
});

describe("B-04.10 /api/spotlight", () => {
  beforeEach(() => { eventsDayMock.mockReset(); vi.resetModules(); });

  it("eventsDay faults → 503+no-store", async () => {
    eventsDayMock.mockRejectedValue(new Error("UpstreamFaultError: eventsday.php → 503"));
    const { GET } = await import("@/app/api/spotlight/route");
    const res = await GET();
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("an empty day → 200 (absence)", async () => {
    eventsDayMock.mockResolvedValue([]);
    const { GET } = await import("@/app/api/spotlight/route");
    const res = await GET();
    expect(res.status).toBe(200);
  });
});

describe("B-04.11 /api/fixtures/today", () => {
  beforeEach(() => { eventsDayMock.mockReset(); vi.resetModules(); });

  it("eventsDay faults → 503+no-store", async () => {
    eventsDayMock.mockRejectedValue(new Error("UpstreamFaultError: eventsday.php → 503"));
    const { GET } = await import("@/app/api/fixtures/today/route");
    const res = await GET();
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("an empty day → 200 with empty lists (absence)", async () => {
    eventsDayMock.mockResolvedValue([]);
    const { GET } = await import("@/app/api/fixtures/today/route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect((await res.json()).upcoming).toEqual([]);
  });
});

describe("B-04.12 /api/news honesty polish", () => {
  beforeEach(() => { getLatestSportsNewsMock.mockReset(); vi.resetModules(); });

  it("fault → 500 with {error} body (no misleading articles:[])", async () => {
    getLatestSportsNewsMock.mockRejectedValue(new Error("UpstreamFaultError"));
    const { GET } = await import("@/app/api/news/route");
    const res = await GET(url("/api/news"));
    expect(res.status).toBeGreaterThanOrEqual(500);
    const body = await res.json();
    expect(body.error, "fault body should name the error, not present as empty articles").toBeDefined();
  });
});
