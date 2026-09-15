// Enforces: /api/admin/provision-test-trial does not accept JWT_SECRET or
// CRON_SECRET as query/header credentials — only the admin session cookie.
//
// Red-first proof: this test file existed at a name matching the OLD path
// (/api/admin/test-panel) and failed at the "?secret=<JWT_SECRET>" case
// with "expected 401, received 200/500 — the bypass grants access".
// After A-03 the endpoint moved and the bypass is removed, so this file
// now imports the new route.
//
// See memory-bank/QA-LOG.md A-03 and the security-surface audit finding
// E-03 for the incident detail.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

// Prevent live panel provisioning inside the auth test — we assert on
// the auth gate, not on cms-8k behaviour.
vi.mock("@/lib/panel/cms8k", () => ({
  createTrialAccount: vi.fn(async () => ({
    success: true,
    username: "SLTV_test_1234",
    credentials: {
      username: "SLTV_test_1234",
      password: "fake",
      server: "http://example.test",
      m3uUrl: "http://example.test/m3u",
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    },
  })),
}));

const JWT_SECRET = "test-jwt-secret-abc";
const CRON_SECRET = "test-cron-secret-xyz";

describe("A-03 /api/admin/provision-test-trial auth", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", JWT_SECRET);
    vi.stubEnv("CRON_SECRET", CRON_SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns 401 without any credentials", async () => {
    const { GET } = await import("@/app/api/admin/provision-test-trial/route");
    const req = new NextRequest("http://localhost:3000/api/admin/provision-test-trial", {
      method: "GET",
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when a caller passes ?secret=<JWT_SECRET> (bypass closed)", async () => {
    const { GET } = await import("@/app/api/admin/provision-test-trial/route");
    const req = new NextRequest(
      `http://localhost:3000/api/admin/provision-test-trial?secret=${JWT_SECRET}`,
      { method: "GET" },
    );
    const res = await GET(req);
    expect(
      res.status,
      "JWT_SECRET-as-query-secret must no longer authenticate this endpoint",
    ).toBe(401);
  });

  it("returns 401 when a caller passes Authorization: Bearer <JWT_SECRET> (bypass closed)", async () => {
    const { GET } = await import("@/app/api/admin/provision-test-trial/route");
    const req = new NextRequest("http://localhost:3000/api/admin/provision-test-trial", {
      method: "GET",
      headers: { Authorization: `Bearer ${JWT_SECRET}` },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when a caller passes ?secret=<CRON_SECRET> (bypass closed)", async () => {
    const { GET } = await import("@/app/api/admin/provision-test-trial/route");
    const req = new NextRequest(
      `http://localhost:3000/api/admin/provision-test-trial?secret=${CRON_SECRET}`,
      { method: "GET" },
    );
    const res = await GET(req);
    expect(
      res.status,
      "CRON_SECRET-as-query-secret must no longer authenticate this endpoint",
    ).toBe(401);
  });
});
