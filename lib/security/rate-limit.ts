// B-06 — one Redis-backed fixed-window rate limiter for all
// per-IP gating on this app. Retires the three per-file `new Map`
// limiters that were the S-06 anti-pattern (illusory ceilings — each
// serverless instance had its own map, so the "5 per 15 min" the
// middleware promised meant 5 × <instances>).
//
// Uses `@upstash/redis` (fetch-based; safe in edge middleware).
// Falls back to a per-process in-memory Map ONLY when Upstash env
// vars are unset — same behaviour the three call sites had before,
// but centralised, so dev/keyless CI still enforces limits within one
// process. In production Upstash env vars MUST be set (see
// `SETUP-REQUIRED.md`); if they aren't, the fallback still blocks
// abuse from within one lambda but does not stop cross-instance
// spread.

import { Redis } from "@upstash/redis";

export interface RateLimitInput {
  /** Full key including a caller-owned bucket prefix (e.g. `subscribe:1.2.3.4`). */
  key: string;
  /** Max allowed events per window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** How many more events fit in the current window (0 when `allowed=false`). */
  remaining: number;
}

let redis: Redis | null = null;
let redisWarnedOnce = false;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (!redisWarnedOnce) {
      redisWarnedOnce = true;
      console.warn(
        "[RateLimit] UPSTASH_REDIS_REST_URL/TOKEN unset — falling back to per-instance in-memory limits. Cross-instance ceilings will be illusory (S-06).",
      );
    }
    return null;
  }
  redis = new Redis({ url, token });
  return redis;
}

// Per-process fallback. Entries are lazily expired on read.
const fallback = new Map<string, { count: number; resetAt: number }>();

function checkFallback(input: RateLimitInput): RateLimitResult {
  const now = Date.now();
  const entry = fallback.get(input.key);
  if (!entry || entry.resetAt <= now) {
    fallback.set(input.key, { count: 1, resetAt: now + input.windowSeconds * 1000 });
    return { allowed: true, remaining: Math.max(0, input.limit - 1) };
  }
  entry.count += 1;
  if (entry.count > input.limit) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: Math.max(0, input.limit - entry.count) };
}

export async function checkRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const client = getRedis();
  if (!client) return checkFallback(input);

  try {
    const count = await client.incr(input.key);
    if (count === 1) {
      // First hit of the window — set the expiry. If EXPIRE fails the
      // key would live forever, so we tolerate a re-set on any early hit.
      await client.expire(input.key, input.windowSeconds);
    }
    if (count > input.limit) {
      return { allowed: false, remaining: 0 };
    }
    return { allowed: true, remaining: Math.max(0, input.limit - count) };
  } catch (err) {
    // Never let a Redis outage turn into a 500 at a route that only
    // wanted rate limiting. Degrade to the per-process fallback so a
    // burst inside one lambda is still capped. `fail-open` on cross-
    // instance is the accepted cost of a control-plane outage.
    console.warn("[RateLimit] Upstash INCR/EXPIRE failed — using in-memory fallback for this request:", err);
    return checkFallback(input);
  }
}

// Test-only helper — clears both fallback and warning state so a test
// suite can drive a clean start. Not exported from a public entry.
export function _resetForTests(): void {
  fallback.clear();
  redisWarnedOnce = false;
  redis = null;
}
