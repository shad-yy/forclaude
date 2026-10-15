---
name: two-layer-rate-limiting
description: Any site that fronts a third-party quota needs two limiters, not one. Inbound per-IP (protects your CPU and your quota against readers) and outbound shared budget per provider (protects the upstream from every serverless instance combined). They must not share a counter. Also covers 429 response shape, cache rules, and Redis fail-open behaviour.
---

# Two limiters, one goal

Serverless deployments amplify quota problems: every instance can hit the same provider in parallel, and a per-instance in-memory counter enforces nothing. You need:

- **Inbound** — per-IP fixed window in Redis. Protects your CPU and prevents a single reader from consuming your provider quota by walking a list.
- **Outbound** — shared budget per provider in Redis, keyed by window bucket. Every serverless instance shares one counter. Protects the provider from the site as a whole.

Sharing a single limiter for both is how a proxy route with a 60/min per-IP limit routed ten callers at 600/min against a provider allowing 25/min.

## Incidents

**A-01a.** `app/api/thesportsdb/[...path]/route.ts` limited each caller to 60/min and called `fetch` directly. It never consulted the outbound budget. The route's comment argued this was fine "because almost every request is served from the edge cache" — true for one caller, wrong for many. The route was also the client-side base URL, so all browser traffic bypassed the ceiling.

**A-01b.** `fdFetch` never called `claimUpstreamCall("football-data")`, so a declared 10/min budget was never enforced.

**PORTFOLIO:276.** `unified-sports-api.ts` called `claimUpstreamCall` in a place that should have peeked, decrementing one quota from two places per request.

**Production run 2026-09-03.** 150 requests in 6 seconds against a detail-limited route: 120 admitted (returned 404, because the route depended on a provider with no key), 30 rejected as 429 with `Retry-After: 24`. `no-store` on the 429 is load-bearing: a cached 429 at a CDN edge would lock every user through that node.

## Rules

1. **Inbound**: keyed by caller IP; two tiers minimum — `detail` (higher, e.g. 120/min) and `search` (lower, e.g. 30/min). Fixed window in Redis: INCR + EXPIRE on first-set.
2. **Outbound**: keyed by `budget:<provider>:<bucketStart>`. Every instance shares it. Set the ceiling *below* the provider's free-tier number to leave headroom (e.g. 25 against 30/min).
3. **Peek vs claim**. `claim` decrements; `peek` reads without decrement. Never call `claim` from a *fallback selector* — the underlying client will claim again and you'll pay twice. Use `peek` to decide which branch to try; the client that actually fires the request claims.
4. **429 shape** — the response is safety-critical:
   - `Cache-Control: no-store` (a cached 429 at an edge is a regional outage)
   - `Retry-After: <seconds>`
   - `X-RateLimit-Limit: N` and `X-RateLimit-Remaining: 0`
   - JSON body with a specific error code, not "Bad Request"
5. **Fail open** on Redis outage. A store outage should degrade to previous behaviour (unlimited but functional), not take the site down. Fail-closed is only correct for authentication, never for rate limiting.
6. **Never cache 429**. Not with `s-maxage`, not with SWR. Ever.
7. **Rate limit is per IP not per caller.** In a serverless environment your handler has no identity beyond the request headers; the IP is the closest thing to a caller.

## Implementation

```ts
// lib/rate-limit.ts
const SEARCH = { limit: 30, window: 60 }
const DETAIL = { limit: 120, window: 60 }

export async function checkRateLimit(callerKey: string, limit: number, windowS: number) {
  const store = redis()
  if (!store) return { ok: true, remaining: limit }         // fail open
  const bucket = Math.floor(Date.now() / (windowS * 1000))
  const key = `rl:${callerKey}:${bucket}`
  try {
    const used = await store.incr(key)
    if (used === 1) await store.expire(key, windowS)
    if (used > limit) return { ok: false, remaining: 0, resetsIn: windowS - (Date.now()/1000) % windowS }
    return { ok: true, remaining: limit - used }
  } catch { return { ok: true, remaining: limit } }          // fail open
}
```

```ts
// lib/upstream-budget.ts
const BUDGETS = { thesportsdb: { limit: 25, window: 60 }, tmdb: { limit: null, window: 60 } }

export async function claimUpstreamCall(source: keyof typeof BUDGETS) {
  const cfg = BUDGETS[source]
  if (cfg.limit == null) return { available: true }         // no budget on this provider
  const store = redis()
  if (!store) return { available: true }                    // fail open
  const bucket = Math.floor(Date.now() / (cfg.window * 1000))
  const key = `budget:${source}:${bucket}`
  const used = await store.incr(key)
  if (used === 1) await store.expire(key, cfg.window)
  if (used > cfg.limit) return { available: false, resetsIn: cfg.window }
  return { available: true }
}

export async function peekUpstreamBudget(source: keyof typeof BUDGETS) { /* GET only */ }
```

```ts
// L3 handler
const limit = await checkRateLimit(callerKey(req.headers), DETAIL.limit, DETAIL.window)
if (!limit.ok) return NextResponse.json(
  { error: "rate_limited" },
  { status: 429, headers: {
    "Cache-Control": "no-store",
    "Retry-After": String(Math.ceil(limit.resetsIn)),
    "X-RateLimit-Limit": String(DETAIL.limit),
    "X-RateLimit-Remaining": "0",
  }},
)
const budget = await claimUpstreamCall("thesportsdb")
if (!budget.available) return /* same 429 shape */
```

## Verification

- **Concurrency test**: fire `limit + K` parallel requests. Assert exactly `limit` × 2xx and `K` × 429. This is the property the constant enforces; a "limit works" claim without a concurrency test is unproven.
- **Module-spy test — proxy claims budget**. Mock `claimUpstreamCall` and `fetch`; assert the handler calls `claim("provider")` before `fetch` and once per outbound. Assert `fetch` is not called when claim returns unavailable.
- **Cache header test**. Assert the 429 response carries `Cache-Control: no-store` (a header, not the body, is the failure mode you cannot see locally).
- **Fail-open test**. Mock Redis unreachable; assert the guard resolves `available: true` and the route proceeds.

## Anti-patterns

- One limiter that "protects both".
- Per-instance counter (Map, in-memory) in serverless.
- 429 with `Cache-Control: s-maxage=...`.
- Fail-closed on Redis outage.
- Claiming in a peek-and-select flow, so one request debits twice.
- Naming a limit `RATE_LIMIT_PER_MINUTE = 60` and assuming this is per-*site*.

## Related

- `api-fault-vs-absence` — a 429 from an upstream is a fault to *this* request, but not to the site.
- `stale-while-revalidate-cache` — the cache pauses its background revalidation on 429.
- `honest-health-status` — a 429 storm is a distinct degraded state.
