// Enforces: the /api/admin/* limiter in middleware.ts does not lock an
// admin out of their own read-only dashboard, while the one admin
// route with a real side effect stays strictly limited.
//
// Why: B-06 moved the middleware's "5 per 15 min" limiter from a
// per-instance Map (mostly never tripped in serverless) to a shared
// Redis counter (always trips). That made a mis-sized limit real.
// /admin/api-health makes 2 calls on open (/api/admin/health +
// /api/admin/health/report) and 1 more every 5 min, so one normal
// visit plus a single reload hit 429.
//
// Red-first: the first case failed on the 6th request with 429 before
// the fix.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

const IP = "203.0.113.7";

async function hit(path: string): Promise<number> {
  const { middleware } = await import("@/middleware");
  const req = new NextRequest(`https://smartlivetv.co.uk${path}`, {
    headers: { "x-real-ip": IP },
  });
  const res = await middleware(req);
  return (res as Response).status;
}

describe("admin API limiter: dashboards usable, provisioning strict", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const { _resetForTests } = await import("@/lib/security/rate-limit");
    _resetForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("an admin can reload the health dashboard 10 times in one window without a 429", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 10; i++) {
      statuses.push(await hit("/api/admin/health"));
      statuses.push(await hit("/api/admin/health/report"));
    }
    expect(
      statuses.filter((s) => s === 429).length,
      "reloading /admin/api-health must not lock the admin out of their own dashboard",
    ).toBe(0);
  });

  it("provision-test-trial (creates a real panel trial) still returns 429 after 5 calls", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push(await hit("/api/admin/provision-test-trial"));
    expect(statuses.slice(0, 5).every((s) => s !== 429)).toBe(true);
    expect(statuses[5], "6th provision in 15 min must be refused").toBe(429);
  });

  it("using up the provision budget does not block the read-only dashboard", async () => {
    for (let i = 0; i < 6; i++) await hit("/api/admin/provision-test-trial");
    expect(await hit("/api/admin/health")).not.toBe(429);
  });

  it("the read-only bucket still has a ceiling", async () => {
    let last = 0;
    for (let i = 0; i < 61; i++) last = await hit("/api/admin/metrics");
    expect(last, "61st read in 15 min must be refused").toBe(429);
  });
});
