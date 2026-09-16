#!/usr/bin/env bash
# Key-less reproduction script for CI-only failures.
# Skill: playbook/skills/ci-runs-without-secrets.md, playbook/skills/reproduce-before-fix.md.
#
# Usage:  scripts/repro-keyless.sh [<git-sha>]
#         # default sha is HEAD
#
# What it does:
#  1. Creates a detached git worktree at /tmp/repro-<sha> (fast — no re-clone).
#  2. Runs `pnpm install --frozen-lockfile --ignore-scripts` in it (dep code never runs).
#  3. Runs `pnpm tsc --noEmit && pnpm vitest --run` in the worktree,
#     with **no .env file present** so any test/build path that
#     depended on a real API key is exposed.
#  4. Prints the failing test list (if any) and cleans up on success.
#
# Why: CI has no keys (`ci-runs-without-secrets`). A test that only passes
#      because your local .env is set is a CI failure waiting to fire.
#      This script produces the same environment CI does, without renaming
#      your local .env (`reproduce-before-fix` §Anti-patterns).
#
# Exit code: 0 if the key-less build + suite pass; non-zero otherwise.

set -euo pipefail

SHA="${1:-HEAD}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
RESOLVED_SHA="$(git rev-parse --short=12 "$SHA")"
WORKTREE="/tmp/repro-${RESOLVED_SHA}"

cleanup() {
  local exit_code=$?
  if [[ $exit_code -eq 0 ]]; then
    echo "==> key-less reproduction PASSED at $RESOLVED_SHA — removing worktree $WORKTREE"
    git -C "$REPO_ROOT" worktree remove --force "$WORKTREE" 2>/dev/null || true
  else
    echo "==> key-less reproduction FAILED at $RESOLVED_SHA — worktree preserved at $WORKTREE for inspection"
    echo "    inspect:  ls -la $WORKTREE"
    echo "    clean up: git worktree remove --force $WORKTREE"
  fi
}
trap cleanup EXIT

if [[ -d "$WORKTREE" ]]; then
  echo "==> worktree already exists at $WORKTREE — removing before recreating"
  git -C "$REPO_ROOT" worktree remove --force "$WORKTREE" 2>/dev/null || rm -rf "$WORKTREE"
fi

echo "==> creating detached worktree for $RESOLVED_SHA at $WORKTREE"
git -C "$REPO_ROOT" worktree add --detach "$WORKTREE" "$RESOLVED_SHA"

if [[ -f "$WORKTREE/.env" || -f "$WORKTREE/.env.local" ]]; then
  echo "!! .env or .env.local found in worktree — the whole point is to run WITHOUT keys."
  echo "!! aborting rather than silently loading them."
  exit 2
fi

cd "$WORKTREE"

echo "==> pnpm install (frozen, ignore-scripts)"
pnpm install --frozen-lockfile --ignore-scripts

echo "==> pnpm tsc --noEmit"
pnpm tsc --noEmit

echo "==> pnpm vitest --run"
pnpm vitest --run

echo "==> key-less reproduction succeeded"
