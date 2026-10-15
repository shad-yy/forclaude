// B-04.2 /api/scores/recent fault-vs-absence. Same shape as leagues; see
// tests/routes-fault-vs-absence/leagues.test.ts for the pattern and QA-LOG.md.

import { describe, it, expect, beforeEach, vi } from "vitest";

const mock = vi.fn();
vi.mock("@/lib/api/unified-sports-api", () => ({
  unifiedSportsAPI: { getRecentResults: (...a: unknown[]) => mock(...a) },
}));

describe("B-04.2 /api/scores/recent fault-vs-absence", () => {
  beforeEach(() => { mock.mockReset(); vi.resetModules(); });

  it("throws → 503 with no-store (fault)", async () => {
    mock.mockRejectedValue(new Error("UpstreamFaultError"));
    const { GET } = await import("@/app/api/scores/recent/route");
    const res = await GET();
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns [] → 200 empty (absence, kept)", async () => {
    mock.mockResolvedValue([]);
    const { GET } = await import("@/app/api/scores/recent/route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual([]);
  });

  it("returns data → 200 (control)", async () => {
    mock.mockResolvedValue([{ id: "1" }]);
    const { GET } = await import("@/app/api/scores/recent/route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect((await res.json()).data).toHaveLength(1);
  });
});
