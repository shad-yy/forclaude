// B-04.4..7 fault-vs-absence for 4 structurally identical routes:
//   leagues/[id]/events, teams/[id], players/[id], ufc/events.
// Same pattern as B-04.1 (leagues). Batched into one commit because the
// change is a 3-line catch rewrite in each — separate commits would be
// noise, not signal.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const getFixturesMock = vi.fn();
const getTeamMock = vi.fn();
const getPlayerMock = vi.fn();
const getUpcomingEventsMock = vi.fn();

vi.mock("@/lib/api/unified-sports-api", () => ({
  unifiedSportsAPI: {
    getFixtures: (...a: unknown[]) => getFixturesMock(...a),
    getTeam: (...a: unknown[]) => getTeamMock(...a),
    getPlayer: (...a: unknown[]) => getPlayerMock(...a),
  },
}));
vi.mock("@/lib/api/ufc", () => ({
  getUpcomingEvents: (...a: unknown[]) => getUpcomingEventsMock(...a),
}));

function req(path: string): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`);
}

describe("B-04.4 /api/leagues/[id]/events", () => {
  beforeEach(() => { getFixturesMock.mockReset(); vi.resetModules(); });

  it("fault → 503+no-store", async () => {
    getFixturesMock.mockRejectedValue(new Error("UpstreamFaultError"));
    const { GET } = await import("@/app/api/leagues/[id]/events/route");
    const res = await GET(req("/api/leagues/4328/events"), { params: { id: "4328" } });
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("empty → 200 (absence)", async () => {
    getFixturesMock.mockResolvedValue([]);
    const { GET } = await import("@/app/api/leagues/[id]/events/route");
    const res = await GET(req("/api/leagues/4328/events"), { params: { id: "4328" } });
    expect(res.status).toBe(200);
  });
});

describe("B-04.5 /api/teams/[id]", () => {
  beforeEach(() => { getTeamMock.mockReset(); vi.resetModules(); });

  it("fault → 503+no-store", async () => {
    getTeamMock.mockRejectedValue(new Error("UpstreamFaultError"));
    const { GET } = await import("@/app/api/teams/[id]/route");
    const res = await GET(req("/api/teams/1"), { params: { id: "1" } });
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("null → 200 (absence — team not found)", async () => {
    getTeamMock.mockResolvedValue(null);
    const { GET } = await import("@/app/api/teams/[id]/route");
    const res = await GET(req("/api/teams/1"), { params: { id: "1" } });
    expect(res.status).toBe(200);
  });
});

describe("B-04.6 /api/players/[id]", () => {
  beforeEach(() => { getPlayerMock.mockReset(); vi.resetModules(); });

  it("fault → 503+no-store", async () => {
    getPlayerMock.mockRejectedValue(new Error("UpstreamFaultError"));
    const { GET } = await import("@/app/api/players/[id]/route");
    const res = await GET(req("/api/players/1"), { params: { id: "1" } });
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("null → 200 (absence — player not found)", async () => {
    getPlayerMock.mockResolvedValue(null);
    const { GET } = await import("@/app/api/players/[id]/route");
    const res = await GET(req("/api/players/1"), { params: { id: "1" } });
    expect(res.status).toBe(200);
  });
});

describe("B-04.7 /api/ufc/events", () => {
  beforeEach(() => { getUpcomingEventsMock.mockReset(); vi.resetModules(); });

  it("fault → 503+no-store", async () => {
    getUpcomingEventsMock.mockRejectedValue(new Error("UpstreamFaultError"));
    const { GET } = await import("@/app/api/ufc/events/route");
    const res = await GET();
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("empty → 200 (absence)", async () => {
    getUpcomingEventsMock.mockResolvedValue([]);
    const { GET } = await import("@/app/api/ufc/events/route");
    const res = await GET();
    expect(res.status).toBe(200);
  });
});
