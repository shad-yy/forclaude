// Enforces: /api/orders trial requests are rejected with 503 when the
// fraud service (Upstash Redis) is unavailable, rather than silently
// bypassing all dedup + IP fraud gates.
//
// Red-first proof: this file failed 1/2 before A-06 — the trial POST
// with Upstash env unset returned 200/429/500 (fraud silently no-op)
// instead of 503. Security-surface audit E-04.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/panel/cms8k", () => ({
  createTrialAccount: vi.fn(async () => ({ success: false, error: "mocked" })),
}));
vi.mock("@/lib/db/customers", () => ({
  createCustomer: vi.fn(async () => ({ id: "cust_test_1" })),
  getCustomerByEmail: vi.fn(async () => null),
  updateCustomer: vi.fn(async () => {}),
}));

function makeTrialRequest(body: Record<string, unknown> = {}): NextRequest {
  return new NextRequest("http://localhost:3000/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-real-ip": "203.0.113.10",
    },
    body: JSON.stringify({
      name: "Alice Smith",
      email: "alice@example.com",
      whatsapp: "+447123456789",
      device: "Firestick",
      plan: "Free Trial Request",
      form_loaded_at: Date.now() - 5_000,
      ...body,
    }),
  });
}

describe("A-06 fraud detect requires Redis for trial provisioning", () => {
  const fetchStub = vi.fn();

  beforeEach(() => {
    fetchStub.mockReset();
    fetchStub.mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchStub);
    // HCAPTCHA_SECRET unset so the captcha gate does not fire first (A-04).
    vi.stubEnv("HCAPTCHA_SECRET", "");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("returns 503 when Upstash env vars are unset (fraud service unavailable)", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    const { POST } = await import("@/app/api/orders/route");
    const res = await POST(makeTrialRequest());
    expect(
      res.status,
      "with Upstash unset the fraud gate cannot function; trial provisioning must not proceed",
    ).toBe(503);
    const json = await res.json();
    expect(json.error).toMatch(/service|unavailable|try again/i);
  });

  it("control: does not 503 when Upstash env is present (proves the 503 is our new branch, not something else)", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");

    // The real Upstash client will try to reach the URL and fail, but the
    // dedup checks all handle throws by returning null; the important thing
    // is the status is not our new "redis_unavailable" 503.
    const { POST } = await import("@/app/api/orders/route");
    const res = await POST(makeTrialRequest({ email: "controlpath@example.com" }));
    expect(res.status).not.toBe(503);
  });
});
