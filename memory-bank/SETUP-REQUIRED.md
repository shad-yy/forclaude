# SETUP-REQUIRED — Smart Live TV

Every environment variable the app reads. Enforced by `tests/log-hygiene.test.ts` — every non-platform `process.env.<NAME>` reference in `lib/`, `app/`, `components/`, and `middleware.ts` must appear here in backticks.

**Read-time semantics** (from `runtime-env-and-middleware-safety` rule 3):
- `NEXT_PUBLIC_*` → **inlined at build time**. Deleting in the Vercel dashboard does nothing until rebuild. Value is in the bundle; never carries a runtime secret.
- Everything else → **read at runtime**. Deleting in the dashboard breaks the running deployment immediately, with no push. Never delete such a variable without grepping `guards`, `throw`s, and assertions across every file type first.

Platform-provided (`NODE_ENV`, `VERCEL_ENV`, `VERCEL_URL`) are not user-configured and are excluded from this file's coverage requirement.

---

## Server-side secrets (runtime-read)

| Name | Required | Primary consumer | If missing |
| :-- | :-- | :-- | :-- |
| `JWT_SECRET` | Yes for admin auth | `lib/config/env.ts`, `middleware.ts`, `app/api/auth/admin/route.ts` | `middleware.ts:23-25` throws in production → 500 on `/admin/*` and `/api/admin/*` (see O-04). `lib/config/env.ts:30` falls back to `""`, so admin JWT verification always fails silently at consumption. |
| `ADMIN_PASSWORD_HASH` | Yes for admin login | `app/api/auth/admin/route.ts` | Route returns 500. Prior fallback hash was removed for security (see `PROGRESS.md` Bug 6). |
| `RESEND_API_KEY` | Yes for outbound email | `app/actions/subscribe.ts`, `app/api/subscribe/route.ts`, `app/api/admin/test-panel/route.ts` | Email sending fails; subscription/order confirmations do not arrive. |
| `ORDER_NOTIFY_EMAIL` | Yes to route order alerts | `app/actions/subscribe.ts`, `app/api/subscribe/route.ts`, `app/api/orders/route.ts` | Order/subscribe notifications have no destination. |
| `CRON_SECRET` | Yes for cron endpoints | `app/api/admin/test-panel/route.ts`, `app/api/cron/trial-followups/route.ts` | Cron endpoints reject legitimate scheduler calls. |
| `UPSTASH_REDIS_REST_URL` | Yes for cache / rate limit / fraud | `lib/cache/redis.ts`, `lib/fraud/detect.ts`, `app/api/admin/test-panel/route.ts` | Redis-backed features degrade to in-memory (see O-05). |
| `UPSTASH_REDIS_REST_TOKEN` | Yes, pairs with URL | same as above | same as above |
| `NEWS_API_KEY` | Optional | `lib/config/env.ts` | News section falls back to mock data per `PROJECT.md` §3. |
| `THESPORTSDB_API_KEY` | Optional (but degrades) | `lib/config/env.ts:11` | Falls back to `"123"` (TheSportsDB public test key). Named trap from `ci-runs-without-secrets` — returns valid JSON for a subset of the catalogue, so a missing key looks like a working one. Do not treat as harmless. |
| `FOOTBALL_DATA_API_KEY` | Optional | `lib/config/env.ts` | football-data.org calls unauthenticated; rate-limited to 10 req/min. |
| `RAPIDAPI_MMA_KEY` | Optional | `lib/config/env.ts` | RapidAPI MMA data unavailable. Prior hardcoded fallback was removed for security (see `PROGRESS.md` Bug 5). |

## CMS8K panel (runtime-read)

Consumers: `app/api/admin/test-panel/route.ts`, `app/api/orders/route.ts`, `lib/panel/cms8k.ts`.

| Name | Required | If missing |
| :-- | :-- | :-- |
| `CMS8K_API_KEY` | Yes | Panel line creation fails; orders cannot be provisioned. |
| `CMS8K_USERNAME` | Yes | Panel login fails. |
| `CMS8K_PASSWORD` | Yes | Panel login fails. |
| `CMS8K_SERVER_URL` | Yes | No target for panel calls. |
| `CMS8K_URL` | Yes | Distinct from `CMS8K_SERVER_URL` — not verified this session which controls which flow. Grep `lib/panel/cms8k.ts` for the exact role. |
| `CMS8K_SESSION_COOKIE` | Optional | Panel session-cookie shortcut; without it, code falls back to username/password login. Not verified this session. |

## Build-time inlined (`NEXT_PUBLIC_*`)

Values live in the bundle after build. Deleting in the dashboard does not change the running deployment; a redeploy is required. Never store a secret in one of these.

| Name | Consumer | Purpose |
| :-- | :-- | :-- |
| `NEXT_PUBLIC_APP_URL` | `lib/config/env.ts` | Public base URL for outbound links. |
| `NEXT_PUBLIC_SITE_URL` | `lib/structured-data.ts` | Canonical site URL used in JSON-LD. Wrong value → wrong canonicals (see `seo-fault-tolerance` rule 3). |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `lib/config/env.ts` | Google Analytics ID. |
| `NEXT_PUBLIC_HCAPTCHA_SITEKEY` | `components/trial/TrialForm.tsx` | hCaptcha site key on the free-trial form. |
| `NEXT_PUBLIC_STORE_URL` | `lib/config/env.ts` | Outbound store URL. |
| `NEXT_PUBLIC_WHATSAPP_URL` | `lib/config/env.ts` | Contact CTA URL. |
| `NEXT_PUBLIC_NEWSDATA_API_BASE_URL` | `lib/config.ts` | NewsData base URL override. |
| `NEXT_PUBLIC_THESPORTSDB_API_BASE_URL` | `lib/config.ts` | TheSportsDB base URL override. |
| `NEXT_PUBLIC_UFC_API_BASE_URL` | `lib/config.ts` | UFC scraper base URL override. |
| `NEXT_PUBLIC_SOCIAL_FACEBOOK` | `components/layout/footer.tsx` | Footer link. |
| `NEXT_PUBLIC_SOCIAL_INSTAGRAM` | `components/layout/footer.tsx` | Footer link. |
| `NEXT_PUBLIC_SOCIAL_TWITTER` | `components/layout/footer.tsx` | Footer link. |
| `NEXT_PUBLIC_SOCIAL_YOUTUBE` | `components/layout/footer.tsx` | Footer link. |

---

## Deleted-secret stories

Per `documentation-discipline` rule: every secret removed on a specific date, do not reintroduce.

- **RapidAPI MMA hardcoded fallback** — removed from `lib/api/mma-rapidapi.ts` and `lib/config/env.ts` (see `PROGRESS.md` Bug 5). Do not reintroduce a plaintext key as a fallback. `RAPIDAPI_MMA_KEY` now defaults to `""`.
- **Admin password backdoor** — removed from `app/api/auth/admin/route.ts` (see `PROGRESS.md` Bug 6). Do not reintroduce a fallback password hash. Route now returns 500 when `ADMIN_PASSWORD_HASH` is unset.
