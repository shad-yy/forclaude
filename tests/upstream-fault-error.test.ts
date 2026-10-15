// Enforces: UpstreamFaultError shape + type guard used by new resolvers
// under the hybrid api-fault-vs-absence rule (B-01). Red-first: this
// file failed 4/4 before B-01 (module did not exist).

import { describe, it, expect } from "vitest";
import { UpstreamFaultError, isUpstreamFault } from "@/lib/api/errors";

describe("B-01 UpstreamFaultError shape", () => {
  it("carries endpoint, status, optional detail", () => {
    const err = new UpstreamFaultError("theSportsDB.getLeagues", 502, "bad gateway");
    expect(err.name).toBe("UpstreamFaultError");
    expect(err.endpoint).toBe("theSportsDB.getLeagues");
    expect(err.status).toBe(502);
    expect(err.detail).toBe("bad gateway");
    expect(err.message).toContain("502");
    expect(err.message).toContain("theSportsDB.getLeagues");
  });

  it("isUpstreamFault: true for instances, false for other errors", () => {
    expect(isUpstreamFault(new UpstreamFaultError("x", 500))).toBe(true);
    expect(isUpstreamFault(new Error("plain"))).toBe(false);
    expect(isUpstreamFault(null)).toBe(false);
    expect(isUpstreamFault("string error")).toBe(false);
    expect(isUpstreamFault({})).toBe(false);
  });

  it("isUpstreamFault: true when only the name matches (survives cross-module instanceof breakage)", () => {
    // Simulate an edge-runtime bundle that lost the class reference.
    const foreign = new Error("upstream failure");
    foreign.name = "UpstreamFaultError";
    expect(
      isUpstreamFault(foreign),
      "type guard must catch cross-bundle instances by name; Next.js edge/server split breaks plain instanceof",
    ).toBe(true);
  });

  it("has a stable message shape for logs", () => {
    const err = new UpstreamFaultError("news.getArticles", 429);
    expect(err.message).toMatch(/UpstreamFaultError: news\.getArticles → 429/);
  });
});
