#!/usr/bin/env node
// O-15: this repo is pnpm-only. CI (`pnpm install --frozen-lockfile`
// in .github/workflows/ci.yml + dependency-audit.yml) and Vercel
// (auto-detected via pnpm-lock.yaml — confirmed via the project's
// Vercel config, no installCommand override) both already use pnpm.
// This guard stops a contributor's local `npm install` / `yarn add`
// from silently regenerating a second, drifting lockfile — which is
// exactly how package-lock.json fell out of sync in the first place
// (see QA-LOG.md O-15).
const userAgent = process.env.npm_config_user_agent || ""

if (!userAgent.includes("pnpm")) {
  console.error(
    "\n[ensure-pnpm] This repo uses pnpm only — CI runs `pnpm install --frozen-lockfile`.\n" +
      "Install pnpm (https://pnpm.io/installation) and run `pnpm install` instead.\n",
  )
  process.exit(1)
}
