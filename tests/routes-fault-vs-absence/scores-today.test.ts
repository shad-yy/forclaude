// B-04.3 /api/scores/today fault-vs-absence.
// Special note (from api-fault-vs-absence skill D-01b): the previous
// "No matches scheduled today" fallback was a confident claim about a
// normal future state, asserted during a live outage. Now: fault → 503
// with honest "could not check" message; genuine empty (upstream 200
// with events=[]) → 200 with "No matches scheduled today".

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

function req(): NextRequest {
  return new NextRequest("http://localhost:3000/api/scores/today");
}

describe("B-04.3 /api/scores/today fault-vs-absence", () => {
  const fetchStub = vi.fn();
  beforeEach(() => {
    fetchStub.mockReset();
    vi.stubGlobal("fetch", fetchStub);
    vi.resetModules();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("upstream throws → 503", async () => {
    fetchStub.mockRejectedValue(new Error("ECONNRESET"));
    const { GET } = await import("@/app/api/scores/today/route");
    const res = await GET(req());
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("upstream 500 → 503 (not 200 with a lie)", async () => {
    fetchStub.mockResolvedValue(new Response("boom", { status: 500 }));
    const { GET } = await import("@/app/api/scores/today/route");
    const res = await GET(req());
    expect(
      res.status,
      "upstream 500 must surface as 503 — 'No matches scheduled today' during an outage is a false claim",
    ).toBe(503);
  });

  it("upstream 200 with empty events → 200 with honest empty state (absence)", async () => {
    fetchStub.mockResolvedValue(new Response(JSON.stringify({ events: [] }), { status: 200 }));
    const { GET } = await import("@/app/api/scores/today/route");
    const res = await GET(req());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.matches).toEqual([]);
  });

  it("upstream 200 with events → 200 with mapped matches (control)", async () => {
    fetchStub.mockResolvedValue(new Response(JSON.stringify({
      events: [{ idEvent: "1", strHomeTeam: "A", strAwayTeam: "B" }],
    }), { status: 200 }));
    const { GET } = await import("@/app/api/scores/today/route");
    const res = await GET(req());
    expect(res.status).toBe(200);
    expect((await res.json()).matches).toHaveLength(1);
  });
});
