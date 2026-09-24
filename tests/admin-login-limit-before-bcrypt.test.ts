// Enforces: /api/auth/admin checks the per-IP login limit BEFORE running
// bcrypt, so a blocked caller cannot keep spending server CPU.
//
// bcrypt is slow by design (that is what makes guessing expensive). The
// route used to run `bcrypt.compare` first and the limiter second, so
// every refused attempt past the 10-per-5-min ceiling still cost one
// full hash.
//
// Red-first: before the fix `compare` ran 12 times for 12 attempts.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

const compare = vi.fn(async () => true);
vi.mock("bcryptjs", () => ({ default: { compare }, compare }));

function loginRequest(): NextRequest {
  return new NextRequest("https://smartlivetv.co.uk/api/auth/admin", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": "198.51.100.23" },
    body: JSON.stringify({ password: "irrelevant-bcrypt-is-mocked" }),
  });
}

describe("admin login: limiter runs before bcrypt", () => {
  beforeEach(async () => {
    vi.resetModules();
    compare.mockClear();
    vi.stubEnv("ADMIN_PASSWORD_HASH", "$2a$10$test-only-hash-bcrypt-is-mocked");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const { _resetForTests } = await import("@/lib/security/rate-limit");
    _resetForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("attempts 11 and 12 get 429 without running bcrypt", async () => {
    const { POST } = await import("@/app/api/auth/admin/route");
    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) statuses.push((await POST(loginRequest())).status);

    expect(statuses.slice(10)).toEqual([429, 429]);
    expect(compare, "refused attempts must not spend a bcrypt hash").toHaveBeenCalledTimes(10);
  });
});
