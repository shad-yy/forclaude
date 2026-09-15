// Enforces: /api/orders trial requests are rejected when HCAPTCHA_SECRET
// is configured but the client did not send a valid captchaToken.
//
// Red-first proof: this file failed 2/2 before the fix — the request
// with no token returned 200 (or 429 from fraud) instead of 403.
// See memory-bank/QA-LOG.md A-04 and audit finding E-01 (hCaptcha
// decorative: TrialForm sends captchaToken but orderSchema stripped it,
// and no siteverify call existed anywhere).

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

// Prevent live provisioning + email from firing during auth-gate tests.
vi.mock("@/lib/panel/cms8k", () => ({
  createTrialAccount: vi.fn(async () => ({ success: false, error: "mocked" })),
}));
vi.mock("@/lib/db/customers", () => ({
  createCustomer: vi.fn(async () => ({ id: "cust_test_1" })),
  getCustomerByEmail: vi.fn(async () => null),
  updateCustomer: vi.fn(async () => {}),
}));

function makeTrialRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Alice Smith",
      email: "alice@example.com",
      whatsapp: "+447123456789",
      device: "Firestick",
      plan: "Free Trial Request",
      form_loaded_at: Date.now() - 5_000, // past the 1.5s bot-speed floor
      ...body,
    }),
  });
}

describe("A-04 hCaptcha server-side verification", () => {
  const fetchStub = vi.fn();

  beforeEach(() => {
    fetchStub.mockReset();
    vi.stubGlobal("fetch", fetchStub);
    vi.stubEnv("HCAPTCHA_SECRET", "test-hcaptcha-secret");
    // Ensure fraud checks do not short-circuit on Redis for these tests.
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("rejects a trial with a missing captchaToken when HCAPTCHA_SECRET is set", async () => {
    // Any outbound fetch that fires would be to siteverify or Resend — we
    // do not want either. Fail loudly if the route tries.
    fetchStub.mockImplementation((url: any) => {
      throw new Error(`no outbound fetch expected on missing-token path, got: ${url}`);
    });

    const { POST } = await import("@/app/api/orders/route");
    const res = await POST(makeTrialRequest({}));
    expect(
      res.status,
      "a trial request with no captchaToken must be rejected 403 when HCAPTCHA_SECRET is set",
    ).toBe(403);
  });

  it("rejects a trial when siteverify says success=false", async () => {
    fetchStub.mockImplementation(async (url: any) => {
      const u = typeof url === "string" ? url : String(url);
      if (u.includes("hcaptcha.com/siteverify")) {
        return new Response(JSON.stringify({ success: false }), { status: 200 });
      }
      throw new Error(`no other outbound fetch expected on this path, got: ${u}`);
    });

    const { POST } = await import("@/app/api/orders/route");
    const res = await POST(makeTrialRequest({ captchaToken: "bad-token" }));
    expect(res.status).toBe(403);
  });

  it("does not enforce captcha when HCAPTCHA_SECRET is unset (dev/CI mode)", async () => {
    vi.stubEnv("HCAPTCHA_SECRET", "");
    // Any outbound fetch (e.g. Resend, cms8k) is fine; the point is we do
    // NOT return 403 for missing token when HCAPTCHA_SECRET is empty.
    fetchStub.mockResolvedValue(new Response("{}", { status: 200 }));

    const { POST } = await import("@/app/api/orders/route");
    const res = await POST(makeTrialRequest({}));
    expect(
      res.status,
      "with HCAPTCHA_SECRET unset, request should not 403 on missing captchaToken",
    ).not.toBe(403);
  });
});
