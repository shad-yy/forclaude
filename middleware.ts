import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { ENV } from "@/lib/config/env"

const adminAttempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = adminAttempts.get(ip)
  
  if (!record || now > record.resetAt) {
    adminAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return false
  }
  
  if (record.count >= 5) return true
  record.count++
  return false
}

export async function middleware(request: NextRequest) {
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production')
  }

  // Protect /admin routes (legacy admin - can be removed later)
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("admin-session")?.value

    if (!adminToken) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    try {
      if (!ENV.JWT_SECRET) {
        return NextResponse.redirect(new URL("/", request.url))
      }
      await jwtVerify(adminToken, new TextEncoder().encode(ENV.JWT_SECRET))
    } catch {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] 
      || request.headers.get('x-real-ip') 
      || '0.0.0.0'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many attempts' }, 
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
