---
name: stale-while-revalidate-cache
description: Serving the last known answer, labelled, is often more honest than serving no answer. Redis TTL is deliberately longer than the logical TTL — the logical TTL decides when to revalidate; the Redis TTL decides when to give up on the record entirely. Pause the revalidation queue on 429. Never cache 429s. Never cache faults.
---

# Stale-while-revalidate with a grace period

The cache serves three purposes: performance, quota conservation, and continuity. The last is the underappreciated one — a cache that keeps last-known content during a provider outage is often the site's whole degradation strategy.

## Rules

1. **Two TTLs, not one.** The logical TTL (`ttlSeconds`) says when a value is fresh. The Redis TTL (`ttlSeconds + graceSeconds`) says when the record disappears. In between, the value is *stale-but-serveable*: return it and revalidate in the background.
2. **Never cache a 429.** Not with `s-maxage`, not with SWR, not with edge cache. A cached 429 at a CDN edge locks every user routed through that node into a regional rate-limit outage.
3. **Never cache a fault.** A 500, a network error, a timeout is not a legitimate cache value. The client sees the fault; the cache carries the previous *good* value.
4. **The revalidation queue pauses on 429.** Not "retries with backoff" — pauses. Retrying under a rate limit is how you stay rate-limited; waiting out the minute is how you recover.
5. **A cache entry declares its source and its age.** The consumer (page component) decides whether to render "fresh" or "last known" — the cache does not lie by omission.
6. **Fail open on Redis outage.** A cache miss is the correct answer when the store is gone; the client behaves as it does for any first request.
7. **Content-hash keys, not URL-only keys.** The same URL under a different auth token or locale is a different answer. Include what makes the answer different in the key.
8. **On write, set TTL atomically.** `SET key value EX <ttl>` (or SET NX EX). Never SET-then-EXPIRE — a crash between the two leaves an eternal record.

## Implementation

```ts
// lib/cache.ts
interface Cached<T> { value: T; at: number; source: string }
const LOGICAL_TTL = 300     // 5 minutes: after this, revalidate in background
const GRACE_TTL   = 1800    // 30 minutes: after this, drop the record entirely

export async function swrGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  source: string,
): Promise<{ value: T; age: number; stale: boolean }> {
  const store = redis()
  if (!store) return { value: await fetcher(), age: 0, stale: false }   // fail open

  const cached = await store.get<Cached<T>>(key).catch(() => null)
  if (cached) {
    const age = Math.floor((Date.now() - cached.at) / 1000)
    if (age < LOGICAL_TTL) return { value: cached.value, age, stale: false }
    // Stale but serveable — return and revalidate in the background.
    queueMicrotask(() => revalidate(key, fetcher, source).catch(() => {}))
    return { value: cached.value, age, stale: true }
  }

  // Cold miss.
  const fresh = await fetcher()
  await store.set(key, { value: fresh, at: Date.now(), source }, { ex: LOGICAL_TTL + GRACE_TTL }).catch(() => {})
  return { value: fresh, age: 0, stale: false }
}

async function revalidate<T>(key: string, fetcher: () => Promise<T>, source: string) {
  if (revalidationPausedUntil > Date.now()) return              // paused on 429
  try {
    const fresh = await fetcher()
    await redis()!.set(key, { value: fresh, at: Date.now(), source }, { ex: LOGICAL_TTL + GRACE_TTL })
  } catch (e) {
    if (e instanceof RateLimitError) {
      revalidationPausedUntil = Date.now() + 60_000              // pause the whole queue
    }
    // Never write on fault; leave the last good value in place.
  }
}
```

```ts
// L3 route — declares source and age
const { value, age, stale } = await swrGet(cacheKey, () => provider.getX(id), "thesportsdb")
return NextResponse.json({ data: value, age, source: "thesportsdb", stale }, {
  status: 200,
  headers: {
    "Cache-Control": stale ? "public, s-maxage=60, must-revalidate" : "public, s-maxage=300",
    "X-Source": "thesportsdb",
    "X-Age": String(age),
    "X-Stale": stale ? "1" : "0",
  },
})
```

## Verification

- **Stale-still-serves.** Test writes a cache entry with `at = Date.now() - LOGICAL_TTL - 60_000`; asserts `swrGet` returns the value with `stale: true` and revalidates in the background.
- **Fault-does-not-clobber.** Test writes a good value; makes the fetcher throw; asserts `swrGet` returns the good value, does not overwrite.
- **429 pauses.** Test writes a good value; makes the fetcher throw `RateLimitError`; asserts revalidation queue is paused for the window, and subsequent stale reads do not re-invoke the fetcher.
- **Redis outage fails open.** Test mocks Redis unreachable; asserts `swrGet` invokes the fetcher and returns its result with `age: 0`.
- **No 429 ever cached.** Assert `Cache-Control` header on a 429 response is `no-store`.

## Anti-patterns

- One TTL — no grace window, so every miss is a cold call.
- SET-then-EXPIRE without a pipeline (eternal record on crash).
- Retrying under 429 with exponential backoff.
- Caching a fault (a 500 becomes cached "content").
- URL-only key when the response varies by header (locale, auth).
- No age on the response — the consumer cannot decide freshness.
- `Cache-Control: s-maxage` on a 429.

## Related

- `two-layer-rate-limiting` — the reason 429 pauses.
- `api-fault-vs-absence` — the reason fault does not overwrite.
- `honest-health-status` — same "declare your age" pattern.
