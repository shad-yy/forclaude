## Summary

<!-- What changes in this PR and why. One or two sentences. -->

## Category

- [ ] Security fix
- [ ] Bug fix
- [ ] Simplification / dead-code removal
- [ ] New feature
- [ ] Test / CI / dependency hygiene
- [ ] Documentation

## Skill invoked (playbook)

<!-- Which playbook/skills/*.md rule this change enforces or extends.
     Leave blank if none applies. Example: api-fault-vs-absence,
     runtime-env-and-middleware-safety, layered-testing-strategy. -->

## Red-first proof

<!-- Test file + concrete assertion that failed against the pre-fix
     tree and passes after. Skip this section only if the change is
     doc-only or CI-config only. -->

## Regression

- [ ] `pnpm install --frozen-lockfile` clean
- [ ] `pnpm tsc --noEmit` clean
- [ ] `pnpm vitest --run` full suite green (paste the run summary line)

## QA-LOG entry

<!-- The A-XX identifier from memory-bank/QA-LOG.md, or "n/a" if this
     PR does not warrant one (e.g. trivial doc fix). -->

## Follow-ups

<!-- OPEN-WORK.md items spun out of this change, if any. -->
