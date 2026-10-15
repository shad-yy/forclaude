import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin-guard"
import { apiMonitor } from "@/lib/api/api-monitor"

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const report = await apiMonitor.generateHealthReport()
    return new NextResponse(report, {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    })
  } catch (err) {
    console.error("GET /api/admin/health/report failed:", err)
    return NextResponse.json({ error: "Upstream timeout or failure" }, { status: 504 })
  }
}
