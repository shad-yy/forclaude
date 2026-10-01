# NewsData.io recorded captures

Pins the response shape NewsData.io's `/api/1/news` (and `/api/1/latest`)
endpoints return, per the `contract-tests-recorded-captures` skill.

## Origin

`success-football-news.json` — shape reconstructed from two sources
this session actually checked, not invented:
  1. NewsData.io's public API documentation at
     <https://newsdata.io/documentation> (wrapper shape
     `{status, totalResults, results}`; per-article field names —
     `article_id`, `pubDate`, `image_url`, `source_icon`, `creator`
     as an array, `category` as an array, `country` as an array).
  2. The pre-existing `NewsArticle` interface already checked into
     `lib/api/news.ts` before this session touched it — i.e. a
     developer who had a working `NEWS_API_KEY` at some point wrote
     this interface against a real response.

This session has no `NEWS_API_KEY`, so there is no live capture from
an actual API call. If that ever changes, replace this fixture with
a real captured response (redact anything sensitive first) and note
the date and key-holder in this file.

## Refresh policy

Same as `tests/fixtures/thesportsdb/README.md`: a shape change breaks
the contract test on purpose. Update the fixture and the schema
together, in the same commit, with a QA-LOG note on what changed.
