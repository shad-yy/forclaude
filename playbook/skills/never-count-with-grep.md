---
name: never-count-with-grep
description: Never quote a count from a bare grep or a head/tail estimate. Strip comments first; parse the official tool output (JSON reporter, pnpm --json, git ls-files); publish an exact number or none. Wrong published counts poison the credibility of every other number in the same document.
---

# Counts are quoted, not estimated

A number in a document is a claim. If it is off by one, so is everything the reader now doubts around it. Bare `grep` counts things inside comments, inside string literals that name the pattern, inside imports that mention the token. It has never once been right on a large codebase without help.

## Wrong counts published in this project alone

- **"19 listings"** — actual **18**. The nineteenth was the `interface` field naming the type.
- **"Three items"** above a list of four.
- **"28 days" / "90 days"** cited for GSC data that held **19**.
- `SECURITY-ADVISORIES.md` reported **9 vulnerable modules** in the prod tree; actual **6 distinct**.
- **"178 tests"** kept getting quoted after the suite had grown to 231, then 273, then 381, then 394.
- **"9 external routes"** on a CV against a codebase where nothing supports that number.
- **"6 e2e failures on CI"** where the CI log said **8 failed, 1 flaky**.

Each was quoted while a correct number was one command away.

## Rules

1. **Strip comments before counting source.** Every language has a stripper (regex for JS/TS, `pyparsing` or `ast` for Python, `go/ast` for Go). Blank comments (keep newlines) so offenders still report at their real line.
2. **Ask the runner, not the file.** Vitest: `--reporter=json`. Playwright: `--reporter=json`. pnpm: `pnpm list --json`, `pnpm audit --json`. Git: `git ls-files -z | tr '\0' '\n' | wc -l`. Never `grep -c test(`.
3. **Assert against a list, not a count.** Structural tests offer a list of *which* offenders they found. `expected [] to equal [three items]` tells the reader more than `expected 3 to equal 0`.
4. **Never round or approximate.** If it's 18, say 18. If you don't know, say "not counted".
5. **Time-bound numbers state their range.** "19 days of GSC data (2026-08-22 → 2026-09-09)" not "the last month".
6. **A doc's count is a test.** If a number appears in prose, a test should derive it — otherwise the number rots.
7. **A source file's count is not stable.** "This project has N components" is a fact-shaped statement about tracked files; it will drift the moment somebody adds one. Prefer "run `pnpm run count-components` for today's number".

## Recipes

```bash
# Number of Vitest tests, tools-honest
npx vitest run --reporter=json | jq '.numTotalTests'

# Number of unique vulnerable modules in prod tree
pnpm audit --prod --json | jq '.metadata.vulnerabilities'

# Files tracked in the repo
git ls-files -z | tr '\0' '\n' | wc -l

# Sites of a pattern outside comments (JS/TS, awk-only)
awk '/\/\*/{c=1} /\*\//{c=0;next} c==1{next} /^\s*\/\//{next} /needle/{n++} END{print n}' file.ts
```

```ts
// Structural test that lists offenders, not their count
const offenders = files
  .flatMap(f => findViolations(executableOnly(readFileSync(f, "utf8"))).map(v => `${rel(f)}:${v.line}`))
expect(offenders, "these lines break rule X").toEqual([])
```

## Verification

- **Every count in prose is derived.** A test asserts the number in the doc equals the runner's output. When they disagree, the doc updates or the test fails.
- **A "structural-scan" test never returns a number**; it returns the list.
- **Reports date the numbers.** `"18 listings (2026-09-05)"` — no calendar month named without a year.

## Anti-patterns

- `grep -c X | head -1`
- Copy-pasting a test count from a stale README.
- "Roughly N" or "about N" in a document that also contains real numbers.
- Deriving a count from a `find | wc -l` that includes `.next/`, `node_modules/`, or generated files.
- Counting occurrences in a file that also *documents the rule* (the doc explaining "never say X" contains the string X).

## Related

- `layered-testing-strategy` — structural tests list, they don't count.
- `documentation-discipline` — QA-LOG entries carry dates and commit hashes.
