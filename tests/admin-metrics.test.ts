import { describe, it, expect, vi } from "vitest"
import { SignJWT } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "9fa911726c474edb555a0b5877e510082cca38d47ddd8f19870e130a7700ddddc87586565b2c89c00dffcc231af234fbc6b352f7bcbc30f67b693f9102859a5f"

async function createAdminToken() {
  return await new SignJWT({ isAdmin: true, loginTime: Date.now() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(JWT_SECRET))
}

let mockAdminSession: string | undefined = undefined

vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) => (name === "admin-session" && mockAdminSession ? { value: mockAdminSession } : undefined),
  }),
}))

describe("admin metrics endpoints", () => {
  beforeEach(() => {
    mockAdminSession = undefined
  })

  it("/api/admin/health rejects unauthenticated requests with 401", async () => {
    mockAdminSession = undefined
    const { GET } = await import("@/app/api/admin/health/route")
    const res = (await GET()) as Response
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toContain("Unauthorized")
  })

  it("/api/admin/metrics rejects unauthenticated requests with 401", async () => {
    mockAdminSession = undefined
    const { GET } = await import("@/app/api/admin/metrics/route")
    const res = (await GET()) as Response
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toContain("Unauthorized")
  })

  it("/api/admin/metrics returns metrics JSON when authenticated", async () => {
    mockAdminSession = await createAdminToken()
    const { GET } = await import("@/app/api/admin/metrics/route")
    const res = (await GET()) as Response
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toBeDefined()
  })
})



