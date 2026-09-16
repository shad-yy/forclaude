// Enforces: /api/subscribe rate-limits per IP, not per email.
//
// Red-first (B-07): failed before the fix — rate limiter keyed on
// `validEmail`, so an attacker sending 1000 different email addresses
// from the same IP in a minute paid no per-request cost. Structural
// anti-pattern S-07.
//
// Follow-up: this still uses an in-memory Map, which is per-serverless-
// instance and shares the S-06 illusory-ceiling problem. That's a
// separate Redis-consolidation task (B-06) — B-07 is narrowly the
// key change.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

function makeSubscribeRequest(email: string, ip: string): Request {
  return new Request("http://localhost:3000/api/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-real-ip": ip,
    },
    body: JSON.stringify({ email }),
  });
}

describe("B-07 /api/subscribe rate-limit keyed on IP not email", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("blocks a second request from the same IP within the window even with a different email", async () => {
    const { POST } = await import("@/app/api/subscribe/route");
    const first = await POST(makeSubscribeRequest("alice@example.com", "203.0.113.20"));
    expect(first.status, "first request must succeed for this assertion to discriminate").toBe(200);

    const second = await POST(makeSubscribeRequest("bob@example.com", "203.0.113.20"));
    expect(
      second.status,
      "a second submission from the same IP inside the 60s window must be rate-limited, no matter the email",
    ).toBe(429);
  });

  it("allows independent requests from DIFFERENT IPs with DIFFERENT emails (control that the limiter isn't a no-op)", async () => {
    const { POST } = await import("@/app/api/subscribe/route");
    const first = await POST(makeSubscribeRequest("carol@example.com", "203.0.113.21"));
    expect(first.status).toBe(200);

    const different = await POST(makeSubscribeRequest("dave@example.com", "203.0.113.22"));
    expect(
      different.status,
      "an unrelated caller must not be blocked by the first caller's cooldown",
    ).toBe(200);
  });
});
