---
name: honest-health-status
description: A health probe reports one of unknown | ok | degraded | stale. The union is a type, not a discipline — the compiler must refuse to render an age when there is none. Precedence is stale > degraded > ok. Retry once on transient failure. Serve a status page, not a client-side badge. Records expire; a missing probe report says so, does not fall back to "ok".
---

# Never conflate unknown with ok

The tempting shortcut, when a probe cannot answer, is to return `{ status: "ok", checks: [] }`. That reads as "everything's fine" to the page consuming it. It is the same class of defect as "a 404 during a provider outage" — a confident, complete-looking answer over incomplete information. The fix is to make the compiler refuse it.

## Rules

1. **A discriminated union, not a boolean.** Four states:
   - `ok` — probe ran within the freshness window; all checks passed.
   - `degraded` — probe ran within the freshness window; one or more checks failed.
   - `stale` — probe record older than the freshness window (job may have stopped).
   - `unknown` — no probe record exists, or the store could not be read.
2. **Ages exist only inside branches that have them.** `unknown.ageSeconds` must be a compile error. TypeScript makes this trivial; a hand-rolled JSON doesn't. Use the language.
3. **Precedence: stale > degraded > ok.** An old record is a statement about the probe, not the site. `ok` from three days ago is worse than `degraded` from a minute ago; the reader learns nothing from a fresh green and something specific from a fresh amber.
4. **Retry once on failure.** The probe fires on every deploy; a cold edge answers thin. A byte floor trip on the first request is a suspicion, not a fact. A failure that survives the second call is a fact. Retry cost: one request per failing route, on failure only. Retrying every route doubles the cost of the common case to fix a rare one.
5. **Status *page*, not badge.** A badge on every page puts a client fetch on the LCP path; `/api/health` is `force-dynamic` `no-store` so it cannot be edge-cached. Every page view then becomes a real round trip. Also: three of the four states are bad news, so if the scheduled job stops, the badge would read "unknown" everywhere forever.
6. **Records expire (e.g. 48h).** When the scheduler stops, the record dies with it; the page says "unknown", it does not leave the last success on display.
7. **No caching on the status page.** A cached "ok" is about the cache, not the site.
8. **Do not alert on the probe.** Alert on production 5xx rates or user-facing errors. A probe report is what the *reader* looks at when they suspect something; production monitoring is what wakes the on-call. Two different needs; do not conflate.
9. **A `stale` state must include the age.** The reader wants "how stale, how much do I trust this".

## The one-file implementation

```ts
// lib/health/probe.ts
export type HealthReport =
  | { status: "unknown"; reason: string; checks: [] }
  | { status: "stale"; ageSeconds: number; staleAfterSeconds: number; checks: Check[] }
  | { status: "ok"; ageSeconds: number; checks: Check[] }
  | { status: "degraded"; ageSeconds: number; checks: Check[] }

interface Check { name: string; ok: boolean; status: number; bytes: number; detail?: string }

const STALE_AFTER = 3 * 60 * 60                            // 3h — an hour or two grace over the schedule
const RECORD_TTL = 48 * 60 * 60                            // 48h — after this the record disappears

export async function readHealth(): Promise<HealthReport> {
  const store = redis()
  if (!store) return { status: "unknown", reason: "No Redis configured.", checks: [] }
  let record: ProbeRecord | null
  try { record = await store.get<ProbeRecord>(KEY) } catch {
    return { status: "unknown", reason: "Redis did not answer.", checks: [] }
  }
  if (!record) return { status: "unknown", reason: "No probe has run yet, or its record has expired.", checks: [] }

  const ageSeconds = Math.floor((Date.now() - record.at) / 1000)
  if (ageSeconds > STALE_AFTER)
    return { status: "stale", ageSeconds, staleAfterSeconds: STALE_AFTER, checks: record.checks }
  const anyFailed = record.checks.some(c => !c.ok)
  return { status: anyFailed ? "degraded" : "ok", ageSeconds, checks: record.checks }
}
```

```ts
// scripts/probe-routes.mjs (retry once on failure)
async function probeOnce(url) { /* fetch with 45s abort, return { ok, status, bytes, detail } */ }
async function probe(url) {
  const first = await probeOnce(url)
  if (first.ok) return { ...first, note: undefined }
  await new Promise(r => setTimeout(r, Number(process.env.PROBE_RETRY_DELAY_MS ?? 5_000)))
  const second = await probeOnce(url)
  return second.ok
    ? { ...second, note: "recovered on retry" }
    : second                                                // report the real failure, not the retry
}
```

## Verification

- **Union enforced by the compiler.** Try to `report.ageSeconds` inside the `unknown` branch — it must not compile.
- **Retry: both directions.** A failing route that recovers on the second attempt is reported `ok=true, note="recovered on retry"`; a route that fails both times is `ok=false, detail="<real failure>"`. The retry cost per healthy run is exactly one request per route.
- **Precedence.** Set a record with `ok` checks but `ageSeconds > STALE_AFTER` — the page reads "Probe stale", not "Operational".
- **Store outage.** Mock Redis unreachable — page reads "Unknown", never "Operational".
- **Missing record.** Delete the record — page reads "Unknown", explains why.

## Anti-patterns

- Returning `{ status: "ok", checks: [] }` when Redis is unreachable.
- `report.ageSeconds ?? 0` — the fallback erases the distinction the whole type exists for.
- A status badge in the footer.
- Caching `/api/health`.
- Alerting on the probe.
- One retry loop for every route (doubles the healthy-run cost).
- Records without TTL (indefinite last-success).

## Related

- `api-fault-vs-absence` — same philosophy at the L4 layer.
- `documentation-discipline` — the status page is written down; the probe schedule is a scheduled task in a repo, not a person's calendar.
- `daily-dependency-audit` — the "advisories arrive on their own schedule" companion.
