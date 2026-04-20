// Admin logs endpoint
import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { ENV } from "@/lib/config/env"
import { errorLogger } from "@/lib/admin/error-logger"

async function verifyDevSession(request: NextRequest): Promise<boolean> {
  try {
    if (!(!!ENV.JWT_SECRET)) return false
    const token = request.cookies.get("dev-session")?.value
    if (!token) return false
    const jwtSecret = ENV.JWT_SECRET
    await jwtVerify(token, new TextEncoder().encode(jwtSecret))
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  if (!(await verifyDevSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type") as "error" | "warning" | "info" | "api_call" | undefined
  const source = searchParams.get("source") || undefined
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined

  const logs = errorLogger.getLogs({ type, source, limit })
  const stats = errorLogger.getStats()

  return NextResponse.json({ logs, stats })
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyDevSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type") as "error" | "warning" | "info" | "api_call" | undefined

  if (type) {
    errorLogger.clearLogsByType(type)
  } else {
    errorLogger.clearLogs()
  }

  return NextResponse.json({ success: true })
}

