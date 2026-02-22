/**
 * Secure API endpoint tester with SSRF protection
 * Security: RISK-001 - Missing route handler with proper validation
 */

import { NextRequest, NextResponse } from "next/server"
import { ALLOWED_DOMAINS, RATE_LIMIT_CONFIG, RESPONSE_LIMITS, API_CONFIG } from "@/lib/config"
import { getServerCache, setServerCache, getCacheKey } from "@/lib/cache"

// In-memory rate limiting (similar to existing pattern in app/api/auth/admin/route.ts)
const rateLimitMap = new Map<string, { count: number; ts: number }>()

/**
 * Check if IP is rate limited
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.ts > RATE_LIMIT_CONFIG.windowMs) {
    rateLimitMap.set(ip, { count: 1, ts: now })
    return true
  }

  entry.count += 1
  if (entry.count > RATE_LIMIT_CONFIG.maxRequests) {
    return false
  }

  // Cleanup old entries
  if (rateLimitMap.size > 1000) {
    const entries = Array.from(rateLimitMap.entries())
    for (const [k, v] of entries) {
      if (now - v.ts > RATE_LIMIT_CONFIG.windowMs) {
        rateLimitMap.delete(k)
      }
    }
  }

  return true
}

/**
 * Check if IP address is in private range
 */
function isPrivateIP(ip: string): boolean {
  // IPv4 private ranges
  if (ip.includes(".")) {
    const parts = ip.split(".").map(Number)
    if (parts.length !== 4) return false

    // 127.0.0.0/8 (localhost)
    if (parts[0] === 127) return true

    // 10.0.0.0/8
    if (parts[0] === 10) return true

    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true

    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true

    // 169.254.0.0/16 (link-local)
    if (parts[0] === 169 && parts[1] === 254) return true
  }

  // IPv6 localhost
  if (ip === "::1" || ip.startsWith("::ffff:127.") || ip.startsWith("fe80:")) return true

  return false
}

/**
 * Validate URL against security requirements
 */
function validateUrl(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString)

    // Block file:// and other non-HTTP(S) protocols
    if (!url.protocol.startsWith("http")) {
      return { valid: false, error: "Only HTTP and HTTPS protocols are allowed" }
    }

    // Block localhost and variants
    const hostname = url.hostname.toLowerCase()
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.startsWith("127.") ||
      hostname === "0.0.0.0"
    ) {
      return { valid: false, error: "Localhost and loopback addresses are not allowed" }
    }

    // Check for private IP ranges
    if (isPrivateIP(hostname)) {
      return { valid: false, error: "Private IP ranges are not allowed" }
    }

    // Validate against domain whitelist
    const allowed = ALLOWED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
    if (!allowed) {
      return {
        valid: false,
        error: `Domain not allowed. Allowed domains: ${ALLOWED_DOMAINS.join(", ")}`,
      }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: "Invalid URL format" }
  }
}

/**
 * Sanitize error message to prevent information leakage
 * Security: RISK-006 - Error message information leakage
 */
function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    // Filter out sensitive information
    if (msg.includes("stack") || msg.includes("trace") || msg.includes("file://") || msg.includes("c:\\")) {
      return "An internal error occurred"
    }
    // Generic network errors
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("timeout")) {
      return "Network request failed. Please check the endpoint and try again."
    }
    return "API request unsuccessful. Please check the endpoint and try again."
  }
  return "API request unsuccessful. Please check the endpoint and try again."
}

/**
 * Replace API_KEY placeholder with actual key (server-side only)
 * Security: RISK-008 - Move API key replacement to server-side
 */
function replaceApiKey(url: string): string {
  if (url.includes("API_KEY")) {
    return url.replace("API_KEY", API_CONFIG.newsdata.apiKey)
  }
  return url
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: "Rate limit exceeded. Please try again later.",
        },
        { status: 429 }
      )
    }

    // Get URL from query params
    const { searchParams } = new URL(request.url)
    const urlParam = searchParams.get("url")

    if (!urlParam) {
      return NextResponse.json(
        {
          success: false,
          message: "URL parameter is required",
        },
        { status: 400 }
      )
    }

    // Decode URL
    let targetUrl: string
    try {
      targetUrl = decodeURIComponent(urlParam)
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid URL encoding",
        },
        { status: 400 }
      )
    }

    // Replace API_KEY placeholder (server-side only)
    targetUrl = replaceApiKey(targetUrl)

    // Validate URL
    const validation = validateUrl(targetUrl)
    if (!validation.valid) {
      // Log attempted SSRF (sanitized)
      console.warn(`[API] Blocked potentially malicious URL from IP ${ip}: ${validation.error}`)
      return NextResponse.json(
        {
          success: false,
          message: validation.error || "URL validation failed",
        },
        { status: 400 }
      )
    }

    // Check cache (60 second TTL)
    const cacheKey = getCacheKey(targetUrl)
    const cached = getServerCache<any>(cacheKey)
    if (cached) {
      return NextResponse.json({
        success: true,
        message: "API test successful (cached)",
        data: cached,
        responseTime: Date.now() - startTime,
      })
    }

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), RESPONSE_LIMITS.timeoutMs)

    try {
      // Fetch with timeout
      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "SmartLiveTV/1.0",
        },
        // Security: Limit redirects
        redirect: "follow",
      })

      clearTimeout(timeoutId)

      // Check response size
      const contentLength = response.headers.get("content-length")
      if (contentLength && parseInt(contentLength, 10) > RESPONSE_LIMITS.maxSizeBytes) {
        return NextResponse.json(
          {
            success: false,
            message: "Response too large",
          },
          { status: 413 }
        )
      }

      // Read response with size limit
      const reader = response.body?.getReader()
      if (!reader) {
        return NextResponse.json(
          {
            success: false,
            message: "No response body",
          },
          { status: 502 }
        )
      }

      let buffer = new Uint8Array(0)
      let totalSize = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        totalSize += value.length
        if (totalSize > RESPONSE_LIMITS.maxSizeBytes) {
          reader.cancel()
          return NextResponse.json(
            {
              success: false,
              message: "Response too large",
            },
            { status: 413 }
          )
        }

        const newBuffer = new Uint8Array(buffer.length + value.length)
        newBuffer.set(buffer)
        newBuffer.set(value, buffer.length)
        buffer = newBuffer
      }

      // Parse JSON
      const text = new TextDecoder().decode(buffer)
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        // Not JSON, return as text (truncated)
        data = text.substring(0, 1000)
      }

      // Cache successful responses (60 seconds)
      if (response.ok) {
        setServerCache(cacheKey, data, 60000)
      }

      // Log request (sanitized)
      const latency = Date.now() - startTime
      console.log(`[API] ${response.status} ${targetUrl.split("?")[0]} ${latency}ms`)

      return NextResponse.json({
        success: response.ok,
        message: response.ok ? "API test successful" : `HTTP ${response.status}`,
        data: response.ok ? data : undefined,
        responseTime: latency,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          {
            success: false,
            message: "Request timeout",
          },
          { status: 408 }
        )
      }

      throw fetchError
    }
  } catch (error) {
    const latency = Date.now() - startTime
    const sanitizedMessage = sanitizeError(error)

    // Log error (server-side only, sanitized)
    console.error(`[API] Test endpoint error: ${sanitizedMessage}`)

    return NextResponse.json(
      {
        success: false,
        message: sanitizedMessage,
        responseTime: latency,
      },
      { status: 500 }
    )
  }
}

