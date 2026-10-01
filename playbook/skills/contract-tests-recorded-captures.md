---
name: contract-tests-recorded-captures
description: Boundary schemas (Zod) validate what a provider actually returns; recorded captures ensure the schema reflects reality; contract tests fail when the provider drifts. This is not Pact-style CDCT — no broker, no provider verification — but a schema+fixture pattern that catches drift without a live provider. Track the fixture in git; a cache/ file cannot be trusted.
---

# The four-line contract

For every provider the site depends on:

1. A **Zod schema** at the boundary (`lib/api/schemas/<provider>.ts`) that parses the response and returns strictly-typed rows.
2. A **recorded capture** in `tests/fixtures/` (tracked in git; not in `cache/`).
3. A **contract test** that parses the capture with the schema. It passes iff the schema still describes reality.
4. When the provider drifts, the capture is refreshed and the schema updated. The test re-passes; a diff of the schema shows what changed.

This is **not Pact**. There is no broker, no provider verification handshake, no consumer contract publication. It is a schema-plus-fixture pattern that catches drift with no live-provider dependency in CI. Call it "boundary validation" or "recorded-capture contract testing" — never "consumer-driven contract testing", which means something specific and different.

## Incidents

**strDate.** TheSportsDB's `strDate` was read as the sole date source in `app/match/[id]/page.tsx`, passed to `fixtureInstant` as though it were a `Date`. Provider returned `"YYYY-MM-DD"` most of the time, and occasionally `"YYYY-MM-DDTHH:MM:SS±HH:MM"`. Parser assumed the first. Contract test caught the second variant.

**Cache directory contract.** A contract test read a **gitignored** `cache/sportsdb/` directory. Passed locally, threw on CI (no cache). Two clear signals were missed: the fixture must be tracked, and tests must not depend on state the CI environment cannot reproduce. Fix: tracked fixture in `tests/fixtures/sportsdb-recorded-keys.json`.

**Schema too loose.** Original TMDB parser accepted `raw.title || raw.name || ""` and produced a *publishable-looking empty record*: `name: ""`, `providers: []`. Page metadata built `Where to watch ${details.name}` → "Where to watch " indexed pages. Fix: the schema returns `null` when the title has no name; page turns null into 404. Better a 404 than a nameless page indexed.

## Rules

1. **One schema per provider.** Not per endpoint; per provider. The parser owns the shape, the naming, the null-handling.
2. **Schemas parse and narrow.** Unknown fields dropped; known fields typed strictly. `.passthrough()` is a mistake.
3. **Recorded capture is tracked in git.** `tests/fixtures/*` — never `cache/`. Refresh with a script (`scripts/refresh-capture.mjs`) that a maintainer runs when the provider drifts.
4. **The fixture is the smallest sample that exercises every branch.** Not the full response; a redacted one that carries every optional field, every enum value, every edge case.
5. **The test parses; it does not assert row values.** Row values are provider content; the test cares that shape is preserved.
6. **Refreshing the capture is a diff-review event.** The maintainer confirms the changes are intentional (adds not removes; deprecations flagged) before merging.
7. **Schema drift is a fault, not a bug in the site.** Named as such. The `UpstreamFaultError` from `api-fault-vs-absence` covers it.
8. **A schema being correct does not mean the code using it is correct.** Contract tests do not replace e2e or component tests.

## Implementation

```ts
// lib/api/schemas/football-data.ts
import { z } from "zod"

export const FDStatus = z.enum(["SCHEDULED","TIMED","IN_PLAY","PAUSED","FINISHED","POSTPONED","SUSPENDED","CANCELED"])

export const FDMatchSchema = z.object({
  id: z.number(),
  utcDate: z.string().datetime(),                    // strict ISO 8601 with Z
  status: FDStatus,
  matchday: z.number().nullable(),
  homeTeam: z.object({ id: z.number(), name: z.string(), tla: z.string().length(3).nullable() }),
  awayTeam: z.object({ id: z.number(), name: z.string(), tla: z.string().length(3).nullable() }),
  score: z.object({
    winner: z.enum(["HOME_TEAM","AWAY_TEAM","DRAW"]).nullable(),
    fullTime: z.object({ home: z.number().nullable(), away: z.number().nullable() }),
  }),
})

export function parseFDMatches(raw: unknown) {
  const outer = z.object({ matches: z.array(FDMatchSchema) }).parse(raw)
  return outer.matches
}
```

```ts
// tests/football-data-contract.test.ts
import { readFileSync } from "node:fs"
import { parseFDMatches, FDMatchSchema } from "@/lib/api/schemas/football-data"

const capture = JSON.parse(readFileSync("tests/fixtures/football-data.json", "utf8"))

it("parses the recorded capture", () => {
  const rows = parseFDMatches(capture)
  expect(rows.length).toBeGreaterThan(0)                       // guard against empty fixture
  for (const row of rows) FDMatchSchema.parse(row)             // narrow-shape confirmation
})

it("exercises every branch the schema names", () => {
  // control: fixture contains at least one row per critical variant
  const statuses = new Set(parseFDMatches(capture).map(r => r.status))
  for (const required of ["SCHEDULED","FINISHED","POSTPONED"] as const) {
    expect(statuses, `fixture missing ${required}`).toContain(required)
  }
})
```

## Fixture refresh workflow

```bash
# scripts/refresh-capture.mjs
# 1. Pull a small representative sample from the provider (needs a key locally).
# 2. Redact anything IP-sensitive.
# 3. Write to tests/fixtures/<provider>.json.
# 4. Show the diff.
# The maintainer reviews the diff. If new fields are missing from the schema, the schema
# is updated in the same PR as the fixture. If old fields are gone, deprecation is flagged.
```

## Anti-patterns

- Schema uses `.passthrough()` — unknown fields survive and rot silently.
- Fixture in `cache/` (gitignored) — contract works on maintainer's machine, breaks on CI.
- Schema tolerates every empty variant (`.optional()` on everything) — parses noise as data.
- Fixture is a full 200KB dump — reviewers cannot see what changed.
- Refresh script that overwrites the fixture without diff.
- Calling this "Pact" or "CDCT" — those terms have specific meanings that require a broker.

## Related

- `api-fault-vs-absence` — schema errors are faults, not absences.
- `ci-runs-without-secrets` — the reason for a tracked capture.
- `layered-testing-strategy` — the fourth seam.
