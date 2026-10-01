import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin-guard"
import { apiMonitor } from "@/lib/api/api-monitor"

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const metrics = apiMonitor.getApiMetrics()
  return NextResponse.json(metrics)
}
