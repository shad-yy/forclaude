import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import { ENV } from "@/lib/config/env"
import { requireAdmin } from "@/lib/auth/admin-guard"

export async function POST() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  if (!auth.payload.isAdmin) {
    return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 })
  }

  // Guard already returned 503 if JWT_SECRET was missing, so it is
  // guaranteed set here.
  const jwtSecret = ENV.JWT_SECRET as string

  const newToken = await new SignJWT({
    isAdmin: true,
    loginTime: typeof auth.payload.loginTime === "number" ? auth.payload.loginTime : Date.now(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(new TextEncoder().encode(jwtSecret))

  const response = NextResponse.json({ success: true, message: "Session extended" })
  response.cookies.set("admin-session", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60,
    path: "/",
  })
  return response
}
