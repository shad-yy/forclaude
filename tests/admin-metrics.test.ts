import { describe, it, expect, vi } from "vitest"
import { SignJWT } from "jose"

// A-11: NEVER commit a real JWT_SECRET value. Falls through to vitest.config.ts's
// env stub for local runs. See standing correction O-01 in memory-bank/QA-LOG.md
// and the enforcer at tests/no-credential-shaped-hex-in-repo.test.ts.
const JWT_SECRET = process.env.JWT_SECRET || "test-only-jwt-secret-do-not-use-in-prod"

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



