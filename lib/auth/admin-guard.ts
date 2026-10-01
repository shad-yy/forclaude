// X-06 — one place for the admin-session JWT check that five admin
// routes were duplicating in ~20 lines each. Consolidation reduces
// drift risk (a policy change in one route silently missing from the
// other four) and closes an inconsistency the audit found:
//
//   - `metrics` / `health` / `health/report` returned status 500 with
//     a message that named `JWT_SECRET` when the env var was missing
//     — a config-detail leak.
//   - `provision-test-trial` returned 401 in the same case.
//   - `extend` returned 500 with the same detail leak.
//
// Standardised: missing/invalid session → 401; missing/malformed
// `JWT_SECRET` → 503 with a generic message (config error, not an
// auth failure, and no detail leak).
//
// Consumers do:
//     const auth = await requireAdmin()
//     if (!auth.ok) return auth.response
//     // ...use auth.payload.sub / auth.payload.isAdmin as needed
//
// The guard tries Next's request-scoped `cookies()` first (server
// components / route handlers with no NextRequest). Routes that DO
// take a `NextRequest` can pass it explicitly to avoid the
// `cookies()` invocation.

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { cookies as nextCookies } from "next/headers"
import { jwtVerify, type JWTPayload } from "jose"
import { ENV } from "@/lib/config/env"

export type AdminGuardResult =
  | { ok: true; payload: JWTPayload }
  | { ok: false; response: NextResponse }

const COOKIE_NAME = "admin-session"

function unauthorized(reason: "no-session" | "invalid-session"): NextResponse {
  const message =
    reason === "no-session"
      ? "Unauthorized — admin session required"
      : "Unauthorized — admin session invalid or expired"
  return NextResponse.json({ error: message }, { status: 401 })
}

function authUnavailable(): NextResponse {
  // Generic 503 so a misconfigured deployment does not tell the world
  // it is a JWT_SECRET issue. `runtime-env-and-middleware-safety`
  // rule 4: never leak env-var names in a public error body.
  return NextResponse.json(
    { error: "Admin authentication temporarily unavailable" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  )
}

export async function requireAdmin(request?: NextRequest): Promise<AdminGuardResult> {
  const secret = ENV.JWT_SECRET
  if (!secret) return { ok: false, response: authUnavailable() }

  let token: string | undefined
  if (request) {
    token = request.cookies.get(COOKIE_NAME)?.value
  } else {
    // `next/headers` is only usable inside a server-component / route
    // handler request context. Anywhere it would throw, the caller
    // should pass `request` explicitly.
    token = nextCookies().get(COOKIE_NAME)?.value
  }

  if (!token) return { ok: false, response: unauthorized("no-session") }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    return { ok: true, payload }
  } catch {
    return { ok: false, response: unauthorized("invalid-session") }
  }
}
