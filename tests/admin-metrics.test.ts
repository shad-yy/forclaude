import { describe, it, expect } from "vitest"

describe("admin metrics endpoints", () => {
  it("/api/admin/health returns JSON", async () => {
    const { GET } = await import("@/app/api/admin/health/route")
    const res = (await GET()) as Response
    expect(res.ok).toBe(true)
  })

  it("/api/admin/metrics returns JSON", async () => {
    const { GET } = await import("@/app/api/admin/metrics/route")
    const res = (await GET()) as Response
    expect(res.ok).toBe(true)
  })
})



