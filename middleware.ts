import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { ENV } from "@/lib/config/env"

export async function middleware(request: NextRequest) {
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

  // Protect /dev routes (hidden admin panel)
  if (request.nextUrl.pathname.startsWith("/dev") && !request.nextUrl.pathname.startsWith("/dev/login")) {
    const devToken = request.cookies.get("dev-session")?.value

    if (!devToken) {
      return NextResponse.redirect(new URL("/dev/login", request.url))
    }

    try {
      if (!ENV.JWT_SECRET) {
        return NextResponse.redirect(new URL("/dev/login", request.url))
      }
      await jwtVerify(devToken, new TextEncoder().encode(ENV.JWT_SECRET))
    } catch {
      return NextResponse.redirect(new URL("/dev/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/dev/:path*", "/api/dev/:path*"],
}
