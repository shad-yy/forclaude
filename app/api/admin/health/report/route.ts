import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { getJwtSecret, hasJwtSecret } from "@/lib/env"
import { apiMonitor } from "@/lib/api/api-monitor"

export async function GET() {
  try {
    if (!hasJwtSecret()) {
      return NextResponse.json(
        {
          error: "JWT_SECRET environment variable is required for admin authentication",
          message: "Please set JWT_SECRET in your environment variables",
        },
        { status: 500 }
      )
    }

    const token = cookies().get("admin-session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized - No admin session token" }, { status: 401 })
    }

    const jwtSecret = getJwtSecret()
    await jwtVerify(token, new TextEncoder().encode(jwtSecret))

    try {
      const report = await apiMonitor.generateHealthReport()
      return new NextResponse(report, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
        },
      })
    } catch (err) {
      console.error("GET /api/admin/health/report failed:", err)
      return NextResponse.json({ error: "Upstream timeout or failure" }, { status: 504 })
    }
  } catch (error) {
    console.error("Admin health report error:", error)
    if (error instanceof Error && error.message.includes("JWT_SECRET")) {
      return NextResponse.json(
        {
          error: "JWT_SECRET environment variable is required",
          message: "Please set JWT_SECRET in your environment variables",
        },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: "Unauthorized - Invalid admin session" }, { status: 401 })
  }
}
