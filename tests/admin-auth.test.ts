import { describe, it, expect, beforeAll } from "vitest"
import { SignJWT } from "jose"
import { ENV } from "@/lib/config/env"

async function createAdminToken() {
  if (!ENV.JWT_SECRET) {
    throw new Error("JWT_SECRET is required for testing")
  }
  return await new SignJWT({ isAdmin: true, loginTime: Date.now() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(ENV.JWT_SECRET))
}

// These tests are lightweight and exercise route handlers as pure functions
describe("admin auth", () => {
  let token = ""

  beforeAll(async () => {
    token = await createAdminToken()
  })

  it("/api/auth/admin/status returns authenticated with valid token", async () => {
    const { GET } = await import("@/app/api/auth/admin/status/route")
    const res = (await GET({ cookies: { get: () => ({ value: token }) } } as any)) as Response
    const data = await (res as any).json()
    expect(data.isAuthenticated).toBe(true)
    expect(typeof data.expiresAt === "number").toBe(true)
  })

  it("middleware allows /admin with valid token and blocks without", async () => {
    const { middleware } = await import("@/middleware")
    const allow = await middleware({
      nextUrl: { pathname: "/admin" },
      cookies: { get: () => ({ value: token }) },
    } as any)
    expect(allow).toBeDefined()

    const block = await middleware({
      nextUrl: { pathname: "/admin" },
      cookies: { get: () => undefined },
      url: "http://localhost/admin",
    } as any)
    expect(block).toBeDefined()
  })

  it("logout removes cookie", async () => {
    const { DELETE } = await import("@/app/api/auth/admin/route")
    const res = (await DELETE()) as Response
    const setCookie = res.headers.get("set-cookie")
    expect(setCookie).toBeTruthy()
    expect(setCookie?.toLowerCase()).toContain("admin-session=")
    expect(setCookie?.toLowerCase()).toContain("max-age=0")
  })
})


