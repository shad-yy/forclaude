# Routine log — Smart Live TV daily growth routine

The scheduled routine appends one entry per run (newest at the bottom). It is the
routine's memory between fresh sessions: what shipped, what was planned, what is
waiting on the owner. Absolute dates only. Spec: `playbook/routines/daily-growth-routine.md`.

---

## 2026-10-14 — baseline (set up by hand, before the first scheduled run)

**State of the site**
- Last post published: 2026-09-20 (Premier League matchweek 5 recap). Matchweek 6
  (10–12 Oct) got no post. 34 posts in `content/blog`.
- Production: deployment `dpl_Gh4MNYdc3wnHDzQBW2fypDNbnGdZ`, built from the PR #21
  dependabot branch, not `Version-3` (OPEN-WORK O-41).
- `robots.txt` live: allows `/` for all agents including the AI crawlers, disallows
  only `/api/`, `/admin/`, `/dev/`.
- `/api/spotlight` live: HTTP 200, but its six events were US soccer and NCAA
  football — no UK fixtures on a day without a Premier League match.

**Data available to the routine**
- Search Console: unavailable (O-39).
- PageSpeed Insights: unavailable without a key (O-40).
- Keyword volumes: unavailable (Ahrefs plan; no other keyword tool connected).
- Google Trends: blocked by network policy (O-42).
- Web search: available. The live domain is blocked from the sandbox (curl 403,
  WebFetch DNS failure), so live checks come from the production monitor and the
  auto-merge workflow's verify step, both of which run on GitHub's runners.
- The scheduled session itself starts with no repository and no GitHub or Vercel
  tools (test run `session_01XNSqGnihAkw99TCr3KmPTV`, 2026-10-14). It attaches the repo
  with `add_repo` and uses `gh api`. Production drift is read from GitHub's
  Production deployment records, which Vercel writes.
- Merging: the routine never merges. `.github/workflows/routine-automerge.yml` merges
  `routine/*` content-only PRs once all checks pass (owner decision 2026-10-14).

**Correction to the owner's brief:** llms.txt is already implemented — `public/llms.txt`
(hand-maintained, last reviewed 20 Sep 2026) and `public/llms-full.txt` (generated from
every post). The brief header listed it as not implemented.

**Events found (sourced) for the next two weeks**
| Date | Event | Source |
| --- | --- | --- |
| Sat 17 – Sun 18 Oct 2026 | Premier League matchweek 7 (incl. Everton v Chelsea, Tottenham v Coventry, Brighton v Crystal Palace on Sat; Leeds v Manchester United on Sun) | https://www.premierleague.com/en/news/4675097/all-380-fixtures-for-202627-premier-league-season , https://www.skysports.com/share/13574076 |
| Fri 23 – Sun 25 Oct 2026 | F1 United States Grand Prix, COTA Austin; race Sun 25 Oct 20:00 UK | https://www.formula1.com/en/latest/article/formula-1-msc-cruises-united-states-grand-prix-2026.2u6li2pzNhPzL3TSYaagrm |

Kick-off times and UK channels for matchweek 7 were **not** confirmed on 2026-10-14;
the first run must confirm them against two sources before publishing.

**Planned**
1. Matchweek 7 TV guide — publish by Thu 15 Oct 2026.
2. F1 United States GP how-to-watch — publish Mon 19 or Tue 20 Oct 2026.
3. UK-weighted spotlight scoring (Tier B PR) — homepage should not lead with MLS for UK visitors.

**Waiting on the owner**
- O-39 Search Console service account, O-40 PageSpeed key, O-42 Trends domain.
- O-41 production drift (PR #21).
- PR #19 (spotlight cache fix) open since 2026-10-10, CI green.
