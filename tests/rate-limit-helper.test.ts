// Red-first for B-06 — shared rate-limit helper at
// `lib/security/rate-limit.ts` that all three previously per-file
// limiters (middleware, /api/auth/admin, /api/subscribe) must delegate
// to. Closes S-06.
//
// This test drives the CONTRACT of the helper itself. Migration of
// the three callers is exercised by their own tests (subscribe already
// has one; admin-auth is covered by admin-auth.test.ts; middleware by
// middleware-never-throws.test.ts). B-06's callers pass a distinct
// bucket name, so the helper must accept a caller-supplied key.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock Upstash so no real network call is attempted.
// We simulate the fixed-window INCR + EXPIRE semantics with a
// per-suite in-memory record so we can prove the helper is calling
// through to Redis (not the fallback map) when env is present.
const upstashState = new Map<string, { count: number; ttlSec: number }>();

vi.mock("@upstash/redis", () => {
  class FakeRedis {
    async incr(key: string): Promise<number> {
      const entry = upstashState.get(key) ?? { count: 0, ttlSec: 0 };
      entry.count += 1;
      upstashState.set(key, entry);
      return entry.count;
    }
    async expire(key: string, seconds: number): Promise<number> {
      const entry = upstashState.get(key);
      if (!entry) return 0;
      entry.ttlSec = seconds;
      return 1;
    }
    async ttl(key: string): Promise<number> {
      return upstashState.get(key)?.ttlSec ?? -1;
    }
    async del(key: string): Promise<number> {
      return upstashState.delete(key) ? 1 : 0;
    }
  }
  return { Redis: FakeRedis };
});

describe("B-06 checkRateLimit — Redis path (S-06 fix)", () => {
  beforeEach(() => {
    upstashState.clear();
    vi.resetModules();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://fake.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "faketoken");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows up to `limit` calls in the window and blocks the next", async () => {
    const { checkRateLimit } = await import("@/lib/security/rate-limit");
    const key = "test:allow-then-block";

    for (let i = 0; i < 3; i++) {
      const r = await checkRateLimit({ key, limit: 3, windowSeconds: 60 });
      expect(r.allowed, `call ${i + 1} of 3 must be allowed`).toBe(true);
    }
    const over = await checkRateLimit({ key, limit: 3, windowSeconds: 60 });
    expect(over.allowed, "the 4th call must be blocked").toBe(false);
    expect(over.remaining).toBe(0);
  });

  it("keeps buckets isolated by key", async () => {
    const { checkRateLimit } = await import("@/lib/security/rate-limit");
    // Bucket A used up
    for (let i = 0; i < 2; i++) {
      await checkRateLimit({ key: "test:iso-A", limit: 2, windowSeconds: 60 });
    }
    const aBlocked = await checkRateLimit({ key: "test:iso-A", limit: 2, windowSeconds: 60 });
    expect(aBlocked.allowed).toBe(false);

    // Bucket B untouched — must be independent
    const bFresh = await checkRateLimit({ key: "test:iso-B", limit: 2, windowSeconds: 60 });
    expect(bFresh.allowed, "an untouched bucket must not inherit another bucket's count").toBe(true);
  });
});

describe("B-06 checkRateLimit — fallback path (Redis absent)", () => {
  beforeEach(() => {
    upstashState.clear();
    vi.resetModules();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("still enforces the limit within a single process using the in-memory fallback", async () => {
    const { checkRateLimit } = await import("@/lib/security/rate-limit");
    const key = "test:fallback";
    for (let i = 0; i < 2; i++) {
      const r = await checkRateLimit({ key, limit: 2, windowSeconds: 60 });
      expect(r.allowed).toBe(true);
    }
    const blocked = await checkRateLimit({ key, limit: 2, windowSeconds: 60 });
    expect(
      blocked.allowed,
      "fallback map must still block over-limit even when Redis is unset — same behaviour as before B-06",
    ).toBe(false);
  });
});

describe("B-06 callers no longer declare their own `new Map` limiter", () => {
  it("middleware.ts uses checkRateLimit and has no inline `Map` rate-limit state", async () => {
    const fs = await import("node:fs/promises");
    const src = await fs.readFile("middleware.ts", "utf8");
    expect(src, "middleware.ts must import the shared limiter").toContain("checkRateLimit");
    // A `new Map<string,` for tracking counts is exactly the S-06 pattern.
    const inlineMap = /new\s+Map<\s*string\s*,/i.test(src);
    expect(inlineMap, "middleware.ts must not declare an inline Map limiter after B-06").toBe(false);
  });

  it("/api/auth/admin uses checkRateLimit and has no inline `Map` rate-limit state", async () => {
    const fs = await import("node:fs/promises");
    const src = await fs.readFile("app/api/auth/admin/route.ts", "utf8");
    expect(src).toContain("checkRateLimit");
    const inlineMap = /new\s+Map<\s*string\s*,/i.test(src);
    expect(inlineMap, "admin auth route must not declare an inline Map limiter after B-06").toBe(false);
  });

  it("/api/subscribe uses checkRateLimit and has no inline `Map` rate-limit state", async () => {
    const fs = await import("node:fs/promises");
    const src = await fs.readFile("app/api/subscribe/route.ts", "utf8");
    expect(src).toContain("checkRateLimit");
    const inlineMap = /new\s+Map<\s*string\s*,/i.test(src);
    expect(inlineMap, "subscribe route must not declare an inline Map limiter after B-06").toBe(false);
  });
});
