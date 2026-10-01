---
name: reproduce-before-fix
description: Reproduce a bug on your machine before you touch a line of code. Same failure message, same conditions. Use a git worktree with no .env for CI-only bugs; use production-build-locally with the config verified for prod bugs. Write the failing test first, matching the observed message. Fix; test goes green; run the controls. Regression plus progression, both required.
---

# A bug you cannot reproduce is a hypothesis, not a bug

Fixes made against a bug you cannot reproduce are guesses. When they land and the symptom disappears, you don't know whether the fix worked or the condition passed on its own. Either is possible; both look the same in a git log.

The first thing to do with any reported defect is to make it happen locally. Not "make something similar happen"; make **the same failure**, with **the same message**, under **the same conditions**.

## The workflow

1. **Read the failure verbatim.** Copy the message, the stack, the environment (browser, viewport, secrets present or absent, cache state).
2. **Choose the seam that isolates the environment.**
   - CI-only bug → git worktree with no `.env`.
   - Prod-only bug → production build locally with production-shaped config.
   - Machine-specific bug → same OS/browser/font/locale; if it doesn't reproduce there, ask what's different.
3. **Reproduce.** Failure message and conditions must match. If they don't, the environment differs; find what's missing before fixing anything.
4. **Write the failing test first.** Message reads like the failure. Prove it fails against the current tree.
5. **Fix.** The test goes green.
6. **Run the controls.** A test that goes from red to green under any change is a test that proves nothing. Confirm the controls still discriminate.
7. **Verify progression *and* regression.** Progression: the new thing works (the defect is gone). Regression: nothing that already worked broke (`tsc`, unit, e2e, build).

## Incidents

**Picker went empty on CI.** Hypothesis: TMDB has no key on CI so the list is empty. Test one: build the failing commit in `/tmp/repro` with no `.env`, run the failing spec against it — same 30s timeout on "Japan". Then re-point the spec at Brazil, keep everything else the same, rerun. Still times out — this time on Brazil. That was the proof it was the product, not just the test target.

**Ephemeral `execFileSync`.** A first-pass probe test used `execFileSync`, which blocks the Node event loop. The in-process test server never answered because Node couldn't process requests while the child was waiting. Five checks aborted at 45s and the run reported "five failures, zero requests" — a damning result about the code, produced by a defect in the harness. Recorded lesson: the first failure a new test reports is as likely to be the test as the code.

**Renaming `.env.local`.** Common shortcut for "run without keys". Dangerous: `.env.local.bak` may already exist, and a rename overwrites the backup. A git worktree costs 5 seconds and cannot destroy anything.

## Rules

1. **Failure message and conditions match, or you have not reproduced.** "Close enough" isn't.
2. **Never rename `.env.local` to reproduce a key-less bug.** Use a worktree.
3. **The first suspicion, on a new test, is the test.** A five-failure run with zero upstream calls is a harness defect until proven otherwise.
4. **Write the failing test first.** Every A-XX entry in the QA-LOG was tested red first.
5. **A test with no red-first proof is a test that could pass any implementation.** It has no discrimination.
6. **Reproduce on the smallest surface.** Not "run the full suite". Run the one failing test with `--reporter=line` and see if it fails alone. If it does, you have your isolation.
7. **Save the reproduction.** A worktree with the failing state, or a commit that adds the failing test — either way, it survives past the fix as evidence.

## Recipe: key-less CI reproduction

```bash
# From the main repo, at the failing sha.
git worktree add --detach /tmp/repro <sha>

# Bind node_modules so the build is fast (Windows: mklink /J; Unix: ln -s).
mklink /J /tmp/repro/node_modules /a/project/node_modules   # or ln -s

# Build with no .env in /tmp/repro. Confirm it is key-less:
ls /tmp/repro | grep '^\.env'         # must be empty
cd /tmp/repro && node node_modules/next/dist/bin/next build

# Serve. From the main repo, run the failing spec against it.
node node_modules/next/dist/bin/next start &
cd /a/project && npx playwright test --grep "<failing spec>" --project="Desktop Chrome"
```

## Recipe: production-build reproduction

```bash
# Match production env exactly (which vars are set, which are absent).
# For Vercel: pull env with `vercel env pull` into a scratch file, sanity-check names only.
# Then run `next build` and `next start` locally with those.

# For a "worked in dev, broken in prod" report: NEVER trust `pnpm dev`.
# The dev server has HMR, unminified code, no route cache, and different bundling.
```

## Verification

- The failing test is committed (in a separate branch or in the same commit as the fix).
- The commit message names both what was reproduced and how ("Reproduced in worktree at sha X, no .env").
- The QA-LOG entry records the reproduction step, not only the fix.

## Anti-patterns

- Fixing a symptom without reproducing it, then reporting "fixed".
- Renaming `.env.local` to reproduce; overwriting `.env.local.bak`.
- Running the full suite instead of the single failing test.
- "Should work on my machine" — reproduction that only works on the reporter's is not a fix.
- Deleting the reproduction after the fix — no evidence remains.

## Related

- `layered-testing-strategy` — red-first, controls, discriminated.
- `ci-runs-without-secrets` — key-less reproduction is a standard procedure.
- `documentation-discipline` — the log entry.
