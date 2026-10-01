// Enforces: circuit-breaker keys normalize away query params so
// repeated failures against the same endpoint (varying IDs) trip
// the 5-consecutive-failure threshold together, not per-ID.
//
// Red-first (B-05): failed before the fix because `endpoint` was
// used as the map key raw — `lookupleague.php?id=1` and
// `lookupleague.php?id=2` counted as separate endpoints, so the
// breaker never accumulated 5 hits and never tripped in practice.
// See S-04 in the plan file and the security-surface audit finding.

import { describe, it, expect } from "vitest";
import { normalizeEndpointKey } from "@/lib/api/the-sports-db";

describe("B-05 circuit-breaker key normalization", () => {
  it("strips the query string from a relative endpoint", () => {
    expect(normalizeEndpointKey("lookupleague.php?id=4328")).toBe("lookupleague.php");
    expect(normalizeEndpointKey("eventsday.php?d=2026-09-15&s=Soccer")).toBe("eventsday.php");
  });

  it("returns the pathname from a full URL", () => {
    expect(
      normalizeEndpointKey("https://www.thesportsdb.com/api/v1/json/123/lookupleague.php?id=4328"),
    ).toBe("/api/v1/json/123/lookupleague.php");
  });

  it("leaves an endpoint without params intact", () => {
    expect(normalizeEndpointKey("all_sports.php")).toBe("all_sports.php");
  });

  it("returns a stable string for the empty/edge inputs", () => {
    expect(normalizeEndpointKey("")).toBe("");
    expect(normalizeEndpointKey("?just=query")).toBe("");
  });

  it("keys two different-ID calls to the same operation IDENTICALLY (the whole point of B-05)", () => {
    // Repeat of the S-04 attack path: without normalization, 5 hits
    // against 5 different leagueIds each count as 1, and the breaker
    // never trips. With normalization they collapse to one key.
    const k1 = normalizeEndpointKey("lookupleague.php?id=4328");
    const k2 = normalizeEndpointKey("lookupleague.php?id=4335");
    const k3 = normalizeEndpointKey("lookupleague.php?id=4344");
    expect(new Set([k1, k2, k3]).size, "these three must key to the same operation").toBe(1);
  });
});
