// X-06 — pins the requireAdmin() semantics and refuses drift back
// to hand-rolled per-route JWT preambles.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { SignJWT } from "jose"
import { readFileSync } from "node:fs"

const JWT_SECRET = process.env.JWT_SECRET || "test-only-jwt-secret-do-not-use-in-prod"

async function createAdminToken(): Promise<string> {
  return await new SignJWT({ isAdmin: true, sub: "admin-1", loginTime: Date.now() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(JWT_SECRET))
}

let cookieValue: string | undefined
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) =>
      name === "admin-session" && cookieValue ? { value: cookieValue } : undefined,
  }),
}))

describe("X-06 requireAdmin guard behaviour", () => {
  beforeEach(() => {
    cookieValue = undefined
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns 401 when no admin-session cookie is set", async () => {
    const { requireAdmin } = await import("@/lib/auth/admin-guard")
    const result = await requireAdmin()
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.response.status).toBe(401)
  })

  it("returns 401 when cookie carries an invalid token", async () => {
    cookieValue = "not-a-real-jwt.at-all.nope"
    const { requireAdmin } = await import("@/lib/auth/admin-guard")
    const result = await requireAdmin()
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.response.status).toBe(401)
  })

  it("returns 503 with a generic message when JWT_SECRET is missing (no config-detail leak)", async () => {
    vi.stubEnv("JWT_SECRET", "")
    vi.resetModules() // ensure ENV re-reads the stubbed value
    const { requireAdmin } = await import("@/lib/auth/admin-guard")
    const result = await requireAdmin()
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.response.status).toBe(503)
    const body = await result.response.json()
    expect(
      body.error,
      "the error body must not name JWT_SECRET — that would leak which env-var is misconfigured",
    ).not.toMatch(/JWT_SECRET/i)
  })

  it("returns ok:true with the decoded payload when a valid admin token is present", async () => {
    cookieValue = await createAdminToken()
    const { requireAdmin } = await import("@/lib/auth/admin-guard")
    const result = await requireAdmin()
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.payload.isAdmin).toBe(true)
    expect(result.payload.sub).toBe("admin-1")
  })
})

describe("X-06 tripwire — every admin route uses requireAdmin", () => {
  const ADMIN_ROUTES = [
    "app/api/admin/metrics/route.ts",
    "app/api/admin/health/route.ts",
    "app/api/admin/health/report/route.ts",
    "app/api/admin/provision-test-trial/route.ts",
    "app/api/auth/admin/extend/route.ts",
  ]

  for (const route of ADMIN_ROUTES) {
    it(`${route} uses requireAdmin (no hand-rolled JWT preamble)`, () => {
      const src = readFileSync(route, "utf8")
      expect(src, `${route} must import requireAdmin from @/lib/auth/admin-guard`).toMatch(
        /import\s+\{[^}]*requireAdmin[^}]*\}\s+from\s+["']@\/lib\/auth\/admin-guard["']/,
      )
      // The classic hand-rolled preamble uses `jwtVerify` in the same
      // file. After migration only the shared guard should reach for
      // jose's jwtVerify. `extend` is a special case (also SIGNS a
      // token) so it keeps the SignJWT import — but not jwtVerify.
      const hasJwtVerify = /\bjwtVerify\b/.test(src)
      expect(
        hasJwtVerify,
        `${route} still calls jwtVerify directly — the whole point of X-06 is that only the shared guard does`,
      ).toBe(false)
    })
  }
})
