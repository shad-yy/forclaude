// X-05 — one retry helper for the two live retry ladders that used
// to be hand-rolled separately: `lib/api/the-sports-db.ts::sportsdbFetch`
// (fixed backoff schedule, HTTP-status aware) and
// `lib/cache.ts::fetchWithRetry` (exponential backoff over a generic
// async callback). A third copy lived in `lib/api/api-client.ts`,
// which had zero importers and was deleted (X-01).
//
// Design: `fn` returns the result or throws. `shouldRetry` decides
// whether a given error is worth another attempt — callers encode
// their own "never retry this" rules (rate limits, 4xx) by having
// `shouldRetry` return false for them, or by not throwing at all for
// conditions they want to return immediately (e.g. a 429 becoming a
// plain return value rather than a throw).

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface RetryOptions {
  /** Maximum number of RETRIES after the first attempt. Default 3. */
  maxRetries?: number
  /**
   * Backoff delay before each retry. Either a fixed schedule indexed
   * by attempt number (clamped to the last entry once exhausted), or
   * a function computing the delay from the attempt number (0-based,
   * counting retries, not the first try).
   */
  backoffMs?: number[] | ((attempt: number) => number)
  /** Decide whether a given error is worth retrying. Default: always retry until maxRetries. */
  shouldRetry?: (error: unknown, attempt: number) => boolean
  /** Called before each sleep-then-retry, for logging. */
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void
}

const DEFAULT_BACKOFF = (attempt: number) => 1_000 * 2 ** attempt

function resolveDelay(backoff: RetryOptions["backoffMs"], attempt: number): number {
  if (typeof backoff === "function") return backoff(attempt)
  if (Array.isArray(backoff)) return backoff[Math.min(attempt, backoff.length - 1)]
  return DEFAULT_BACKOFF(attempt)
}

/**
 * Run `fn`, retrying on failure per `options`. `fn` receives the
 * 0-based attempt number (0 on the first call) in case it wants to
 * vary behaviour (e.g. logging "RETRY 2/3").
 */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3
  const shouldRetry = options.shouldRetry ?? (() => true)

  let attempt = 0
  for (;;) {
    try {
      return await fn(attempt)
    } catch (err) {
      if (attempt >= maxRetries || !shouldRetry(err, attempt)) throw err
      const delayMs = resolveDelay(options.backoffMs, attempt)
      options.onRetry?.(err, attempt, delayMs)
      await sleep(delayMs)
      attempt++
    }
  }
}

/** Marker error a caller can throw to signal "this failure is retryable" without re-deriving shouldRetry logic from the error's shape. */
export class RetryableError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
    this.name = "RetryableError"
  }
}
