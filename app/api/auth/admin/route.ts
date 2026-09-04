import { type NextRequest, NextResponse } from "next/server"
import { SignJWT, jwtVerify } from "jose"
import { ENV } from "@/lib/config/env"
import bcrypt from "bcryptjs"

// Module-level rate limiter (typed, avoids globalThis as any)
const adminRateLimit = new Map<string, { count: number; ts: number }>()

// Admin password hash - securely stored in environment
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export async function POST(request: NextRequest) {
  try {
    // Check if JWT_SECRET is available
    if (!(!!ENV.JWT_SECRET)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "JWT_SECRET environment variable is required for admin authentication" 
        }, 
        { status: 500 }
      )
    }

    const { password } = await request.json()

    if (!ADMIN_PASSWORD_HASH) {
      return NextResponse.json({ success: false, message: "Admin authentication not configured" }, { status: 500 })
    }

    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)

    // Basic IP-based rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const windowMs = 5 * 60 * 1000
    const limit = 10
    const entry = adminRateLimit.get(ip)
    const now = Date.now()
    if (!entry || now - entry.ts > windowMs) {
      adminRateLimit.set(ip, { count: 1, ts: now })
    } else {
      entry.count += 1
      if (entry.count > limit) {
        return NextResponse.json({ success: false, message: "Too many attempts. Try later." }, { status: 429 })
      }
    }
    // Clamp map size to avoid unbounded growth
    if (adminRateLimit.size > 1000) {
      const oldestKey = [...adminRateLimit.entries()].sort((a, b) => a[1].ts - b[1].ts)[0]?.[0]
      if (oldestKey) adminRateLimit.delete(oldestKey)
    }

    if (!isValidPassword) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
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

    response.cookies.set("admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    })

    return response
  } catch (error) {
    console.error("Admin authentication error:", error)
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" })
  response.cookies.set("admin-session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })
  return response
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    if (!(!!ENV.JWT_SECRET)) {
      return false
    }
    const jwtSecret = ENV.JWT_SECRET
    await jwtVerify(token, new TextEncoder().encode(jwtSecret))
    return true
  } catch {
    return false
  }
}
