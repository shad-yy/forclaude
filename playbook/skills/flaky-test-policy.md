---
name: flaky-test-policy
description: A flaky test is a defect in the test, not a fact about the world. Assert what is true after things settle; pair the settlement with an assertion of what settled. Use retries only for infrastructure noise (jitter, cold edge), never for product nondeterminism. Ban test.only. Quarantine expires in 30 days, enforced by a policy test.
---

# A flake is a defect in the test

A test that fails on correct behaviour is worse than no test. It trains people to re-run until green, and once that habit exists every other gate in the suite is worth less — including the ones that are telling the truth.

## Incidents

**axe scanning frames of animation.** The scan reported `#0d0f12 on #0a0c10` at **1.01:1** — text the exact colour of its own background. No palette produces that; a fade at 3% opacity does. axe was sampling framer-motion entrances mid-flight and blending the interpolated colour against the ground.

**Cookie banner at frame zero.** The opacity guard read the hydrated DOM the instant it mounted, caught the banner mid-entrance, and reported "content shipped at opacity zero". The DOM was correct; the sample time wasn't.

**Node counts.** A test asserted "6 fixtures visible". The content is dynamic; some days it's 5, some days 12. A count assertion on dynamic content is flaky by construction.

**Retries: 2.** One project raised the retry to hide a flake and it never came back. The flake became permanent, then became four flakes, and the CI signal became noise.

## Rules

1. **A flaky test is a defect in the test.** It is not a fact about the world to be worked around.
2. **Find what transient it measures.** Both flakes above sampled a transient — an animation frame, a dynamic count — and called it a property of the product. Ask what is true *after things settle* and assert that.
3. **`retries: 1` is for infrastructure noise** (network jitter, cold edge, DNS blip). Not for product nondeterminism. Raising it is how a flake becomes permanent.
4. **`test.only` is banned outright.** It silently shrinks the suite to one test while still reporting green — the one failure mode that produces a passing run and no signal. Not quarantinable. A policy test scans `tests/` and `e2e/` and rejects it anywhere.
5. **Prefer server response to hydrated DOM.** The stricter claim and the stabler one; it holds for crawlers.
6. **Assert presence and absence, not counts.** Counts are claims about a moment.
7. **Never add a `waitForTimeout(N)` to fix flakiness.** Timing is not a property of the product. Poll for the property; if the property is elusive, the test is measuring the wrong thing.
8. **Quarantine (`test.skip` + row in `FLAKY-TESTS.md`) expires in 30 days.** Enforced by a policy test. Both halves are required and each is checked: a skip with no row fails, a row with no skip fails.
9. **Animated pages: two-sample rule.** Repeat the scan until two consecutive results agree; assert the agreed one. A genuine violation is stable by construction; a transient is not.
10. **When a fix looks flaky, it is more likely the test is flaky than the code is nondeterministic.** Confirm nondeterminism *in isolation* before adding tolerance.

## Implementation

```ts
// axe: two-sample settlement
async function stableViolations(page: Page): Promise<string[]> {
  await page.waitForLoadState('networkidle')
  const scan = async () => (await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze())
    .violations.map(v => `${v.id} (${v.impact}) — ${v.nodes.length} node(s): ${v.help}`).sort()
  let previous = await scan()
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(400)
    const current = await scan()
    if (current.join('|') === previous.join('|')) return current
    previous = current
  }
  return previous
}
```

```ts
// tests/flaky-policy.test.ts — skip must have a row, row must have a skip
const policy = readFileSync("memory-bank/FLAKY-TESTS.md", "utf8")
const skipped = grepRepo(/\btest\.(skip|fixme)\(/, ["tests", "e2e"])
const rows = parseQuarantineTable(policy)

expect(skipped.map(s => s.name).sort()).toEqual(rows.map(r => r.name).sort())
for (const row of rows) {
  const ageDays = (Date.now() - Date.parse(row.since)) / 86400_000
  expect(ageDays, `quarantine of ${row.name} expired`).toBeLessThan(30)
}

// No .only, anywhere
expect(grepRepo(/\b(it|test|describe)\.only\(/, ["tests","e2e"])).toEqual([])

// retries must be 1
expect(readPlaywrightConfig().retries).toBe(1)
```

## Anti-patterns

- "Just rerun it."
- `waitForTimeout(2000)` to work around a race.
- `retries: 2` or higher.
- `test.only` for "just this run".
- Asserting "count > 0" on dynamic content.
- Quarantine with no expiry.
- Deleting a quarantined test rather than fixing the underlying flake.

## Related

- `wcag-aa-real-audit` — the axe two-sample rule.
- `layered-testing-strategy` — controls prevent the "everything empty" flake class.
- `documentation-discipline` — FLAKY-TESTS.md is one of the required files.
