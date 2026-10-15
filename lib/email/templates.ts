// X-11 — Extracted from `app/api/orders/route.ts`, which used to
// inline five HTML email bodies totalling ~200 lines mid-route. That
// buried the actual order logic under styling and made every field
// change require editing a giant template literal in a route file.
//
// Also fixes a small email-client XSS: the route was interpolating
// user-supplied `name` / `message` / `whatsapp` directly into HTML
// with no escaping. Those values reach the owner's inbox — and while
// most modern mail clients sandbox HTML, some don't, and the sender
// could inject an `<img src=x onerror=...>` in the name field. Every
// renderer here now escapes user-supplied strings.

/**
 * Escape a value for inclusion in HTML text or attribute context.
 * Small — five substitutions cover the OWASP escaping table for HTML
 * body and quoted-attribute contexts. Numbers/undefined coerce to "".
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return ""
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// ─── Owner notification (new order/trial) ─────────────────────────

export interface OwnerNotificationInput {
  name: string
  email: string
  whatsapp?: string | null
  plan: string
  message?: string | null
  isTrial: boolean
}

export function renderOwnerNotification(i: OwnerNotificationInput): string {
  const kind = i.isTrial ? "Trial Request" : "Order"
  const name = escapeHtml(i.name)
  const email = escapeHtml(i.email)
  const whatsapp = escapeHtml(i.whatsapp || "Not provided")
  const plan = escapeHtml(i.plan)
  const message = escapeHtml(i.message || "None")
  const timeUtc = escapeHtml(new Date().toUTCString())

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #00e676;">New ${kind} Received</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>WhatsApp</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${whatsapp}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Plan</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${plan}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Message</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${message}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Time (UTC)</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${timeUtc}</td></tr>
      </table>
      <p style="margin-top: 16px; color: #666;">Reply to this email to reach the customer at ${email}</p>
    </div>
  `
}

// ─── Device-specific setup instructions ───────────────────────────

const SETUP_FIRESTICK = `
  <div style="background: #f0f9f4; border: 1px solid #d0e8da; border-radius: 8px; padding: 20px; margin: 16px 0;">
    <h4 style="margin: 0 0 12px; color: #166534;">📺 Setup Instructions for Firestick</h4>
    <p style="margin: 0 0 12px; font-weight: bold; color: #333;">Step 1 — Enable Sideloading</p>
    <p style="margin: 0 0 4px;">Go to <strong>Settings → My Fire TV → About</strong> → click your device name <strong>7 times</strong> quickly.</p>
    <p style="margin: 0 0 12px;">Then go back to <strong>My Fire TV → Developer Options → Install Unknown Apps</strong> → turn <strong>ON</strong> for Downloader.</p>
    <p style="margin: 0 0 12px; font-weight: bold; color: #333;">Step 2 — Install the Downloader App</p>
    <p style="margin: 0 0 12px;">Search for <strong>"Downloader"</strong> in the Amazon Appstore (orange icon) and install it — it's free.</p>
    <p style="margin: 0 0 12px; font-weight: bold; color: #333;">Step 3 — Install Your IPTV Player</p>
    <p style="margin: 0 0 4px;">Open Downloader and type one of these codes:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 8px 0 12px;">
      <tr style="background: #fff;"><td style="padding: 8px; border: 1px solid #d0e8da;"><strong>IPTV Smarters</strong> (easiest)</td><td style="padding: 8px; border: 1px solid #d0e8da; font-family: monospace; font-weight: bold; color: #166534;">250931</td></tr>
      <tr style="background: #f8fdf9;"><td style="padding: 8px; border: 1px solid #d0e8da;"><strong>TiviMate</strong> (best quality)</td><td style="padding: 8px; border: 1px solid #d0e8da; font-family: monospace; font-weight: bold; color: #166534;">278077</td></tr>
      <tr style="background: #fff;"><td style="padding: 8px; border: 1px solid #d0e8da;"><strong>XCIPTV</strong> (Netflix-style)</td><td style="padding: 8px; border: 1px solid #d0e8da; font-family: monospace; font-weight: bold; color: #166534;">548268</td></tr>
    </table>
    <p style="margin: 0 0 12px; font-weight: bold; color: #333;">Step 4 — Enter Your Credentials</p>
    <p style="margin: 0;">Open the app → select <strong>"Xtream Codes API"</strong> or <strong>"Login"</strong> → enter the Server URL, Username, and Password we send you on WhatsApp.</p>
  </div>`

const SETUP_SMART_TV = `
  <div style="background: #f0f9f4; border: 1px solid #d0e8da; border-radius: 8px; padding: 20px; margin: 16px 0;">
    <h4 style="margin: 0 0 12px; color: #166534;">📺 Setup Instructions for Smart TV (Samsung / LG)</h4>
    <p style="margin: 0 0 12px; font-weight: bold; color: #333;">Step 1 — Open Your TV's App Store</p>
    <p style="margin: 0 0 12px;">Press the <strong>Home</strong> button → go to <strong>Apps</strong> or <strong>Smart Hub</strong> (Samsung) or <strong>LG Content Store</strong> (LG).</p>
    <p style="margin: 0 0 12px; font-weight: bold; color: #333;">Step 2 — Install an IPTV Player</p>
    <p style="margin: 0 0 4px;">Search for one of these apps (all available in your TV's store):</p>
    <table style="width: 100%; border-collapse: collapse; margin: 8px 0 12px;">
      <tr style="background: #fff;"><td style="padding: 8px; border: 1px solid #d0e8da;"><strong>IBO Player</strong> ⭐ (recommended)</td><td style="padding: 8px; border: 1px solid #d0e8da; font-size: 12px;">Set up from your phone — no typing on remote!</td></tr>
      <tr style="background: #f8fdf9;"><td style="padding: 8px; border: 1px solid #d0e8da;"><strong>Smarters Player Lite</strong></td><td style="padding: 8px; border: 1px solid #d0e8da; font-size: 12px;">Free, easy, familiar</td></tr>
      <tr style="background: #fff;"><td style="padding: 8px; border: 1px solid #d0e8da;"><strong>Flix IPTV</strong></td><td style="padding: 8px; border: 1px solid #d0e8da; font-size: 12px;">Lightweight, great on older TVs</td></tr>
    </table>
    <p style="margin: 0 0 12px; font-weight: bold; color: #333;">Step 3 — Enter Your Credentials</p>
    <p style="margin: 0 0 4px;">Open the app → select <strong>"Xtream Codes"</strong> login → enter the Server URL, Username, and Password we send you.</p>
    <p style="margin: 8px 0 0; font-size: 13px; color: #555;"><strong>💡 IBO Player tip:</strong> Open <strong>iboplayer.com</strong> on your phone, enter the MAC address shown on your TV — you can set everything up from your phone without typing on the remote!</p>
  </div>`

const SETUP_ANDROID = `
  <div style="background: #f0f9f4; border: 1px solid #d0e8da; border-radius: 8px; padding: 20px; margin: 16px 0;">
    <h4 style="margin: 0 0 12px; color: #166534;">📱 Setup Instructions for Android</h4>
    <p style="margin: 0 0 12px; font-weight: bold; color: #333;">Step 1 — Download an IPTV Player</p>
    <p style="margin: 0 0 4px;">Go to the <strong>Google Play Store</strong> and search for one of these:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 8px 0 12px;">
      <tr style="background: #fff;"><td style="padding: 8px; border: 1px solid #d0e8da;"><strong>Televizo</strong> ⭐ (best for phones)</td><td style="padding: 8px; border: 1px solid #d0e8da; font-size: 12px;">Free, smooth touch controls</td></tr>
      <tr style="background: #f8fdf9;"><td style="padding: 8px; border: 1px solid #d0e8da;"><strong>IPTV Smarters Pro</strong></td><td style="padding: 8px; border: 1px solid #d0e8da; font-size: 12px;">Free, easy, everyone knows it</td></tr>
      <tr style="background: #fff;"><td style="padding: 8px; border: 1px solid #d0e8da;"><strong>XCIPTV</strong></td><td style="padding: 8px; border: 1px solid #d0e8da; font-size: 12px;">Free, Netflix-style for movies</td></tr>
    </table>
    <p style="margin: 0 0 12px; font-weight: bold; color: #333;">Step 2 — Enter Your Credentials</p>
    <p style="margin: 0;">Open the app → select <strong>"Xtream Codes API"</strong> or <strong>"Add User"</strong> → enter the Server URL, Username, and Password we send you on WhatsApp.</p>
  </div>`

const SETUP_IPHONE = `
  <div style="background: #f0f9f4; border: 1px solid #d0e8da; border-radius: 8px; padding: 20px; margin: 16px 0;">
    <h4 style="margin: 0 0 12px; color: #166534;">📱 Setup Instructions for iPhone / iPad</h4>
    <p style="margin: 0 0 12px; font-weight: bold; color: #333;">Step 1 — Download an IPTV Player</p>
    <p style="margin: 0 0 4px;">Go to the <strong>App Store</strong> and search for one of these:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 8px 0 12px;">
      <tr style="background: #fff;"><td style="padding: 8px; border: 1px solid #d0e8da;"><strong>UHF</strong> ⭐ (best for iPhone)</td><td style="padding: 8px; border: 1px solid #d0e8da; font-size: 12px;">iCloud sync, Picture-in-Picture</td></tr>
      <tr style="background: #f8fdf9;"><td style="padding: 8px; border: 1px solid #d0e8da;"><strong>Smarters Player Lite</strong></td><td style="padding: 8px; border: 1px solid #d0e8da; font-size: 12px;">Free, easy, universal</td></tr>
      <tr style="background: #fff;"><td style="padding: 8px; border: 1px solid #d0e8da;"><strong>IPTVX</strong></td><td style="padding: 8px; border: 1px solid #d0e8da; font-size: 12px;">Netflix-style layout for movies</td></tr>
    </table>
    <p style="margin: 0 0 12px; font-weight: bold; color: #333;">Step 2 — Enter Your Credentials</p>
    <p style="margin: 0;">Open the app → select <strong>"Xtream Codes"</strong> login → enter the Server URL, Username, and Password we send you on WhatsApp.</p>
  </div>`

const SETUP_DEFAULT = `
  <div style="background: #f0f9f4; border: 1px solid #d0e8da; border-radius: 8px; padding: 20px; margin: 16px 0;">
    <h4 style="margin: 0 0 12px; color: #166534;">📺 Quick Setup</h4>
    <p style="margin: 0 0 8px;"><strong>1.</strong> Download any IPTV player app (e.g. <strong>IPTV Smarters Pro</strong>) from your device's app store.</p>
    <p style="margin: 0 0 8px;"><strong>2.</strong> Open the app → select <strong>"Xtream Codes API"</strong> or <strong>"Login"</strong>.</p>
    <p style="margin: 0;"><strong>3.</strong> Enter the Server URL, Username, and Password we send you on WhatsApp. That's it!</p>
  </div>`

/**
 * Pick the right setup-instruction HTML block from a free-text
 * device description (as the customer typed it into the form).
 * Matcher rules preserved verbatim from the previous inline version
 * so per-device selection does not shift.
 */
export function renderSetupInstructions(deviceText: string): string {
  const device = (deviceText || "").toLowerCase()
  if (device.includes("firestick") || device.includes("fire tv") || device.includes("fire stick")) {
    return SETUP_FIRESTICK
  }
  if (
    device.includes("smart tv") ||
    device.includes("samsung") ||
    device.includes("lg") ||
    device.includes("sony") ||
    device.includes("tv box") ||
    device.includes("android tv box")
  ) {
    return SETUP_SMART_TV
  }
  if (device.includes("android")) return SETUP_ANDROID
  if (
    device.includes("iphone") ||
    device.includes("ipad") ||
    device.includes("ios") ||
    device.includes("apple")
  ) {
    return SETUP_IPHONE
  }
  return SETUP_DEFAULT
}

// ─── Customer confirmation email (before credentials are ready) ──

export interface CustomerConfirmationInput {
  name: string
  whatsapp?: string | null
  plan: string
  isTrial: boolean
  /** HTML block from `renderSetupInstructions(...)`. Trusted, not escaped again. */
  deviceInstructionsHtml: string
}

export function renderCustomerConfirmation(i: CustomerConfirmationInput): string {
  const name = escapeHtml(i.name)
  const whatsapp = escapeHtml(i.whatsapp || "")
  const plan = escapeHtml(i.plan)
  const whatsappSuffix = whatsapp ? ` (<strong>${whatsapp}</strong>)` : ""
  const heading = i.isTrial ? "🎉 Your Free Trial is Being Activated!" : "✅ Order Received!"
  const introBlock = i.isTrial
    ? `<p>We're setting up your <strong>24-hour free trial</strong> right now. Your login credentials will be sent to your WhatsApp${whatsappSuffix} within <strong>5 minutes</strong>.</p>
       <p>While you wait, <strong>get your device ready</strong> — follow the steps below so you can start watching instantly when your credentials arrive.</p>`
    : `<p>Thank you for your <strong>${plan}</strong> order! We're setting up your account and will send your credentials to your WhatsApp${whatsappSuffix} within <strong>5 minutes</strong>.</p>
       <p>Your purchase is protected by our <strong>7-day money-back guarantee</strong>.</p>`

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
      <div style="background: linear-gradient(135deg, #0a0a0f, #1a1a2e); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #00e676; margin: 0; font-size: 22px;">${heading}</h1>
      </div>

      <div style="background: #fff; padding: 24px; border: 1px solid #eee; border-top: none;">
        <p>Hi ${name},</p>
        ${introBlock}
        ${i.deviceInstructionsHtml}
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px; color: #92400e;">📋 What You'll Receive on WhatsApp</h4>
          <p style="margin: 0 0 4px;">We'll send you 3 things:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
            <tr><td style="padding: 4px 8px;">🔗</td><td style="padding: 4px 0;"><strong>Server URL</strong> — the server address</td></tr>
            <tr><td style="padding: 4px 8px;">👤</td><td style="padding: 4px 0;"><strong>Username</strong> — your unique login</td></tr>
            <tr><td style="padding: 4px 8px;">🔑</td><td style="padding: 4px 0;"><strong>Password</strong> — your secure password</td></tr>
          </table>
          <p style="margin: 8px 0 0; font-size: 13px; color: #92400e;">Just enter these 3 things into your IPTV app and you're in!</p>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-weight: bold; color: #333;">Need help? We're here for you:</p>
          <a href="https://wa.me/447429313810" style="display: inline-block; background: #25D366; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">💬 Message us on WhatsApp</a>
        </div>
      </div>

      <div style="background: #f8f9fa; padding: 16px 24px; border-radius: 0 0 12px 12px; border: 1px solid #eee; border-top: none; text-align: center;">
        <p style="margin: 0; color: #666; font-size: 13px;">Smart Live TV · <a href="https://smartlivetv.co.uk" style="color: #00a652; text-decoration: none;">smartlivetv.co.uk</a></p>
      </div>
    </div>
  `
}

// ─── Auto-provision failure (owner) ───────────────────────────────

export interface ProvisionFailureInput {
  name: string
  email: string
  whatsapp: string
  error: string
}

export function renderProvisionFailure(i: ProvisionFailureInput): string {
  const name = escapeHtml(i.name)
  const email = escapeHtml(i.email)
  const whatsapp = escapeHtml(i.whatsapp)
  const error = escapeHtml(i.error)
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px;">
        <h3 style="color: #991b1b; margin: 0 0 12px;">Auto-provisioning failed</h3>
        <p><strong>Customer:</strong> ${name} (${email})</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Error:</strong> ${error}</p>
        <p>Please create their trial manually on the panel and send credentials via WhatsApp.</p>
      </div>
    </div>
  `
}

// ─── Credentials delivery (customer) ──────────────────────────────

export interface CredentialsEmailInput {
  name: string
  credentials: {
    server: string
    username: string
    password: string
  }
}

// ─── Owner notification: trial auto-provisioned ───────────────────

export interface AutoProvisionSuccessInput {
  name: string
  email: string
  whatsapp?: string | null
  credentials: {
    username: string
    password: string
    expiresAt: string
  }
}

export function renderAutoProvisionSuccess(i: AutoProvisionSuccessInput): string {
  const name = escapeHtml(i.name)
  const email = escapeHtml(i.email)
  const whatsapp = escapeHtml(i.whatsapp || "Not provided")
  const username = escapeHtml(i.credentials.username)
  const password = escapeHtml(i.credentials.password)
  const expiresAt = escapeHtml(i.credentials.expiresAt)
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px;">
        <h3 style="color: #166534; margin: 0 0 12px;">Trial auto-created ✅</h3>
        <p><strong>Customer:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Panel username:</strong> <code>${username}</code></p>
        <p><strong>Panel password:</strong> <code>${password}</code></p>
        <p><strong>Expires:</strong> ${expiresAt}</p>
        <p style="margin: 0; color: #166534; font-size: 13px;">Credentials email already sent to customer automatically.</p>
      </div>
    </div>
  `
}

export function renderCredentialsEmail(i: CredentialsEmailInput): string {
  const name = escapeHtml(i.name)
  const server = escapeHtml(i.credentials.server)
  const username = escapeHtml(i.credentials.username)
  const password = escapeHtml(i.credentials.password)
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
      <div style="background: linear-gradient(135deg, #0a0a0f, #1a1a2e); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #00e676; margin: 0; font-size: 22px;">🎉 You're All Set, ${name}!</h1>
        <p style="color: #aaa; margin: 8px 0 0; font-size: 14px;">Your 24-hour free trial is live</p>
      </div>

      <div style="background: #fff; padding: 24px; border: 1px solid #eee; border-top: none;">
        <p>Your Smart Live TV trial account is ready. Here are your login details:</p>

        <div style="background: #0a0a0f; border-radius: 10px; padding: 20px; margin: 20px 0; border: 2px solid #00e676;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px; width: 100px;">🔗 Server</td>
              <td style="padding: 10px 0; color: #00e676; font-family: monospace; font-size: 14px; word-break: break-all;">${server}</td>
            </tr>
            <tr style="border-top: 1px solid #1a1a2e;">
              <td style="padding: 10px 0; color: #888; font-size: 13px;">👤 Username</td>
              <td style="padding: 10px 0; color: #fff; font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px;">${username}</td>
            </tr>
            <tr style="border-top: 1px solid #1a1a2e;">
              <td style="padding: 10px 0; color: #888; font-size: 13px;">🔑 Password</td>
              <td style="padding: 10px 0; color: #fff; font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px;">${password}</td>
            </tr>
          </table>
        </div>

        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin: 16px 0;">
          <p style="margin: 0; color: #92400e; font-size: 13px;">⏰ <strong>Your trial expires in 24 hours.</strong> If you'd like to continue watching, reply to this email or message us on WhatsApp.</p>
        </div>

        <h3 style="color: #111; margin: 24px 0 12px;">📲 How to Enter These in Your App</h3>
        <ol style="padding-left: 20px; margin: 0 0 20px; color: #444;">
          <li style="margin-bottom: 8px;">Open your IPTV app (IPTV Smarters, TiviMate, etc.)</li>
          <li style="margin-bottom: 8px;">Select <strong>"Xtream Codes API"</strong> or <strong>"Add Playlist"</strong></li>
          <li style="margin-bottom: 8px;">Enter the <strong>Server URL</strong>, <strong>Username</strong>, and <strong>Password</strong> from above</li>
          <li style="margin-bottom: 8px;">Hit <strong>Connect</strong> — you'll see 230,000+ channels load!</li>
        </ol>

        <div style="text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 10px; color: #555;">Having trouble setting up? We'll help you in minutes:</p>
          <a href="https://wa.me/447429313810" style="display: inline-block; background: #25D366; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">💬 Message us on WhatsApp</a>
        </div>
      </div>

      <div style="background: #f8f9fa; padding: 16px 24px; border-radius: 0 0 12px 12px; border: 1px solid #eee; border-top: none; text-align: center;">
        <p style="margin: 0; color: #666; font-size: 13px;">Smart Live TV · <a href="https://smartlivetv.co.uk" style="color: #00a652; text-decoration: none;">smartlivetv.co.uk</a></p>
      </div>
    </div>
  `
}
