# Moving smartlivetv.co.uk from Vercel to Netlify (free)

**Why:** On Vercel, the team's free limit is **4 hours of Fluid Active CPU per
month, shared across all projects**. `sightlinetv.com` used 2h 55m (77%) and
`smartlivetv` 52m (23%); the shared limit tripped and **paused both sites**
until Dec 4, 2026. Moving smartlivetv to its own free Netlify site gets it back
online now and leaves sightlinetv the full 4h on Vercel.

**What is already done in code** (this branch): `netlify.toml`, the scheduled
function `netlify/functions/trial-followups.mts` that replaces the Vercel cron,
and Netlify-aware client-IP and URL handling. Nothing here is secret.

**What only you can do** — the three steps below. Claude never handles secrets
or DNS.

---

## 1. Create the Netlify site (free)

1. Sign up at netlify.com and **Add new site → Import from Git → GitHub →
   `shad-yy/forclaude`**.
2. Production branch: **`Version-3`**.
3. Build command and publish dir come from `netlify.toml` — leave them.
4. Let the first build run on the temporary `*.netlify.app` URL **before** you
   move the domain, so you can test without downtime.

## 2. Set the environment variables

Netlify → Site configuration → Environment variables. Add every variable the
site uses (same values you have in Vercel). **Set these in Netlify's UI, never
in the repo.**

Required for the site to work:
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `THESPORTSDB_API_KEY`, `FOOTBALL_DATA_API_KEY`, `RAPIDAPI_MMA_KEY`, `NEWS_API_KEY`
- `RESEND_API_KEY`, `ORDER_NOTIFY_EMAIL`
- `HCAPTCHA_SECRET`, `NEXT_PUBLIC_HCAPTCHA_SITEKEY`
- `JWT_SECRET`, `ADMIN_PASSWORD_HASH`
- `CMS8K_API_KEY`, `CMS8K_USERNAME`, `CMS8K_PASSWORD`, `CMS8K_SERVER_URL`,
  `CMS8K_URL`, `CMS8K_SESSION_COOKIE` (if used)
- `CRON_SECRET` — **required**, the scheduled function sends it to the cron route
- `NEXT_PUBLIC_APP_URL = https://smartlivetv.co.uk`
- `NEXT_PUBLIC_SITE_URL = https://smartlivetv.co.uk`
- the `NEXT_PUBLIC_*` base-URL and social/WhatsApp/store vars you already set
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

Optional (features degrade gracefully without them): `GSC_SERVICE_ACCOUNT_JSON`,
`GSC_SITE_URL`, `PSI_API_KEY`.

**Rotate first:** `RAPIDAPI_MMA_KEY` and `NEWS_API_KEY` are exposed in public git
history (OPEN-WORK O-23). Put the **new** keys in Netlify, not the leaked ones.

Do **not** set `VERCEL_ENV` or `VERCEL_URL`. Netlify sets its own `URL`, which
the code now reads.

## 3. Move the domain (the cutover)

1. Test the `*.netlify.app` build: `/`, `/pricing`, `/free-trial`, `/buy`,
   `/watch/premier-league`, `/blog`, `/api/fixtures/today`, `/robots.txt`,
   `/sitemap.xml`. Confirm pages load and the trial form works.
2. In Netlify → Domain management, add `smartlivetv.co.uk` and `www`.
3. At your DNS registrar, point the domain at Netlify (Netlify shows the exact
   records). **Remove the Vercel DNS records for this domain** so it stops
   pointing at Vercel.
4. Netlify issues the SSL certificate automatically once DNS resolves.
5. In Vercel, you can remove `smartlivetv.co.uk` from the smartlivetv project
   afterwards. Leave `sightlinetv.com` on Vercel untouched.

---

## Notes and limits (honest)

- **The cron** now runs on Netlify daily at 12:00 UTC (same as before). The
  pre-existing daily-vs-15-minute mismatch (AUTOMATION.md A10) is unchanged.
- **`@vercel/analytics`** in `app/layout.tsx` only reports on Vercel; it is
  inert on Netlify and harmless. Your Google Analytics tag still works.
- **IndexNow** does not ping from Netlify builds (it gates on `VERCEL_ENV`).
  Search engines still find the site through the sitemap.
- **Free tier is for small/hobby traffic.** Netlify's acceptable-use policy,
  like Vercel's, prohibits facilitating access to copyrighted streams and will
  take the site down on a valid complaint. Moving host does not change that.
- **GitHub Actions** (CI, CodeQL, Gitleaks, the production monitor, the daily
  routine) are unaffected — they do not run on Vercel. Update the monitor's
  base URL only if the `*.netlify.app` URL is used instead of the domain.
