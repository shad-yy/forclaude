# Automation map — everything that runs without a person pressing a button

Last verified: 2026-10-19 (against GitHub Actions run history, Vercel build logs and
deployment records, and the scheduled-routine record). Times are UTC unless marked.
Update this file whenever a workflow, schedule, secret or external service changes.

---

## 1. The path from a change to the live site

```
 change on a branch ──► pull request to Version-3 ──► checks run on the PR
                                                      (CI test · CodeQL · Gitleaks · Vercel preview)
                                                              │
                         owner merges (or routine-automerge.yml for routine/* content PRs)
                                                              │
                                                              ▼
 Version-3 updated ──► Vercel builds production immediately (does NOT wait for CI)
                         build = generate-posts → next build → ping IndexNow
                                                              │
                                                              ▼
                       smartlivetv.co.uk serves the new build
                                                              │
                     daily: production monitor (Playwright) checks the live site
```

**Two gaps on this path (both owner settings, OPEN-WORK O-45):** `Version-3` has no
branch protection, so a direct push skips every check; and Vercel deploys without
waiting for CI (Vercel Deployment Checks are off). Both happened on 2026-10-15
(`9a393e1` went live with `test` failing).

---

## 2. Every automation, one row each

| # | What | Trigger | Does | Needs | Reports to | Status 2026-10-19 |
|---|---|---|---|---|---|---|
| A1 | **CI** (`ci.yml`, job `test`) | push to `Version-3`, `main`, `claude/**`; PRs to `Version-3`/`main` | install, `tsc --noEmit`, full vitest suite | nothing | PR checks | Green on `c4afaca` |
| A2 | **CodeQL** (`codeql.yml`) | push/PR to `Version-3`; Mondays 04:37 | static security analysis | nothing | Security tab, PR check | Green |
| A3 | **Gitleaks** (`gitleaks.yml`) | push/PR (new commits only); Mondays 05:17 (whole history) | secret scan | `GITHUB_TOKEN` (automatic) | job summary | **Red weekly**: 531 findings in history on 2026-10-19. Most are a public Cloudflare key inside saved error pages under `logs/`; two are real keys (RapidAPI, NewsData) — O-23 |
| A4 | **Dependency audit** (`dependency-audit.yml`) | daily 06:23 | `pnpm audit --prod`, fails on critical | nothing | job summary | **Red daily since at least 2026-10-06**: 2 critical Next.js advisories — O-47 |
| A5 | **Production monitor** (`e2e-production-monitor.yml`) | daily 05:47; manual; push touching specs | 120 Playwright checks × 3 devices against the live site | nothing | opens/comments/closes an issue labelled `production-monitor` | Green 2026-10-16 to 2026-10-19; issue #23 closed 2026-10-16 |
| A6 | **Routine auto-merge** (`routine-automerge.yml`) | PRs to `Version-3` from `routine/*` branches only | if content-only and every check passed: merge, wait for live, verify key pages, open issue on failure | `GITHUB_TOKEN` | PR, issue | **Never used for real** — no routine PR has been opened |
| A7 | **Dependabot** (`.github/dependabot.yml`) | Mondays 06:00 | opens grouped update PRs (npm, GitHub Actions) | nothing | PRs | Working: PR #26 (32 updates) and #27 open |
| A8 | **Vercel production build** | every push to `Version-3` | `generate-posts` → `next build` → `scripts/ping-indexnow.js` | Vercel env vars (section 4) | Vercel dashboard | Builds green; **IndexNow ping returns 403 on every build** — O-44 |
| A9 | **Vercel preview builds** | every push to any other branch | same build, preview URL | Vercel preview env vars | PR comment + status | Working |
| A10 | **Vercel cron** `/api/cron/trial-followups` (`vercel.json`) | daily 12:00 | emails trial users at set points after start / before and after expiry | `CRON_SECRET`, `RESEND_API_KEY`, Upstash | Vercel logs (1-hour retention on Hobby) | **Runs once a day, but the code says "every 15 minutes"** and only sends inside 2–4 h / 2–6 h windows, so most of those emails cannot fire. If `CRON_SECRET` is unset the route accepts any caller. Not verified live (log retention) |
| A11 | **Scheduled Claude routine** `trig_011W5QzFnRRwNGWjykchLJ6F` | daily 05:52 UK time | reads `playbook/routines/daily-growth-routine.md` from `Version-3`, checks health, opens content PRs | claude.ai usage allowance; GitHub access via `add_repo` | push + email report | **Has never completed.** Runs on 2026-10-15 and 2026-10-19 failed after ~6 s with `USAGE_LIMIT_REACHED`; 2026-10-16 to 2026-10-18 left no branch, PR or commit — O-48 |
| A12 | **Removed 2026-10-15**: `auto-index.yml` | — | pinged a Google endpoint switched off in 2023 and misused the Indexing API | — | — | Deleted in PR #24 (QA-LOG R-28) |

---

## 3. Scripts the automations call

| Script | Called by | Purpose |
|---|---|---|
| `scripts/generate-posts.js` | build, dev, routine | `content/blog/*.mdx` → `lib/blog/posts.ts` + `public/llms-full.txt` |
| `scripts/ping-indexnow.js` | build (production only) | submits all URLs to IndexNow; currently 403 (O-44) |
| `scripts/audit-gate.mjs` | A4 | fails on critical production advisories |
| `scripts/routine/tier.mjs` | A6, routine | content-only (A) vs everything else (B) |
| `scripts/routine/wait-for-checks.mjs` | A6 | every other check on the PR head passed |
| `scripts/routine/verify-production.mjs` | A6 | new posts live, key pages 200, sitemap lists posts |
| `scripts/routine/gsc.mjs` | routine | Search Console data — exits 2 until `GSC_SERVICE_ACCOUNT_JSON` exists (O-39) |
| `scripts/routine/pagespeed.mjs` | routine | Core Web Vitals — exits 2 until `PSI_API_KEY` exists (O-40) |

---

## 4. External services and the secrets they need

Values live in Vercel (runtime) or the routine's cloud environment. Never in the repo.
Full table with failure modes: `SETUP-REQUIRED.md`.

| Service | Used for | Secret(s) | Notes |
|---|---|---|---|
| TheSportsDB | fixtures, scores, tables, teams | `THESPORTSDB_API_KEY` | free key falls back to the public test key; whether the paid key is set in Production is unconfirmed (O-36). Upstream returned HTTP 522 on 2026-10-16 |
| football-data.org | UCL/UEL data | `FOOTBALL_DATA_API_KEY` | |
| NewsData.io | news | `NEWS_API_KEY` | **a real-looking key is in public git history** (`env.local`, commits of 2026-06-09/11) — rotate (O-23) |
| RapidAPI (MMA) | UFC data | `RAPIDAPI_MMA_KEY` | **exposed in public history since 2026-05**; rotation open since 2026-09-24 (O-23) |
| ESPN public API | UFC/F1 scoreboards | none | |
| Upstash Redis | cache, fraud checks, customers | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | |
| Resend | email | `RESEND_API_KEY`, `ORDER_NOTIFY_EMAIL` | |
| hCaptcha | trial form | `HCAPTCHA_SECRET` (+ site key) | unset = captcha is decorative |
| cms-8k panel | line provisioning | `CMS8K_*` | |
| IndexNow | URL submission | key file in `public/` | 403 (O-44) |
| Google Analytics | analytics | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | |
| Search Console / PageSpeed | routine data | `GSC_SERVICE_ACCOUNT_JSON`, `PSI_API_KEY` | not configured (O-39, O-40) |

---

## 5. What the automation is missing (ordered by risk)

1. **Two live third-party keys are public** (RapidAPI, NewsData). Rotate both, then
   allowlist their fingerprints in `.gitleaksignore` so A3 can go green. Owner action.
2. **Nothing stops a red build reaching production** — branch protection + Vercel
   Deployment Checks (O-45). Owner action.
3. **The content routine has never run.** Usage limit (O-48). Separately, its spec
   requires every post to link to the sales pages; the routine runs as Claude, which
   declines to write posts that sell this service, so even with allowance restored
   expect it to produce health reports and no published posts.
4. **No alert reaches a person except GitHub issues and the routine's report.** The
   dependency audit and Gitleaks have been red for days without anyone being told;
   only the production monitor opens an issue.
5. **No uptime check between monitor runs.** The monitor runs once a day; an outage
   at 06:00 is unseen for about 24 hours.
6. **Runtime logs are kept 1 hour (Hobby).** Cron results, fault rates and upstream
   errors cannot be reviewed after the fact. A log drain or a daily summary would fix it.
7. **The trial follow-up cron's schedule and code disagree** (A10).
8. **Preview builds have been promoted to production by hand twice** (O-46).
9. **`ubuntu-latest` moved to Ubuntu 26 from 2026-10-19.** Every workflow uses it;
   pin `ubuntu-24.04` if a run breaks.
