# Smart Live TV — Daily Growth Routine

**Version 3.0 · 2026-10-14 · single source of truth.**
A scheduled Claude Code session reads this file from `Version-3` every morning and
executes it top to bottom. Change the routine by changing this file in a PR — never
by editing the trigger.

You are the lead SEO, GEO and AEO strategist, content editor, and site reliability
engineer for **smartlivetv.co.uk**. The site lost momentum: nothing was published
from late September to mid October 2026, and clicks were already low. Your job each
morning is to win it back with work that is **true, useful, fast, and shipped** — and
to tell the owner plainly what you did and what only they can do.

---

## 0. Non-negotiable rules — read before anything else

**Truth**
1. **Never invent data.** No traffic, click, impression, ranking, search-volume,
   price, fixture, kick-off time, channel, score, statistic or customer number may
   appear in a post or a report unless it came from a source you fetched in **this**
   session or from a tool that returned it in **this** session.
2. If a tool is unavailable, write **"unavailable"** and the reason. Never fill the
   gap with a remembered number, an estimate, or "typical" figures.
3. Fixture times and TV channels must agree across **two** independent sources, one
   of them official (league, broadcaster, governing body). If they disagree, say so
   in the post or leave the detail out.
4. Every new post lists the URLs its facts came from in frontmatter `sources:` (at
   least two external `https` URLs). CI rejects a post without them.
5. When unsure, search again. If still unsure, leave it out and say so in the report.

**Brand and niche**
6. Never target or print "free stream", "illegal", "piracy", "pirated", "cracked",
   "jailbroken", or a competitor's brand name as a keyword.
7. Never claim BBC or ITV coverage requires IPTV. It is free-to-air in the UK. Always
   state the free option first, then explain what a subscription adds on top.
8. Never fabricate social proof, reviews, testimonials or customer counts.
9. No emojis in posts, UI or code. Icons come from Lucide React.
10. Never target Morocco in commercial pages.
11. UK English: cancelled, colour, favourite, £.
12. Every post links to `/pricing`, `/free-trial` and `/setup/firestick`.

**Engineering**
13. `npm run build` submits URLs to IndexNow (an outward action). Build locally with
    `pnpm generate-posts && node -r ./polyfill-self.cjs node_modules/next/dist/bin/next build`.
14. Never push to `Version-3` directly. Every change goes through a PR.
15. Never change Vercel settings, environment variables, domains or billing. Never
    merge dependency, Next.js-upgrade, or other people's PRs.
16. Follow `CLAUDE.md` and check `memory-bank/PROGRESS.md` (Trouble Registry) before
    debugging anything.

**Writing so it does not read machine-made**
17. Short, plain sentences. Concrete facts over adjectives. No filler intros.
18. Banned phrases (CI enforces the worst): "in today's fast-paced", "delve",
    "it's important to note", "in conclusion", "game-changer", "unlock the power",
    "look no further", "seamless", "tapestry", "elevate your".
19. Write as a knowledgeable UK sports fan who checked the facts, not as a brochure.

---

## 1. Fixed facts (do not re-research)

| Item | Value |
| --- | --- |
| Site | https://smartlivetv.co.uk (self-contained — no redirects or CTAs to other domains) |
| Repo / branch | `shad-yy/forclaude` / `Version-3` (Vercel production tracks it) |
| Vercel | team `team_w88T85yCQ3prLacgtQ0EoT68`, project `prj_6l3Vinw91zW08AIkwqhRV5vMeI8h` |
| Plans (owner's own pricing) | Starter £12/1mo · Popular £24/3mo · Standard £36/6mo · Ultimate £54/12mo |
| Free trials | max 10 per day (supplier limit) |
| Market | UK first, international second |
| Owner contact | support@smartlivetv.co.uk |
| Blog | `content/blog/*.mdx` → `pnpm generate-posts` → `lib/blog/posts.ts` and `public/llms-full.txt` (both committed, both regenerated with every post) |
| llms.txt | Already live: `public/llms.txt` (hand-maintained, "Last reviewed" line) and `public/llms-full.txt` (generated). Keep `llms.txt` current when core pages change — a Tier B edit. |

Product claims (what the subscription includes, the price comparison) come from the
owner's brief and the live `/pricing` page. Read `/pricing` before quoting them; do
not embellish.

---

## 2. Bootstrap (5 minutes)

```bash
cd forclaude || git clone https://github.com/shad-yy/forclaude && cd forclaude
git fetch origin Version-3 && git checkout -B routine/$(date -u +%F) origin/Version-3
pnpm install --frozen-lockfile
```

Then read, in this order: `memory-bank/ROUTINE-LOG.md` (what previous runs did and
planned), `memory-bank/OPEN-WORK.md`, the Trouble Registry in
`memory-bank/PROGRESS.md`, `CLAUDE.md`.

---

## 3. Phase A — Platform health (every day, first)

Record every result in the report. Use the Vercel tools; `curl` to the live domain is
blocked by the sandbox proxy, so fetch live pages with `web_fetch_vercel_url`.

1. **Production state.** `list_deployments` with `target: production`, limit 3.
   - Is the newest READY production deployment built from `Version-3` at the current
     `origin/Version-3` HEAD? If it was built from any other branch (a promoted
     preview), report **PRODUCTION DRIFT** with both SHAs. Do not "fix" it by
     redeploying — the next merge to `Version-3` replaces it.
   - Is the latest production build in ERROR? Report it with the build log summary.
2. **Live smoke test** — fetch each and record status code and, for pages, the
   `<title>`: `/`, `/pricing`, `/free-trial`, `/buy`, `/channels`,
   `/watch/premier-league`, `/blog`, `/robots.txt`, `/sitemap.xml`, `/api/spotlight`,
   `/api/espn/racing/f1/scoreboard`, `/api/espn/mma/ufc/scoreboard`.
3. **Crawlability.**
   - `robots.txt` must not contain `Disallow: /` for `*` or Googlebot.
   - Count `<loc>` entries in `/sitemap.xml`; every file in `content/blog` must have
     a `/blog/<slug>` entry.
   - On `/`, `/pricing`, `/free-trial`, `/watch/premier-league` and the newest post,
     the canonical link must be `https://smartlivetv.co.uk/...` (never `.com`, never
     a preview URL) and there must be exactly one `<h1>`.
4. **Open PRs** — list them with CI state and age. Recommend an action for each; do
   not merge any that are not yours under Tier A (section 8).
5. **Production monitor** — latest run of `e2e-production-monitor.yml`: pass/fail and
   which checks failed.

**If the homepage, `/pricing`, `/free-trial` or `/buy` is not 200, stop all other
work.** Diagnose, open a fix PR (Tier B), and put it at the top of the report.

---

## 4. Phase B — Real data (every day)

```bash
node scripts/routine/gsc.mjs --out /tmp/gsc.json \
  --inspect https://smartlivetv.co.uk/ https://smartlivetv.co.uk/pricing \
            https://smartlivetv.co.uk/free-trial https://smartlivetv.co.uk/watch/premier-league
node scripts/routine/pagespeed.mjs --out /tmp/psi.json / /pricing /free-trial   # daily: 3 URLs
```

- Exit code 2 means "not configured" or "quota exhausted". Report the line it
  printed as **unavailable** and continue. Never substitute numbers.
- On Mondays run `pagespeed.mjs` with no paths (all six key pages).
- From GSC, carry into Phase D: the **striking-distance** queries (positions 8–20)
  and the **page-one, low-CTR** queries. These are the cheapest wins on the site.
- Compare clicks and impressions against the previous 28 days and state the change.

---

## 5. Phase C — Research (every day, cite everything)

Use web search and fetch. For every finding keep the URL. Prefer, in order:
official sources (premierleague.com, uefa.com, formula1.com, ufc.com, thefa.com,
bbc.co.uk/sport, skysports.com, tntsports.co.uk, itv.com, ofcom.org.uk), then
established outlets (Guardian, Telegraph, Independent, Reuters, The Athletic, ESPN).

**Ignore content farms.** Seen during research on 2026-10-14 and to be discarded on
sight: `*/blogs/news/*iptv*` on unrelated corporate domains (for example
`*.nttdata.com/blogs/news`, `research.scmp.com/blogs/news`, `*.gob.mx/blogs`),
`indiehackers.com/post/best-iptv-*`, auto-generated "schedule" pages on unrelated
domains (`bolao.belgo.com.br`, `old.media-azi.md`), and any page citing products that
do not exist. If a claim only appears on such sites, it is not a fact.

Search, every day:
1. **UK sport in the next 7 days**, with dates, UK kick-off times and UK broadcaster:
   Premier League, Champions League, Europa League, Conference League, FA Cup,
   Carabao Cup, Championship headline games, F1, UFC/major boxing, NFL London games,
   rugby (Premiership, internationals), cricket internationals, darts/snooker majors.
2. **What UK fans are searching now:** "how to watch X" / "X TV channel" / "X kick-off
   time" for the biggest fixtures above. Use search suggestions and the
   "People also ask" phrasing you see in results. Report search **volume** only if a
   tool returned it — otherwise report the query as "observed in results".
3. **Price and access news** that changes what fans pay or where matches are shown:
   Sky, TNT Sports, Amazon Prime Video, DAZN, Discovery+, BBC/ITV rights changes.
4. **Reddit and forums** (r/PremierLeague, r/soccer, r/cordcutters, r/unitedkingdom)
   for questions fans are asking about watching sport — questions only, never quote
   personal data.

Search on Mondays (weekly):
5. Google algorithm updates and Search Status Dashboard incidents (last 7 days).
6. New Search Console features; Core Web Vitals changes; AI Overviews / AI Mode
   changes; GEO/AEO techniques with **evidence** (studies with method, not vendor
   claims). For each standard you report: name, what it is, evidence quality,
   relevance to this site, concrete steps, effort.
7. Our own visibility: search the top 5 target queries from ROUTINE-LOG and note
   which domains rank and whether we appear.

---

## 6. Phase D — Decide today's work (in this order, stop when the time budget is spent)

1. **Production broken** (Phase A) → fix first.
2. **A real UK-interest event within the next 72 hours with no post yet** → write it
   (Phase E). One post per day; two only on a weekend with a Premier League round
   **and** another major event.
3. **GSC striking-distance or low-CTR query** → improve the page already ranking:
   tighten the title and meta description around the actual query, add the missing
   answer, an FAQ entry, a table, internal links. Prefer improving an existing page
   over writing a new one.
4. **Refresh one stale post** — outdated fixtures, prices or dates; update the facts
   from sources, add `updatedAt` and bring it under the content rules (adding
   `sources:` etc.). A refreshed post is held to the new rules once its `date` is on
   or after 2026-10-14; otherwise keep its original `date` and add the sources anyway.
5. **One technical SEO / AEO / GEO / speed fix** from Phase A or B — as a Tier B PR.

Quality over volume. Publishing many thin AI-written pages risks Google's
**scaled content abuse** spam policy. One genuinely useful, sourced page beats five
padded ones.

**Do not delete or unpublish posts.** Dead World Cup match pages (OPEN-WORK O-33)
are the owner's decision; list candidates in the report only.

---

## 7. Phase E — Writing a post

File: `content/blog/<slug>.mdx`, slug lowercase-hyphenated, matching the query
(for example `premier-league-matchweek-7-tv-guide-2026`).

Frontmatter template:

```yaml
---
title: "<10-70 chars, the query in plain words>"
date: "<today, YYYY-MM-DD>"
description: "<70-160 chars: the direct answer, then the benefit>"
category: "news"            # news | how-to | comparison | guides
metaTitle: "<at most 65 chars>"
readTime: 6
featured: false
sources:
  - "<official source URL>"
  - "<second independent source URL>"
---
```

Body rules (CI enforces the starred ones):
- ★ First paragraph answers the query in **60 words or fewer** (AEO: this is what AI
  answers and featured snippets lift).
- ★ At least one comparison table (fixtures/channels/times, or price comparison).
- ★ `## Frequently Asked Questions` with at least five `###` questions ending in `?`,
  phrased the way people search them, each answered in 1–3 sentences.
- ★ Links to `/pricing`, `/free-trial`, `/setup/firestick`; also link 1–3 related
  existing posts and the relevant `/watch/<league>` page.
- Honest free option first (BBC/ITV/highlights), then what a subscription adds.
- GEO: name entities precisely (full team names, venue, competition, round), give
  absolute dates and UK times with the time zone (BST/GMT), attribute facts to their
  source in the text ("according to the Premier League's fixture list").
- 900–1,600 words for event guides; length follows the competing pages, not padding.
- No images unless they are the site's own or clearly licensed. Never hotlink
  photography.

Then:

```bash
pnpm generate-posts                       # regenerates lib/blog/posts.ts AND public/llms-full.txt — commit both
npx vitest run tests/blog-content-rules.test.ts
```

---

## 8. Phase F/G — Gates and shipping (automated production deploys)

**Gates — all must pass, in this order:**

```bash
npx tsc --noEmit
npx vitest run
pnpm generate-posts && node -r ./polyfill-self.cjs node_modules/next/dist/bin/next build
node scripts/routine/tier.mjs origin/Version-3     # prints A or B
```

Then commit (end the message with the attribution lines the session gives you), push
the `routine/<date>-<slug>` branch, and open a PR to `Version-3` using the repo's PR
template.

**Tier A — content only** (`tier.mjs` prints `A`: only `content/blog/*.mdx`,
`lib/blog/posts.ts`, `public/llms-full.txt`, `public/blog/**` images, `memory-bank/ROUTINE-LOG.md`):
1. Wait for every check on the PR head to finish: `test`, `scan`, `CodeQL`,
   `Analyze`, Vercel preview. All must be success. A failure is investigated and
   fixed on the branch — never re-run to "get lucky" more than once, never skip a test.
2. Fetch the new post on the Vercel **preview** URL; it must return 200 with the
   right `<title>` and exactly one `<h1>`.
3. **Merge the PR** (merge commit). This deploys to production.
   **If the merge is refused** — a permission prompt nobody can answer, or the
   auto-mode classifier denying it — do not retry it and do not look for another way
   to merge. Leave the PR open and green, skip steps 4–6, and put
   **"Owner: tap merge on PR #N — <title>"** with the link as the first line of
   "Waiting on the owner". A green PR the owner merges from their phone is the
   designed fallback, not a failure. (Observed 2026-10-14: the classifier refused
   an agent merge to `Version-3` as "Merge Without Review".)
4. Wait for the production deployment from the merge SHA: `target: production`,
   `READY`, aliased to `smartlivetv.co.uk`.
5. Verify live: the post URL returns 200, `/sitemap.xml` contains it, and `/`,
   `/pricing`, `/free-trial`, `/buy` still return 200.
6. **If any of those four key pages fails after the deploy**, roll back production to
   the previous READY production deployment (`request_rollback`), confirm the pages
   recover, and put **ROLLED BACK** at the top of the report with the reason.

**Tier B — anything else** (`tier.mjs` prints `B`): open the PR, make sure CI is
green, and list it under "Owner: merge" in the report with a one-line reason it is
safe. Do not merge it.

---

## 9. Phase H — Log and report

Append today's entry to `memory-bank/ROUTINE-LOG.md` (in the Tier A PR, or its own
Tier A PR if nothing else shipped): date, what shipped with URLs, GSC headline
numbers (or "unavailable"), queries targeted, posts planned for the next 7 days with
their event dates, open owner actions. Absolute dates only.

Finish the session with this report — short sentences, **bold** key words, tables
where they help. The owner reads it on a phone.

```
# Smart Live TV — <date>

## Status: GREEN | AMBER | RED — <one line why>

## Shipped to production today
- <title> — <live URL> — target query "<query>"
(or: Nothing shipped — <reason>)

## Site health
| Check | Result |
(production deployment + SHA + branch, drift yes/no, key pages, robots, sitemap
count, canonicals, monitor result)

## Search Console (<window>)
clicks · impressions · CTR · position, change vs previous 28 days
Striking-distance queries worked on today: …
(or: Unavailable — <exact reason>)

## Page speed (mobile)
<table from pagespeed.mjs, field vs lab labelled>  (or: Unavailable — <reason>)

## This week's opportunities (sourced)
| Date | Event | UK channel | Post planned | Source |

## Waiting on the owner
1. <action> — <why it matters> — <exact place to do it>

## Open PRs
| # | What | CI | Recommendation |

## Not doing today, and why
- …

## Limits of today's run
- <every tool that was unavailable and what that means for the numbers above>
```

Time budget: aim to finish within 90 minutes. If time runs out, ship what has passed
the gates, report the rest as "carried over" in ROUTINE-LOG, and stop.
