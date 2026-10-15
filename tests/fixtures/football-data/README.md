# football-data.org recorded captures

Pins the response shape football-data.org API v4's
`/competitions/{id}/matches` endpoint returns, per
`contract-tests-recorded-captures`.

## Origin

`ucl-matches.json` — shape reconstructed from two sources this
session actually checked, not invented:
  1. football-data.org's public API documentation at
     <https://www.football-data.org/documentation/api> (v4) — the
     `{matches: [...]}` wrapper, and per-match field names (`id`,
     `utcDate`, `status`, `stage`, `homeTeam`/`awayTeam` as
     `{id, name, crest}`, `score.fullTime.{home,away}`).
  2. The pre-existing `FDMatch` interface already checked into
     `lib/api/football-data.ts` before this session touched it.

This session has no `FOOTBALL_DATA_API_KEY` (the app already calls
the API unauthenticated when the key is unset — see
`lib/api/football-data.ts:18`, rate-limited to 10 req/min per
`SETUP-REQUIRED.md`), so there is no live capture from an actual API
call. If that ever changes, replace this fixture with a real
captured response and note the date in this file.

## Scope

Only the `matches` endpoint is covered — the only one this app
actually calls (`getUEFAMatches` / `getUEFAResults` in
`lib/api/football-data.ts`, used by the Champions League and Europa
League watch pages). `FDStanding` exists in that file but has no live
caller, so it has no schema here.

## Refresh policy

Same as the other two providers' fixture READMEs: a shape change
breaks the contract test on purpose. Update the fixture and the
schema together, in the same commit, with a QA-LOG note.
