// Enforces: getClientIp() cannot be tricked into returning a loopback
// address by a spoofed X-Forwarded-For, and shouldBypassIpChecks() only
// bypasses loopback in non-production.
//
// Red-first proof: this file failed before A-05 because lib/security/
// client-ip.ts did not exist and orders/route.ts:43-45 preferred XFF
// raw over x-real-ip. Security-surface audit E-02.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("A-05 getClientIp — spoof-resistant IP extraction", () => {
  it("returns null when only X-Forwarded-For carries a loopback address", async () => {
    const { getClientIp } = await import("@/lib/security/client-ip");
    const headers = new Headers({ "x-forwarded-for": "0.0.0.0" });
    expect(
      getClientIp(headers),
      "an attacker's spoofed X-Forwarded-For: 0.0.0.0 must not be accepted as a client IP",
    ).toBeNull();
  });

  it("prefers x-real-ip over X-Forwarded-For when both are set", async () => {
    const { getClientIp } = await import("@/lib/security/client-ip");
    const headers = new Headers({
      "x-real-ip": "203.0.113.5",
      "x-forwarded-for": "0.0.0.0, 198.51.100.10",
    });
    expect(getClientIp(headers)).toBe("203.0.113.5");
  });

  it("falls through XFF list to the first non-loopback entry", async () => {
    const { getClientIp } = await import("@/lib/security/client-ip");
    const headers = new Headers({
      "x-forwarded-for": "0.0.0.0, 127.0.0.1, 198.51.100.10, 203.0.113.5",
    });
    expect(getClientIp(headers)).toBe("198.51.100.10");
  });

  it("returns null when no header carries an IP at all", async () => {
    const { getClientIp } = await import("@/lib/security/client-ip");
    expect(getClientIp(new Headers())).toBeNull();
  });

  it("ignores x-real-ip when it carries a loopback (mis-configured proxy or local dev)", async () => {
    const { getClientIp } = await import("@/lib/security/client-ip");
    const headers = new Headers({ "x-real-ip": "127.0.0.1" });
    expect(getClientIp(headers)).toBeNull();
  });
});

describe("A-05 shouldBypassIpChecks — loopback bypass gated on NODE_ENV", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllEnvs());

  it("bypasses loopback in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { shouldBypassIpChecks } = await import("@/lib/security/client-ip");
    expect(shouldBypassIpChecks("127.0.0.1")).toBe(true);
    expect(shouldBypassIpChecks("0.0.0.0")).toBe(true);
  });

  it("does NOT bypass loopback in production — the E-02 attack path", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { shouldBypassIpChecks } = await import("@/lib/security/client-ip");
    expect(
      shouldBypassIpChecks("0.0.0.0"),
      "a spoofed 0.0.0.0 arriving at checkFraud in production must not be a free pass",
    ).toBe(false);
    expect(shouldBypassIpChecks("127.0.0.1")).toBe(false);
    // Control: real IPs are never bypassed regardless of NODE_ENV.
    expect(shouldBypassIpChecks("203.0.113.5")).toBe(false);
  });
});
