// X-05 — pins the shared withRetry() contract before migrating the
// two live retry ladders (the-sports-db.ts, lib/cache.ts) onto it.

import { describe, it, expect, vi } from "vitest"
import { withRetry, RetryableError } from "@/lib/api/retry"

describe("X-05 withRetry", () => {
  it("returns the result on first success with no retries", async () => {
    const fn = vi.fn(async () => "ok")
    const result = await withRetry(fn)
    expect(result).toBe("ok")
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("retries on failure up to maxRetries, then succeeds", async () => {
    let calls = 0
    const fn = vi.fn(async () => {
      calls++
      if (calls < 3) throw new Error("transient")
      return "eventually ok"
    })
    const result = await withRetry(fn, { maxRetries: 3, backoffMs: [1, 1, 1] })
    expect(result).toBe("eventually ok")
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it("throws the last error once maxRetries is exhausted", async () => {
    const fn = vi.fn(async () => {
      throw new Error("always fails")
    })
    await expect(withRetry(fn, { maxRetries: 2, backoffMs: [1, 1] })).rejects.toThrow("always fails")
    expect(fn).toHaveBeenCalledTimes(3) // 1 initial + 2 retries
  })

  it("does not retry when shouldRetry returns false", async () => {
    const fn = vi.fn(async () => {
      throw new Error("rate limited")
    })
    await expect(
      withRetry(fn, {
        maxRetries: 5,
        shouldRetry: (err) => !(err instanceof Error && err.message.includes("rate limited")),
      }),
    ).rejects.toThrow("rate limited")
    expect(fn, "must fail fast — no retry attempts for a non-retryable error").toHaveBeenCalledTimes(1)
  })

  it("passes the 0-based attempt number to fn", async () => {
    const seen: number[] = []
    const fn = vi.fn(async (attempt: number) => {
      seen.push(attempt)
      if (attempt < 2) throw new Error("retry me")
      return "done"
    })
    await withRetry(fn, { maxRetries: 3, backoffMs: [1, 1, 1] })
    expect(seen).toEqual([0, 1, 2])
  })

  it("supports a fixed backoff array clamped to the last entry once exhausted", async () => {
    const delays: number[] = []
    let calls = 0
    const fn = vi.fn(async () => {
      calls++
      if (calls <= 4) throw new Error("retry")
      return "ok"
    })
    await withRetry(fn, {
      maxRetries: 4,
      backoffMs: [10, 20],
      onRetry: (_err, _attempt, delayMs) => delays.push(delayMs),
    })
    // attempts 0,1,2,3 retry with backoff[min(attempt,1)] => 10,20,20,20
    expect(delays).toEqual([10, 20, 20, 20])
  })

  it("supports a backoff function", async () => {
    const delays: number[] = []
    let calls = 0
    const fn = vi.fn(async () => {
      calls++
      if (calls <= 2) throw new Error("retry")
      return "ok"
    })
    await withRetry(fn, {
      maxRetries: 3,
      backoffMs: (attempt) => 100 * (attempt + 1),
      onRetry: (_err, _attempt, delayMs) => delays.push(delayMs),
    })
    expect(delays).toEqual([100, 200])
  })

  it("RetryableError is a plain Error subclass usable as a marker", () => {
    const err = new RetryableError("upstream 503", { status: 503 })
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe("RetryableError")
    expect(err.cause).toEqual({ status: 503 })
  })
})
