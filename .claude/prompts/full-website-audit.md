# 🔬 Smart Live TV — Full-Stack Site Audit

> **Run**: weekly, or after any significant deployment.
> **Scope**: `smartlivetv.co.uk` — technical health, funnel integrity, performance,
> security, SEO and accessibility.

---

## ⛔ Rules — read before starting

1. **Never fabricate data.** If you cannot verify something, write
   "I was unable to verify this" and move on. Invented statistics, benchmark numbers or
   tool output invalidate the whole audit.
2. **Never draw strong conclusions from weak data.** Search Console volume on this site
   is currently low enough that percentage swings are noise. State sample sizes. If a
   figure rests on a handful of clicks, say so rather than building a recommendation on it.
3. **Do not rewrite product content.** This audit covers whether the site *works*, not
   what it says. Copy, pricing and positioning are out of scope unless something is
   factually broken (a dead link, a wrong kick-off time, a stale season).
4. **Cite everything.** Every finding needs a file path with a line number, a command and
   its output, or a URL.
5. **Report, then fix.** Produce findings first. Apply fixes only for items you have
   verified, and record the verifying command alongside each.

---

## STEP 0 — Load context

1. `memory-bank/PROGRESS.md` — active context, and the **Trouble Registry**. Several
   recurring failures are already solved there; check it before debugging anything.
2. `memory-bank/PROJECT.md` — product, stack, integrations, structure.
3. `memory-bank/PATTERNS.md` — API layer, cache TTLs, non-negotiables.
4. `.cursorrules`, `package.json`, `next.config.mjs`.
5. Note today's date and judge whether seasonal content is current — Premier League,
   Champions League, UFC, F1, World Cup.

---

## STEP 1 — Does it build and typecheck?

```bash
npx tsc --noEmit                                              # expect 0 errors
npx vitest run
node -r ./polyfill-self.cjs node_modules/next/dist/bin/next build
```

⚠️ Stop the dev server first — sharing `.next` causes a spurious
`Cannot find module './NNNN.js'`.
⚠️ Do **not** run `npm run build`; it pings the IndexNow API.

Note that `next.config.mjs` sets `typescript.ignoreBuildErrors` and
`eslint.ignoreDuringBuilds`, so a green build does not mean green types. Run `tsc` yourself.

---

## STEP 2 — Route health

Check every route returns what it should:

```bash
for p in / /scores /leagues /teams /players /events /news /blog /ufc \
         /watch/premier-league /watch/champions-league /watch/europa-league \
         /watch/formula-1 /channels /pricing /buy /free-trial /subscribe \
         /login /setup/firestick /about /faq /contact /privacy /terms \
         /sitemap.xml /robots.txt /this-does-not-exist; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' -m 45 http://localhost:3000$p)  $p"
done
```

- All content and funnel routes → **200**
- Unknown route → **404** with the custom page
- `/home` → `/` and `/football` → `/watch/premier-league` are the only redirects.
  **Any redirect pointing off this domain is a defect** — traffic must convert here.

Then check the browser console on each major page for JavaScript errors, and confirm
every header and footer link resolves.

---

## STEP 3 — Funnel integrity

The commercial path is half the product. Verify it end to end:

- [ ] `/channels` renders the directory and filters work
- [ ] `/pricing` shows every tier with correct prices, consistent with `/buy`
- [ ] `/buy` and `/free-trial` forms render, validate required fields, and reject bad input
- [ ] `POST /api/orders` and `POST /api/subscribe` accept a valid payload and return a
      sensible status — **do not submit a real order**; test validation with an invalid
      body and confirm a 4xx rather than a 500
- [ ] `/setup/[device]` renders for each supported device
- [ ] `/login` renders and admin auth rejects bad credentials with 401, malformed input
      with 400
- [ ] Pricing shown on marketing pages matches pricing in the funnel — inconsistency
      between them is a real conversion bug

---

## STEP 4 — Data accuracy

The data pages are the acquisition surface; wrong data costs trust and rankings.

- [ ] Live scores reflect today's real fixtures
- [ ] **Season strings are current.** Search for hardcoded seasons:
      `grep -rn "20[0-9][0-9]-20[0-9][0-9]" --include=*.tsx --include=*.ts app lib`
      A hardcoded season silently freezes standings when the new campaign starts.
- [ ] League tables show a plausible number of matches played for the point in the season
- [ ] Kick-off times and broadcaster listings are current
- [ ] Fixture guides for events that have already happened are updated or retired
- [ ] Team badges and player images load, or fall back to letter avatars

---

## STEP 5 — Performance

Thresholds: **LCP ≤ 2.5s · INP ≤ 200ms · CLS ≤ 0.1.**

- [ ] Check bundle sizes in the build output; flag routes far above the shared baseline
- [ ] `grep -rc "<img " --include=*.tsx app components` — raw `<img>` skips AVIF/WebP,
      responsive `srcset` and intrinsic sizing, and contributes to CLS. Use
      `<OptimizedImage />`.
- [ ] Confirm the LCP element is not lazy-loaded and carries `fetchpriority="high"`
- [ ] Verify TTL cache values still match `PATTERNS.md`
- [ ] Confirm no duplicate `Cache-Control` headers (a blanket `next.config.mjs` rule plus
      a per-route header produces two, with undefined precedence)

If you have not measured Core Web Vitals, **say so** — do not estimate them.

---

## STEP 6 — Security

- [ ] `npm audit` — report severity counts and whether fixes are breaking
- [ ] No secrets in source: `grep -rn "apikey=\|Bearer \|password\|secret" --include=*.ts --include=*.tsx app lib`
- [ ] `.env*` files untracked: `git ls-files | grep -i env`
- [ ] Admin auth: rate limited **before** the bcrypt comparison, input validated first
- [ ] Authenticated endpoints (`/api/auth/*`, `/api/admin/*`) send
      `Cache-Control: private, no-store` — never `public`
- [ ] User-supplied HTML sanitised (DOMPurify) wherever `dangerouslySetInnerHTML` is used
- [ ] Security headers present: HSTS, X-Frame-Options, X-Content-Type-Options,
      Referrer-Policy, Permissions-Policy, CSP
- [ ] External links carry `rel="noopener noreferrer"`

---

## STEP 7 — SEO and structured data

- [ ] Every page has a unique title (<60 chars) and description (<155 chars)
- [ ] One `<h1>` per page, sensible heading order
- [ ] Canonical tags correct and pointing to this domain
- [ ] `sitemap.ts` covers all public routes; `robots.ts` rules are sane
- [ ] JSON-LD validates and describes what is actually on the page — no fabricated
      `aggregateRating`, no invented `startDate`, no `Offer` that does not match real
      pricing
- [ ] Internal linking reaches every important page; no orphans
- [ ] `scripts/ping-indexnow.js` submits the right URL list

---

## STEP 8 — Accessibility

- [ ] Images have meaningful `alt` (team crests are content, not decoration)
- [ ] Keyboard navigation works; focus rings visible
- [ ] Colour contrast passes on the dark theme
- [ ] Forms have associated labels and clear error messages
- [ ] Animations respect `prefers-reduced-motion`

---

## STEP 9 — Report

Save to `reports/audit-YYYY-MM-DD.md`:

- Date, commit SHA, environment
- Counts by severity: 🔴 CRITICAL / 🟡 HIGH / 🟢 MINOR / 💡 OPPORTUNITY
- Each finding with file path, line number and the evidence
- **An explicit "Not verified" section** listing everything you could not check and why

Then save `reports/implementation-plan-YYYY-MM-DD.md` with one entry per fix:

```markdown
## Fix [N]: [Title]
- **Severity**:
- **File(s)**:
- **Current state**: (with line numbers)
- **Required change**:
- **Verification**: exact command and expected output
- **Source**: what produced this finding
```

Priority: broken functionality and security first, then data accuracy, then performance
and SEO, then polish.

---

## STEP 10 — Update the memory bank

- `memory-bank/PROGRESS.md` — active context, new bugs in the Trouble Registry, next steps
- `memory-bank/PROJECT.md` / `PATTERNS.md` — only if the stack, structure or standards
  actually changed

Keep the memory bank short. Verbose findings belong in `reports/`.

**Do not mark an item done without recording the command that proves it.**
