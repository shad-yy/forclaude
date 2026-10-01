import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin-guard"
import { apiMonitor } from "@/lib/api/api-monitor"

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const health = await apiMonitor.checkAllApis()
    return NextResponse.json(health)
  } catch (err) {
    console.error("GET /api/admin/health failed:", err)
    return NextResponse.json({ error: "Upstream timeout or failure" }, { status: 504 })
  } finally {
    clearTimeout(timer)
  }
}
