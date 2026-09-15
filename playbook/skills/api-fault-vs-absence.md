---
name: api-fault-vs-absence
description: Distinguish provider failure from genuine emptiness. Rethrow faults; return null/[] only when the upstream answers and legitimately has nothing. Reserve 404 for "we have nothing to say about this", never for "we could not reach the provider". Applies to any site whose content depends on third-party APIs.
---

# The single most important rule on an API-driven site

An error must never look like an absence. Two states carry different meaning and different consequences:

- **Absence** — the provider answered and there is no record. Show empty state; a page for that entity may or may not exist.
- **Fault** — the provider is unreachable or misbehaving. The truthful answer is *"we cannot tell right now"*, not *"there is nothing"*.

Collapsing them is how a five-minute outage becomes a **weeks-long deindexing**, because Google reads `404` as "this page is gone" and stops crawling it.

## The incidents this rule exists to prevent

**T-ENV-21.** With `TMDB_API_KEY` absent, every `/where-to-watch/*` page returned 404. `resolveCountry` returned `null` — and so `notFound()` — when the TMDB region list came back empty. That list ended `if (!data?.results) return []`, so a missing key, a timeout and a 429 were byte-identical to a genuinely empty list. A TMDB outage on a cold cache erased the whole route family.

**F-01/F-02.** `getFixture` caught every error and returned `null`. Pages turned null into `notFound()`. A single provider hiccup 404'd the match page. `getLeagues` used `Promise.allSettled` and returned `[]` on total outage, 404'ing every league page at once.

**D-01b.** `/api/events/[id]/stats` returned HTTP 200 with `{ data: [], error }` when the upstream faulted. The component read `statsJson.data` and rendered *"No match statistics available. Statistics will be available during or after the match."* — a confident, complete-looking claim about a normal future state, asserted during a live outage.

## The rule, precisely

1. **Provider clients** rethrow on fault. Define `UpstreamFaultError extends Error`. A 5xx, a network error, a timeout, a DNS failure becomes a thrown error. A 200-with-empty is not a fault. A 404 from the provider is an absence for that entity, not a fault.
2. **Client resolvers** must not swallow the fault: no `catch { return [] }` and no `Promise.allSettled` that returns `[]` when everything settled to rejection. Rethrow, or fall back to another source; do not turn a total outage into "nothing".
3. **Pages** turn `null` into `notFound()` only for absence. On a fault: serve owned data ("last known", "we could not check just now"), or another provider. Never 404.
4. **API routes** must not answer HTTP 200 with an error field. Use a semantic status. 502/503 for fault; 200 with an *empty* payload only for genuine emptiness.
5. **Client-side `fetch` consumers** check `res.ok` **and** any `.error` field before rendering an "empty" state. Reading only `.data` makes fault and absence indistinguishable.
6. **Static and page components never call providers directly.** Everything the provider client does — quota budget, retry, cache, fault memo, fault vs absence — lives in the client. A page calling `fetch` against a provider host gets none of it.

## Implementation

```ts
class UpstreamFaultError extends Error {
  constructor(public endpoint: string, public status: number, public detail?: string) {
    super(`${endpoint}: ${status} ${detail ?? ""}`)
    this.name = "UpstreamFaultError"
  }
}

async function providerFetch<T>(endpoint: string): Promise<T[]> {
  const res = await fetch(url(endpoint), { headers, signal })
  if (res.status === 429) throw new RateLimitError(endpoint)
  if (res.status === 404) return []                   // genuine absence
  if (!res.ok || res.status === 0) throw new UpstreamFaultError(endpoint, res.status)
  const body = await res.json().catch(() => null)
  if (!body || typeof body !== "object") throw new UpstreamFaultError(endpoint, res.status, "malformed")
  return body.results ?? []
}
```

```tsx
const page = await unifiedApi.getPage(slug)
if (page === null) notFound()                          // absence -> 404
// on UpstreamFaultError bubbling up: error.tsx renders owned fallback, not 404
```

## Verification

- **Unit — client rethrows on fault.** Mock `fetch` to resolve `{ ok: false, status: 500 }`. Assert `UpstreamFaultError` thrown.
- **Unit — client returns [] on 404.** Absence control.
- **Contract — resolver propagates.** Mock the client to throw; assert `unifiedApi.getX` rethrows and matching `getY` returns `null` on genuine null.
- **Component — UI does not lie during a fault.** MSW makes the network fault; assert the component does not say "no results" or "coming later".
- **Structural — no direct provider fetch.** Walk `app/**/page.tsx`, strip comments, refuse `fetch(providerHost/...)`. API routes exempt.
- **Manual — build with credentials stripped.** Every covered page still renders. Only genuinely uncovered entities 404.

## Anti-patterns

- `try { ... } catch { return [] }` in a provider client.
- `if (!data?.results) return []` — collapses 429, timeout, missing-key and empty.
- `Promise.allSettled(...).map(r => r.status === "fulfilled" ? r.value : [])`.
- API returning HTTP 200 with `{ error }` and no other signal.
- Rendering "no results", "coming later" or "nothing live" without checking `res.ok`.
- Falling back to `notFound()` on any exception path.

## Related

- `two-layer-rate-limiting` — 429 has its own shape.
- `seo-fault-tolerance` — SEO consequence of 404-on-fault.
- `honest-health-status` — status-page version of the same rule.
- `layered-testing-strategy` — how to test the discrimination.
