/**
 * Time limits for API routes that wait on TheSportsDB.
 *
 * Every TheSportsDB call goes through makeRequest → enqueueRateLimit(), which
 * serialises requests 2400ms apart (RATE_LIMIT_MS) and retries a 5xx twice.
 * A route that awaits that queue without a ceiling can run past the Vercel
 * function limit, and the caller then gets a gateway timeout (or, with a
 * longer limit, a request that hangs) instead of the route's own 503.
 * Measured for /api/spotlight on 2026-10-10 (QA-LOG R-26):
 *
 *   three cached calls, total outage   19236 ms
 *   one call + 3s budget, outage        3006 ms, 503 + no-store
 *
 * Routes therefore make one blocking call under REQUEST_BUDGET_MS and read
 * anything optional through ifAlreadyCached().
 */

/** Allows the first retry (attempts at ~0s and ~2.6s) and cuts off the third. */
export const REQUEST_BUDGET_MS = 3_000

/** Long enough for a cache hit, too short to queue for a rate-limit slot. */
export const CACHE_HIT_MS = 300

/**
 * Reject if `work` has not settled within `ms`, so a slow or dead upstream
 * cannot hold the request open past the function limit.
 */
export async function withinBudget<T>(work: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const budget = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label}: exceeded ${ms}ms budget`)), ms)
  })
  try {
    return await Promise.race([work, budget])
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Resolve to `work`'s value if it is already cached (settles almost at once),
 * otherwise to an empty list. Never rejects: this is for optional data, and a
 * failure here must not turn a good response into a 503.
 *
 * The losing promise is left running on purpose — swrGet still fills the
 * cache for the next request — so its rejection is swallowed.
 */
export async function ifAlreadyCached<T>(work: Promise<T[]>): Promise<T[]> {
  work.catch(() => {})
  try {
    return await withinBudget(work, CACHE_HIT_MS, "cache-only read")
  } catch {
    return []
  }
}
