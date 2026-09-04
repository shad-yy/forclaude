import { NextResponse } from "next/server"
import { z } from "zod"

const subscribeSchema = z.object({
  email: z.string().email().max(200).toLowerCase().trim(),
})

// Module-level rate limiter (typed, no globalThis as any)
const rateLimitMap = new Map<string, number>()

export async function POST(request: Request) {
  try {
    // Parse form data or JSON
    let email: string
    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      email = (formData.get("email") as string) || ""
    } else {
      const body = await request.json()
      email = body.email || ""
    }

    // Validate with Zod
    const parsed = subscribeSchema.safeParse({ email })
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        message: "Please enter a valid email address.",
      }, { status: 400 })
    }

    const validEmail = parsed.data.email

    // Rate limit: 1 subscribe per email per 60 seconds
    const now = Date.now()
    const last = rateLimitMap.get(validEmail) || 0
    if (now - last < 60_000) {
      return NextResponse.json({
        success: false,
        message: "Please wait before trying again.",
      }, { status: 429 })
    }
    rateLimitMap.set(validEmail, now)

    // Clamp map size to prevent unbounded growth
    if (rateLimitMap.size > 1000) {
      const oldest = [...rateLimitMap.entries()].sort((a, b) => a[1] - b[1])[0]
      if (oldest) rateLimitMap.delete(oldest[0])
    }

    // Send notification email via Resend
    const resendKey = process.env.RESEND_API_KEY
    const notifyEmail = process.env.ORDER_NOTIFY_EMAIL || "support@smartlivetv.co.uk"

    if (resendKey && resendKey !== "your-resend-key") {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Smart Live TV <noreply@smartlivetv.co.uk>",
            to: [notifyEmail],
            subject: `New Newsletter Subscriber: ${validEmail}`,
            html: `
              <div style="font-family: Arial, sans-serif;">
                <h2 style="color: #00e676;">New Newsletter Subscriber</h2>
                <p><strong>Email:</strong> ${validEmail}</p>
                <p><strong>Time (UTC):</strong> ${new Date().toUTCString()}</p>
              </div>
            `,
          }),
        })
      } catch (emailErr) {
        console.error("[SUBSCRIBE] Email notification failed:", emailErr)
      }
    } else {
      console.warn("[SUBSCRIBE] RESEND_API_KEY not configured — subscriber email not sent:", validEmail)
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to our newsletter!",
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to subscribe. Please try again later.",
    }, { status: 500 })
  }
}
