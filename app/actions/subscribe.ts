"use server"

export interface SubscribeState {
  message: string
  status: "idle" | "success" | "error"
}

// Module-level rate limiter (typed, no globalThis cast)
const rateLimitMap = new Map<string, number>()

export async function subscribeToNewsletter(prevState: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = formData.get("email") as string

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return {
      message: "Please enter a valid email address.",
      status: "error",
    }
  }

  try {
    // Rate limit: 1 per email per 60 seconds
    const now = Date.now()
    const last = rateLimitMap.get(email) || 0
    if (now - last < 60_000) {
      return { message: "Please wait before trying again.", status: "error" }
    }
    rateLimitMap.set(email, now)

    // Clamp map size
    if (rateLimitMap.size > 1000) {
      const oldest = [...rateLimitMap.entries()].sort((a, b) => a[1] - b[1])[0]
      if (oldest) rateLimitMap.delete(oldest[0])
    }

    // Send via Resend
    const resendKey = process.env.RESEND_API_KEY
    const notifyEmail = process.env.ORDER_NOTIFY_EMAIL || "support@smartlivetv.co.uk"

    if (resendKey && resendKey !== "your-resend-key") {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Smart Live TV <noreply@smartlivetv.co.uk>",
          to: [notifyEmail],
          subject: `New Newsletter Subscriber: ${email}`,
          html: `<p><strong>New subscriber:</strong> ${email}</p><p>${new Date().toUTCString()}</p>`,
        }),
      })
    } else {
      console.warn(`[SUBSCRIBE] RESEND_API_KEY not configured. Subscriber: ${email}`)
    }

    return {
      message: "Successfully subscribed to our newsletter!",
      status: "success",
    }
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return {
      message: "Failed to subscribe. Please try again later.",
      status: "error",
    }
  }
}
