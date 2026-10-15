---
name: wcag-aa-real-audit
description: WCAG 2.2 Level AA compliance requires axe-core wired to real routes across every device project, stabilised against animations, plus structural tests for rules the scan cannot see (links on pages the scan does not visit, missing alt, target-size). Contrast is a property of a pair, not a colour. Reserve allowlists for temporary debt with a paired failing control.
---

# axe must be wired, not installed

An accessibility library with **zero call sites** is worse than none. It shows up in the dependency graph, in reports, in CVs — as coverage that does not exist. A team relying on that signal is one step behind a team with no signal at all.

## Incidents

**Zero call sites.** `@axe-core/playwright@4.13.0` was installed. `pnpm test:a11y` ran `playwright test --grep @a11y`, matched nothing, and **exited green**. `AxeBuilder` was called by zero tests. The green run was proof of an empty grep, not of a compliant site.

**`link-in-text-block` on `/status`.** CI failed on `/status`. The failing node was the cookie banner's Privacy Policy link — which renders **everywhere**. Amber `#f0a63c` inside a sentence of `#8c92a0` measures **1.51:1**; WCAG 1.4.1 requires 3:1 or a non-colour cue. The banner class was `text-[var(--sl-amber)] underline-offset-2 hover:underline` — no underline at rest; hover doesn't exist on touch. The same class was on **13 links in 8 files**, 5 on pages the axe scan never visited (`/privacy`, `/terms`). Fix: `underline underline-offset-2 hover:underline`.

**Contrast measured against the wrong pair.** `--sl-dim` was verified at 4.57:1 against `--sl-ground`. It sits on `--sl-surface` and `--sl-panel`, where it reads 4.21 and 4.40. A correct measurement of the wrong pair. Contrast is a property of a *pair*, not a colour. Fix required both a palette adjustment and a measurement pass.

**Frames of animation.** With the palette fixed, axe still reported failures. `#0d0f12 on #0a0c10` at 1.01:1 — text the same colour as its background. framer-motion at 3% opacity produced that transient. Two-sample rule fixed it.

## Rules

1. **Wire axe to specific routes** in Playwright, across every device project in the config. A rule that only fails on Desktop Chrome ships to phones anyway.
2. **`wcag2a` + `wcag2aa` only.** Axe's `best-practice` rules are opinions; failing a build on those trains people to disable the scan.
3. **Wait for animations to settle** before measuring — see `flaky-test-policy`'s two-sample rule.
4. **Zero allowlist as the goal.** Any temporary allowlist entry must be paired with a **failing control** that asserts the debt still exists, so fixing the underlying issue fails the control and forces the allowlist entry out.
5. **Structural tests catch what routes miss.**
   - Every link inside a text block underlined at rest (not hover-only). Enforce by class-token scan (`hover:underline` present, `underline` absent → offender).
   - Every `<img>` has `alt`. Empty `alt=""` is explicit and legal for decorative; missing is not.
   - Interactive targets ≥ 24×24 CSS px (WCAG 2.2 SC 2.5.8), or a scaled exception (link inside a run of prose is exempt if the whole run has 44px minimum).
6. **Contrast is a pair.** Verify every foreground against every surface it can appear on. Extract pairs from a full-page scan, not from the palette definition.
7. **Reflow (SC 1.4.10) at 320 CSS px** in a separate Playwright test. 320px is the criterion's own threshold: 1280px at 400% zoom. Narrower than any real device, so a layout can pass every device and still fail the standard.
8. **Node counts are not asserted.** Content is dynamic; counts move between runs and are flaky by construction. Assert *rule ids*, not counts.

## Implementation

```ts
// e2e/accessibility.spec.ts
const ROUTES = [
  { path: "/",                        name: "home" },
  { path: "/watch/champions-league",  name: "guide" },
  { path: "/status",                  name: "status" },
]

for (const route of ROUTES) {
  test(`${route.name} has no new WCAG A or AA violations @a11y`, async ({ page }) => {
    await page.goto(route.path)
    const violations = await stableViolations(page)              // two-sample rule
    expect(violations, `new axe violations on ${route.path}`).toEqual([])
  })
}

test("no page scrolls horizontally at the 320px reflow threshold @a11y", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  for (const r of ROUTES) {
    await page.goto(r.path); await page.waitForLoadState("networkidle")
    const { scrollWidth, offender } = await page.evaluate(() => { /* first element past 321 */ })
    expect(scrollWidth).toBeLessThanOrEqual(321)
  }
})
```

```ts
// tests/links-distinguishable.test.ts — structural
function underlinesOnlyOnHover(classes: string): boolean {
  const t = classes.split(/\s+/)
  return t.includes("hover:underline") && !t.includes("underline")
}
// Then walk app/**/*.tsx and components/**/*.tsx, executableOnly, and refuse.
```

## Verification

- **Wired**. `pnpm test:a11y` must **fail** on a synthetic violation (an `<a>` with no text). A scan that has never been shown to fail is not evidence.
- **Every device**. Test IDs run on Desktop Chrome, iPhone-class Mobile Safari, Pixel-class Mobile Chrome.
- **Structural**. Refuse `hover:underline` alone; refuse `<img>` without `alt`; refuse contenteditable false interactive.
- **Debt**. Every allowlist entry has a paired failing control.

## Anti-patterns

- axe installed, zero call sites.
- axe against `//div[class='root']` — assert on the page, not a selector.
- `waitForTimeout(1500)` before scanning.
- Counting nodes (`violations.length ≤ 6`).
- Allowlist entries with no expiry and no control.
- "Underlines on hover" as the whole link cue.

## Related

- `flaky-test-policy` — the two-sample rule.
- `layered-testing-strategy` — structural tests catch route-invisible issues.
- `ci-runs-without-secrets` — accessibility runs without API keys anyway.
