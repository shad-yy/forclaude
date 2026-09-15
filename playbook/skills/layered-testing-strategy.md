---
name: layered-testing-strategy
description: Mock at the layer of the question. MSW (msw/node) for network behaviour that reaches a component with its own fetch; module mocks for internal call ordering; structural tests for cross-file rules. Every fix has a red-first test (message reads like the bug) paired with a control that fails on trivially wrong implementations. Prefer server response to hydrated DOM.
---

# Choose the seam that isolates the defect

MSW can watch what goes out. It cannot watch a call that never happened. Module mocks can watch internal ordering. Structural scans can enforce rules that no single test reaches. Each has one question it answers.

## The rule of thumb, stated as questions

- *"Does this component render the right thing when the network misbehaves?"* → **MSW** (`msw/node` + happy-dom, component owns its `fetch`).
- *"Does this handler consult that other function at all?"* → **module mock** (MSW cannot see an omission).
- *"Does every page/route follow this rule?"* → **structural** (walk the tree, strip comments, guard against silent-pass).
- *"Does the provider still return the shape we parse?"* → **contract** (Zod schema over a **tracked** recorded capture; see `contract-tests-recorded-captures`).

## Red-first, controls, discriminated

Every fix has:

1. A test written **before** the fix that **fails on the old code**, and whose failure message reads like the incident. If a test never went red, it can prove any behaviour.
2. A **control** that fails on trivially wrong implementations (`return []`, `throw`, `return true`).
3. A discrimination check: positive + control together must fail different implementations. A suite with 4 assertions and 0 controls proves nothing.

Failure messages read like the incident. `expected 0 to be greater than 0` teaches nothing; `TMDB was unreachable and the picker offered no countries at all: expected 0 to be greater than 0` teaches the class.

## Prefer the server response to the hydrated DOM

- `request.get()` in Playwright asserts the strictly stronger property: it holds for crawlers, cURL, screen readers reading the initial HTML.
- The hydrated DOM includes animation frames, client-only mounted state, and race conditions. Read it only when the thing under test is interaction.

## Incidents that shaped this

**Proxy budget test (A-01a).** The question was "does this handler ask the budget before calling out?" — an omission. Module spy proved the bypass in three lines. MSW would have watched the outbound `fetch` (there when the bug is absent, absent when the bug is present — the wrong signal).

**Route rate-limits.** Test defined "walkable" as `rel.includes("[")` — a path parameter. `/api/leagues` reads `?country=` and `?sport=` and was unguarded. The suite reported full coverage because that route never entered the denominator. Found by asking *which* routes the filter excluded, not by trusting the green tick.

**Where-to-watch.** Original test asserted `body.innerText()` did not contain a set of names. Failed on correct behaviour: those names *legitimately* appeared in the film section (TMDB providers) — a different rights class from broadcast rights. Assert on the *smallest surface that carries the claim*, not the whole page.

## Structural test recipe

```ts
import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"

// 1) Walk, don't glob-experimental. fs.globSync is Node 22, not 20 (CI).
function walk(dir: string, want: (n: string) => boolean): string[] {
  const out: string[] = []
  for (const e of readdirSync(dir)) {
    const full = path.join(dir, e)
    if (statSync(full).isDirectory()) out.push(...walk(full, want))
    else if (want(e)) out.push(full)
  }
  return out
}

// 2) Blank comments (keep newlines) so line numbers stay accurate.
function executableOnly(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, " "))
    .replace(/^[ \t]*\/\/.*$/gm, "")
}

// 3) Guard against silent-pass.
it("finds files to check", () => expect(files.length).toBeGreaterThan(20))
```

## MSW recipe (Node, tests only)

```ts
// tests/msw/server.ts
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"
export const server = setupServer()
export const providerReturns = {
  rateLimited: (host: string) => server.use(
    http.get(host + "/*", () => new HttpResponse(null, { status: 429, headers: { "Retry-After": "30" }}))
  ),
  down: (host: string) => server.use(http.get(host + "/*", () => HttpResponse.error())),
}
```

Use MSW when the code path under test does its own `fetch`. Do not use it to prove call ordering.

## Module-mock recipe (Vitest)

```ts
vi.mock("@/lib/upstream-budget", () => ({
  claimUpstreamCall: vi.fn().mockResolvedValue({ available: true }),
}))
vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })))

await GET(request)

expect(claimUpstreamCall).toHaveBeenCalledWith("thesportsdb")
expect(claimUpstreamCall).toHaveBeenCalledTimes(1)
expect(fetch).toHaveBeenCalledTimes(1)
```

## Anti-patterns

- Test never seen red (added after the fix landed).
- No control — "everything empty" satisfies the assertion.
- Silently vacuous walk (0 files matched, still green).
- MSW used for internal call-ordering.
- Module mocks used to simulate network faults reaching a component.
- Retrying flakes green.
- Assertion messages that are the operator (`toEqual`) rather than the class of bug.

## Related

- `contract-tests-recorded-captures` — the fourth seam.
- `flaky-test-policy` — how to tell a flake from a fault.
- `never-count-with-grep` — structural tests use `readdir`, not `find | wc -l`.
- `reproduce-before-fix` — the outer loop.
