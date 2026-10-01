---
name: seo-fault-tolerance
description: 404 is the worst available failure on an SEO-critical page — it tells Google the page is gone, and repeated 404s deindex it (weeks to recover from an outage lasting minutes). Reserve 404 for "we genuinely have nothing to say". Sitemap lists only routes independent of upstreams. Canonicals never leak wrong domains. Meta descriptions must generate. JSON-LD is nonce-gated.
---

# 404 is not a soft error

For an unauthenticated content site, a 404 is a message to search engines: this URL is gone. Google acts on it — the URL falls out of the index, backlinks to it decay, and recovery takes weeks even after the fix.

That means 404 must be reserved for **one** case: "the entity you requested does not exist and no page has ever answered for it". Any other use — a provider fault, a rate limit, a cold cache, a missing key — is a self-inflicted deindexing event.

## Incidents

**T-ENV-21.** Missing `TMDB_API_KEY` → every `/where-to-watch/*` returned 404. That single dashboard change deindexed a whole route family.

**F-01/F-02.** `getFixture` caught every error and returned null. Pages turned null into `notFound()`. A single provider hiccup on `getMatchDetail` 404'd the match page, and `Promise.allSettled` returning `[]` 404'd every league page at once during a total outage.

**Bulk fixture generation.** A page requested league **4735** — Shoot Boxing, a Japanese kickboxing promotion — and rendered "Next fixture: TBA" with an empty table, which is indistinguishable from a correct id out of season. Wrong SEO: an empty page with a real title takes an indexing slot that a correct id could have.

## Rules

1. **Reserve 404 for genuine absence.** No fault path ever leads to `notFound()`. If the primary source is unreachable, fall back to owned data, another source, or serve "we could not check just now" — anything but 404.
2. **Sitemap contains only routes independent of upstreams.** If `/watch/[slug]` depends on TheSportsDB being up to render, do not include it in the sitemap. `sitemap.ts` should be assertable from local data alone.
3. **Canonicals never name another domain.** A hardcoded canonical is a security-and-SEO defect in one — every request bearing the wrong `<link rel="canonical">` cedes ranking to that domain. `baseURL` must derive from the request or an env var; never from a literal.
4. **Meta descriptions generate.** Missing meta descriptions are drop-in-ranking territory. Every post schema declares one; a structural test refuses posts without one, and a Playwright test asserts each `/blog/*` serves a non-empty `<meta name="description">`.
5. **Every JSON-LD block carries the CSP nonce.** No nonce, no script; JSON-LD is a script. The nonce is set in middleware; every server component reading `headers()` uses it.
6. **Titles say something.** `Where to watch ${name}` where `name = ""` renders as "Where to watch " on an indexed page. The schema layer refuses to publish a nameless title (returns null → 404 is correct here, because the entity is not describable).
7. **Robots policy on non-canonical states.** `stale`/`unknown`/`degraded` pages set `robots: { index: false, follow: true }` in their metadata. Search engines still crawl links; they don't index the transient state.
8. **`notFound()` is a search-engine instruction.** Treat it that way.

## Implementation

```tsx
// app/where-to-watch/[country]/page.tsx
async function resolveCountry(param: string) {
  const code = param.toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return null

  const regions = isTmdbConfigured() ? await getAvailableRegions() : []
  if (regions.length === 0) {
    // TMDB unreachable or unconfigured — answer from owned data instead of 404ing.
    return ownCoverage().has(code) ? { code, name: countryName(code) } : null
  }
  if (!regions.includes(code) && !ownCoverage().has(code)) return null
  return { code, name: countryName(code) }
}

export default async function Page({ params }: { params: { country: string } }) {
  const resolved = await resolveCountry(params.country)
  if (!resolved) notFound()                                // only for genuine absence
  // …render with FilmSection that shows "We could not check just now" if TMDB failed
}
```

```ts
// app/sitemap.ts — no upstream, ever
export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://your.site"
  return [
    { url: `${base}/`, lastModified: new Date() },
    ...activeCompetitionGuides().map(g => ({ url: `${base}/watch/${g.slug}` })),
    ...ownCoverage().values().map(code => ({ url: `${base}/where-to-watch/${code.toLowerCase()}` })),
  ]
}
```

```tsx
// A status/probe page — do not index
export const metadata: Metadata = {
  title: "Status",
  robots: { index: false, follow: true },
}
```

## Verification

- **No 404 during a provider outage.** Build with credentials stripped; assert every route in the sitemap returns 200.
- **Sitemap is data-derived.** Test asserts `sitemap()` output matches the union of owned routes.
- **Canonicals resolve to this site.** e2e: every page's `<link rel="canonical">` starts with `PLAYWRIGHT_BASE_URL`.
- **Every blog post has meta description.** Structural test: every `/blog/**/*.mdx` frontmatter has `description`; e2e: rendered HTML carries it.
- **JSON-LD has nonce.** e2e: every `<script type="application/ld+json">` has `nonce=`.
- **Robots on non-canonical routes.** e2e: `/status`, `/api/*`-linked landings set `noindex` where appropriate.

## Anti-patterns

- Any `catch (e) { notFound() }` in a server component.
- Sitemap generated by hitting a provider.
- `<link rel="canonical" href="https://competitor.com/..." />` — happens more often than you'd think when copying `next-seo` config.
- Empty `metaDescription` because "the client dropped it during generation".
- Rendering "Next fixture: TBA" without checking whether the entity actually exists.
- Indexing status pages, admin, previews, or draft routes.

## Related

- `api-fault-vs-absence` — the rule this is the SEO consequence of.
- `runtime-env-and-middleware-safety` — the nonce is set in middleware.
- `honest-health-status` — the "declare and don't index" pattern.
