// C-02 — helper factories for MSW request handlers. Each helper
// returns a handler that MSW's setup can `server.use(...)` per-test
// to simulate a specific upstream state (outage, throttling, exact
// payload) at the network seam.
//
// Why factories, not one big handlers array: every test should
// declare only the upstream states it depends on. Sharing a global
// "here are all the sensible defaults" list makes it impossible to
// tell whether the assertion is exercising the seam or accidentally
// matching a stub.

import { http, HttpResponse } from "msw"

/**
 * Simulate a 5xx outage at the given URL (exact match or pattern).
 * Use this to prove a route surfaces upstream faults instead of
 * returning 200 + empty (api-fault-vs-absence hybrid rule).
 */
export function down(url: string, status: 500 | 502 | 503 | 504 = 503) {
  return http.get(url, () =>
    HttpResponse.json({ error: "simulated outage" }, { status }),
  )
}

/**
 * Simulate a 429 rate-limit response.
 */
export function rateLimited(url: string) {
  return http.get(url, () =>
    HttpResponse.json({ error: "rate limited" }, { status: 429, headers: { "Retry-After": "60" } }),
  )
}

/**
 * Simulate a successful JSON response with a chosen body.
 * Prefer this over ad-hoc HttpResponse.json in tests so every stub
 * reads with the same shape.
 */
export function ok<T>(url: string, body: T, init?: { status?: number; headers?: Record<string, string> }) {
  return http.get(url, () =>
    HttpResponse.json(body as any, {
      status: init?.status ?? 200,
      headers: init?.headers,
    }),
  )
}

/**
 * Simulate a request that never resolves — the underlying route's
 * timeout / abort logic can then be exercised. Handler returns a
 * pending Promise; MSW will not auto-timeout.
 */
export function hangs(url: string) {
  return http.get(url, () => new Promise<Response>(() => {}))
}
