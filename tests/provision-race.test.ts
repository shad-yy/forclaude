// Enforces: fraud fingerprints are recorded BEFORE the outbound trial
// provision, not after. Closes the E-05 race: 30s fraud lock + provision
// that can exceed 30s + fingerprint written only on success = a lock
// expiring mid-provision lets a duplicate request slip through before
// recordFraudFingerprints has run.
//
// Red-first: fails before the fix because orders/route.ts calls
// recordFraudFingerprints from INSIDE provisionTrialAndNotify, AFTER
// createTrialAccount returns. See A-07 in memory-bank/QA-LOG.md.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

const callOrder: string[] = [];

// Track the order in which fingerprint recording and panel provisioning fire.
vi.mock("@/lib/fraud/detect", async () => {
  const actual = await vi.importActual<typeof import("@/lib/fraud/detect")>("@/lib/fraud/detect");
  return {
    ...actual,
    checkFraud: vi.fn(async () => ({ allowed: true })),
    recordFraudFingerprints: vi.fn(async () => {
      callOrder.push("recordFraudFingerprints");
    }),
    logBlockedRequest: vi.fn(async () => {}),
    isFraudInfraReady: vi.fn(() => true),
  };
});

vi.mock("@/lib/panel/cms8k", () => ({
  createTrialAccount: vi.fn(async () => {
    callOrder.push("createTrialAccount");
    return {
      success: true,
      username: "SLTV_alice_4821",
      credentials: {
        username: "SLTV_alice_4821",
        password: "fake",
        server: "http://example.test",
        m3uUrl: "http://example.test/m3u",
        expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      },
    };
  }),
}));

vi.mock("@/lib/db/customers", () => ({
  createCustomer: vi.fn(async () => ({ id: "cust_test_race" })),
  getCustomerByEmail: vi.fn(async () => null),
  updateCustomer: vi.fn(async () => {}),
}));

vi.mock("@upstash/redis", () => {
  class FakeRedis {
    async get() { return null }
    async set() { return "OK" }
    async del() { return 1 }
    async incr() { return 1 }
    async expire() { return 1 }
    async lpush() { return 1 }
    async ltrim() { return "OK" }
    pipeline() { return { set: () => this, exec: async () => [] } }
  }
  return { Redis: FakeRedis };
});

function makeTrialRequest(): NextRequest {
  return new NextRequest("http://localhost:3000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-real-ip": "203.0.113.11" },
    body: JSON.stringify({
      name: "Alice Race",
      email: "race@example.com",
      whatsapp: "+447900000001",
      device: "Firestick",
      plan: "Free Trial Request",
      form_loaded_at: Date.now() - 5_000,
    }),
  });
}

describe("A-07 provision race — fingerprint before dispatch", () => {
  beforeEach(() => {
    callOrder.length = 0;
    vi.clearAllMocks();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://test.upstash.example");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    vi.stubEnv("CMS8K_API_KEY", "test-key");    // isPanelConfigured=true
    vi.stubEnv("RESEND_API_KEY", "test-resend"); // truthy so provisionTrialAndNotify fires
    vi.stubEnv("HCAPTCHA_SECRET", "");
    // Stub fetch so Resend email sends inside provisionTrialAndNotify don't hit
    // the real network. createTrialAccount is already mocked above.
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("records fraud fingerprints BEFORE createTrialAccount, so a lock-expiry mid-provision cannot admit a duplicate", async () => {
    const { POST } = await import("@/app/api/orders/route");
    const res = await POST(makeTrialRequest());
    expect(res.status).toBe(200);

    // Both calls must have fired.
    expect(callOrder, "both operations must have run for this assertion to discriminate").toContain(
      "recordFraudFingerprints",
    );
    expect(callOrder).toContain("createTrialAccount");

    // Fingerprint must be first.
    const iFP = callOrder.indexOf("recordFraudFingerprints");
    const iPanel = callOrder.indexOf("createTrialAccount");
    expect(
      iFP < iPanel,
      `expected recordFraudFingerprints BEFORE createTrialAccount, got order: ${callOrder.join(" → ")}`,
    ).toBe(true);
  });
});

describe("A-07 fraud lock TTL — enough headroom for a slow provision", () => {
  it("checkFraud uses a lock TTL of >= 300 seconds (5 min) — defence in depth vs the E-05 race", async () => {
    // Read the source directly (structural assertion — the constant is
    // small and lives in one line).
    const src = (await import("node:fs")).readFileSync(
      "lib/fraud/detect.ts",
      "utf8",
    );
    const match = src.match(/const\s+lockAcquired\s*=\s*await\s+redis\.set\(\s*lockKey[^)]*ex:\s*(\d+)/);
    expect(match, "could not locate the fraud lock's TTL — the regex may need updating for a rewrite").not.toBeNull();
    const ttl = Number(match![1]);
    expect(
      ttl,
      "fraud lock TTL must be >= 300s so a slow panel provision cannot outlive it",
    ).toBeGreaterThanOrEqual(300);
  });
});
