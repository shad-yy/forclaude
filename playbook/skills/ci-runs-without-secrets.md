---
name: ci-runs-without-secrets
description: CI has no API keys. Every test must be assertable whether the upstream answers or not. Owned data (in-repo arrays, tracked fixtures, tolerable-by-design fallbacks) is fair game; provider data is not. When a feature requires a provider, degrade to owned data — not to 404. Reproduce CI failures with a key-less git worktree, not by renaming .env.local.
---

# CI holds no secrets; your tests must not depend on any

Every CI provider treats secrets as a policy trade-off: leaking one is a security incident, so most repositories run CI with zero. Third-party fallback keys (`API_KEY || "123"`) look like they solve this, but they lie — most providers return valid JSON for their public test key for a subset of the catalogue. A missing key then *looks like* a working one.

## Incidents

**Picker went empty during a TMDB outage.** `getSelectableCountries()` returned `getAvailableRegions()` (TMDB) and nothing else. `if (!data?.results) return []` at the boundary. On CI, no key, empty list. Two e2e tests waited 30 seconds for a country option that never rendered — on every CI run for 8 pushes. On every machine with a key, they passed. Fix: merge in own coverage. The picker offers TMDB's regions **plus** every country the site holds rights for; the picker now cannot go below the pages `resolveCountry` accepts.

**`/where-to-watch/jp`.** Assertion asked JP to be an "uncovered country" that renders (JP is a TMDB region). With no key, `resolveCountry` returns null, the page 404s by design, and the assertion fails on the environment, not the code. Fix: re-point to Brazil — a covered market — and assert positive + negative on the same page, so the discrimination holds regardless of key.

**`THESPORTSDB_API_KEY || "123"`.** The provider's public test key. Returns valid JSON for a subset. Documented in `e2e/outcomes.spec.ts` as a known trap so a reader does not mistake missing for working.

## Rules

1. **Every assertion must hold with and without keys.** If it can't, split: a keyed test (skipped without key, with a clear message) and a keyless test. Do not silently pass either way.
2. **Owned data is assertable.** Arrays defined in `lib/data/*`, tracked fixtures in `tests/fixtures/`, `activeCompetitionRights()`, an in-repo sitemap. Compile into the bundle; no credential needed.
3. **Provider data is not.** Never assert broadcaster names, region lists, counts, titles, prices, sports schedules, or anything else the provider owns.
4. **Every feature that depends on a provider degrades to owned data** — or its absence — never to 404.
5. **The trap is documented.** At the top of any test file whose fixtures are provider-shaped, state: "CI runs with no API keys. See `THESPORTSDB_API_KEY` fallback in `lib/api/*`. This test asserts <owned property> for that reason."
6. **Reproduce a CI failure locally with a key-less worktree**:
   ```bash
   git worktree add --detach /tmp/repro <sha>
   cd /tmp/repro && next build && next start &
   npx playwright test <spec>          # from the main repo
   ```
   **Never** rename `.env.local` — a `.env.local.bak` may already exist and a rename overwrites the backup.
7. **CI environment is the environment.** If a test cannot run in it, it does not exist. A passing local run over an incomplete environment is not a passing suite.

## Implementation

```ts
// A picker that survives the provider going dark
export async function getSelectableCountries(): Promise<CountryOption[]> {
  const codes = new Set(await getAvailableRegions())         // provider
  for (const c of activeCompetitionRights()) {
    for (const l of c.listings) codes.add(l.country.toUpperCase())    // owned
  }
  return [...codes].map(code => ({ code, name: countryName(code) })).sort(byName)
}
```

```ts
// e2e test that runs both ways
test("choosing a country changes the answer the server renders", async ({ page, context }) => {
  const covered = new Set(activeCompetitionRights().flatMap(c => c.listings.map(l => l.country)))
  const CANDIDATES = [{ code: "BR", name: "Brazil" }, { code: "CA", name: "Canada" }]
  expect(CANDIDATES.filter(c => !covered.has(c.code)),
         "these candidates have no active rights — a key-less build will not offer them")
    .toEqual([])
  // …the actual assertion, keyed on cookie change plus a server-rendered heading update
})
```

## Verification

- **Key-less reproduction is standard operating procedure.** Any CI failure gets one before any code change.
- **Structural test — provider names never asserted directly.** Grep e2e/*.spec.ts for hardcoded upstream values (broadcaster names, region codes) that are not in `lib/data/*`. Fail if any found.
- **Fallback key detection.** Search `lib/api/*` for `|| "123"`, `|| "demo"`, `|| "test"`, `|| null`. Each occurrence needs a comment naming what returns.

## Anti-patterns

- Renaming `.env.local` to reproduce CI (destroys backups).
- Assertions on provider content (broadcaster names, prices, titles).
- Silent `API_KEY || "test-key"` with no comment.
- e2e tests that are only expected to pass with keys, checked into main.
- Split into "CI job" and "keyed job" that both run always — the second flakes on rate limits from the shared provider account.

## Related

- `api-fault-vs-absence` — the degradation path.
- `reproduce-before-fix` — the mechanism.
- `contract-tests-recorded-captures` — how to test provider parsing without a live provider.
