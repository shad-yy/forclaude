// Hidden admin login endpoint - /api/dev/login
// This route is intentionally not documented and should be kept secret
import { type NextRequest, NextResponse } from "next/server"
import { SignJWT } from "jose"
import { ENV } from "@/lib/config/env"
import bcrypt from "bcryptjs"

// Admin password hash - securely stored
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH || "$2b$12$QXBy8pCCpiPLV4rFJdV0uenwSVmgysvwXe7bFTAFwIN4MbD6UD.3K"

export async function POST(request: NextRequest) {
  try {
    if (!(!!ENV.JWT_SECRET)) {
      return NextResponse.json(
        { success: false, message: "JWT_SECRET environment variable is required" },
        { status: 500 }
      )
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ success: false, message: "Password required" }, { status: 400 })
    }

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    ;(globalThis as any).__devRateLimit = (globalThis as any).__devRateLimit || new Map<string, { count: number; ts: number }>()
    const windowMs = 5 * 60 * 1000
    const limit = 5
    const entry = (globalThis as any).__devRateLimit.get(ip)
    const now = Date.now()
    if (!entry || now - entry.ts > windowMs) {
      ;(globalThis as any).__devRateLimit.set(ip, { count: 1, ts: now })
    } else {
      entry.count += 1
      if (entry.count > limit) {
        return NextResponse.json({ success: false, message: "Too many attempts. Try later." }, { status: 429 })
      }
    }

    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)

    if (!isValidPassword) {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay to prevent brute force
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    const jwtSecret = ENV.JWT_SECRET
    const token = await new SignJWT({
      isAdmin: true,
      loginTime: Date.now(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(jwtSecret))

    const response = NextResponse.json({ success: true, message: "Authentication successful" })

    response.cookies.set("dev-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Dev login error:", error)
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 500 })
  }
}

