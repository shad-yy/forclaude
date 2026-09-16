import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { ENV } from "@/lib/config/env"
import { checkRateLimit } from "@/lib/security/rate-limit"

export async function middleware(request: NextRequest) {
  // A-08 (T-ENV-20 recurrence): NEVER throw at middleware top-of-function.
  // A throw here has no per-route fallback — every matched route returns
  // MIDDLEWARE_INVOCATION_FAILED (500). The previous top-level throw on
  // missing JWT_SECRET is now handled per-request below (admin routes
  // redirect to home when the secret is unset; API admin routes each do
  // their own jwtVerify).

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
    // B-06: shared Redis-backed limiter — retires the per-instance Map
    // that made "5 per 15 min" an illusion in serverless (S-06).
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')?.trim()
      || '0.0.0.0'

    const { allowed } = await checkRateLimit({
      key: `admin-api:${ip}`,
      limit: 5,
      windowSeconds: 15 * 60,
    })
    if (!allowed) {
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
