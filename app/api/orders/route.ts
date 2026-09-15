import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createCustomer, getCustomerByEmail, updateCustomer } from '@/lib/db/customers'
import { createTrialAccount } from '@/lib/panel/cms8k'
import { checkFraud, recordFraudFingerprints, logBlockedRequest, canonicalEmail, isFraudInfraReady } from '@/lib/fraud/detect'
import { verifyCaptcha } from '@/lib/security/captcha'
import { getClientIp } from '@/lib/security/client-ip'

const orderSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(200).toLowerCase().trim(),
  whatsapp: z.string().max(20).optional(),
  plan: z.enum([
    // Duration-based plan names
    '1 Month', '3 Months', '6 Months', '12 Months',
    // Marketing plan names (from BuyForm)
    'Starter', 'Popular', 'Standard', 'Ultimate',
    'Basic', 'Premium',
    // Trial
    'Free Trial Request',
  ]),
  message: z.string().max(500).optional(),
  device: z.string().max(100).optional(),
  hp_website: z.string().max(100).optional(),
  form_loaded_at: z.number().optional(),
  // A-04: retained so Zod does not strip it before verifyCaptcha() sees it.
  captchaToken: z.string().max(4096).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = orderSchema.safeParse(body)
    if (!parsed.success) {
      console.error('[ORDER] Validation failed:', parsed.error.flatten())
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { name, email, whatsapp, plan, message, device, hp_website, form_loaded_at, captchaToken } = parsed.data
    const isTrial = plan === 'Free Trial Request'

    // A-04: hCaptcha server-side verification for trials. When
    // HCAPTCHA_SECRET is unset (dev/CI) verifyCaptcha returns ok:true.
    if (isTrial) {
      const captcha = await verifyCaptcha(captchaToken)
      if (!captcha.ok) {
        return NextResponse.json(
          { success: false, error: `Captcha ${captcha.reason}` },
          { status: 403 },
        )
      }
    }

    // A-06: fail-loud when fraud dedup infra is unreachable. Previously
    // trial provisioning proceeded with all dedup gates silently no-op'd
    // if Upstash env was unset. Rejecting with 503 is honest and lets
    // the client retry; leaving it silent lets duplicates through.
    if (isTrial && !isFraudInfraReady()) {
      console.warn('[ORDER] Trial rejected: fraud infrastructure (Upstash) is not configured')
      return NextResponse.json(
        { success: false, error: 'Fraud service unavailable. Please try again in a few minutes.' },
        { status: 503 },
      )
    }

    // ─── FRAUD & ANTI-SPAM DETECTION (trials only) ───────────────────────────
    if (isTrial) {
      // A-05: prefer x-real-ip (Vercel-set, cannot be spoofed by client) over
      // raw x-forwarded-for. `getClientIp` skips loopback entries in XFF so a
      // caller cannot disable IP fraud checks by sending X-Forwarded-For: 0.0.0.0.
      const ip = getClientIp(req.headers) ?? '0.0.0.0'

      const fraudResult = await checkFraud({
        email,
        name,
        whatsapp: whatsapp || '',
        device: device || '',
        country: '',
        ip,
        honeypot: hp_website,
        formLoadedAt: form_loaded_at,
      })

      if (!fraudResult.allowed) {
        // Log for your review — includes all their details
        await logBlockedRequest(
          {
            email,
            name,
            whatsapp: whatsapp || '',
            device: device || '',
            country: '',
            ip,
            honeypot: hp_website,
            formLoadedAt: form_loaded_at,
          },
          fraudResult
        )

        console.warn(`[FRAUD] Blocked trial for ${email} — ${fraudResult.flagType}: ${fraudResult.reason}`)

        return NextResponse.json({
          success: false,
          error: fraudResult.reason,
        }, { status: 429 })
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const deviceMatch = message?.match(/Device:\s*([^|]+)/i)
    const extractedDevice = (device || (deviceMatch ? deviceMatch[1].trim() : '')).toLowerCase()
    const displayDevice = extractedDevice ? extractedDevice.charAt(0).toUpperCase() + extractedDevice.slice(1) : ''

    let setupUrl = 'https://smartlivetv.co.uk/setup/firestick'
    let apps = ['TiviMate', 'IPTV Smarters Pro', 'XCIPTV']

    if (extractedDevice.includes('smart tv') || extractedDevice.includes('samsung') || extractedDevice.includes('lg') || extractedDevice.includes('sony') || extractedDevice.includes('tv box') || extractedDevice.includes('android tv box')) {
      setupUrl = 'https://smartlivetv.co.uk/setup/smart-tv'
      apps = ['IBO Player', 'Smarters Player Lite', 'Flix IPTV']
    } else if (extractedDevice.includes('android')) {
      setupUrl = 'https://smartlivetv.co.uk/setup/android'
      apps = ['Televizo', 'IPTV Smarters Pro', 'XCIPTV']
    } else if (extractedDevice.includes('iphone') || extractedDevice.includes('ipad') || extractedDevice.includes('ios') || extractedDevice.includes('apple')) {
      setupUrl = 'https://smartlivetv.co.uk/setup/iphone'
      apps = ['UHF', 'Smarters Player Lite', 'IPTVX']
    } else if (extractedDevice.includes('pc') || extractedDevice.includes('mac')) {
      setupUrl = 'https://smartlivetv.co.uk/setup/firestick'
      apps = ['TiviMate', 'IPTV Smarters Pro', 'XCIPTV']
    }


    const resendKey = process.env.RESEND_API_KEY
    // Primary: support@smartlivetv.co.uk forwards to formyownwork@gmail.com
    const notifyEmail = process.env.ORDER_NOTIFY_EMAIL || 'support@smartlivetv.co.uk'

    if (resendKey) {
      try {
        // Notify owner
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Smart Live TV <noreply@smartlivetv.co.uk>',
            to: [notifyEmail],
            subject: `New ${plan === 'Free Trial Request' ? 'Trial Request' : 'Order'}: ${plan} — ${name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color: #00e676;">New ${plan === 'Free Trial Request' ? 'Trial Request' : 'Order'} Received</h2>
                <table style="border-collapse: collapse; width: 100%;">
                  <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>WhatsApp</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${whatsapp || 'Not provided'}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Plan</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${plan}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Message</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${message || 'None'}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Time (UTC)</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${new Date().toUTCString()}</td></tr>
                </table>
                <p style="margin-top: 16px; color: #666;">Reply to this email to reach the customer at ${email}</p>
              </div>
            `,
            reply_to: email,
          }),
        })

        // Build device-specific inline setup instructions
        const setupInstructions: Record<string, string> = {
          firestick: `
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
            </div>`,
          'smart-tv': `
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
            </div>`,
          android: `
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
            </div>`,
          iphone: `
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
            </div>`,
          default: `
            <div style="background: #f0f9f4; border: 1px solid #d0e8da; border-radius: 8px; padding: 20px; margin: 16px 0;">
              <h4 style="margin: 0 0 12px; color: #166534;">📺 Quick Setup</h4>
              <p style="margin: 0 0 8px;"><strong>1.</strong> Download any IPTV player app (e.g. <strong>IPTV Smarters Pro</strong>) from your device's app store.</p>
              <p style="margin: 0 0 8px;"><strong>2.</strong> Open the app → select <strong>"Xtream Codes API"</strong> or <strong>"Login"</strong>.</p>
              <p style="margin: 0;"><strong>3.</strong> Enter the Server URL, Username, and Password we send you on WhatsApp. That's it!</p>
            </div>`,
        }

        // Match device to the right instructions
        let deviceInstructions = setupInstructions.default
        if (extractedDevice.includes('firestick') || extractedDevice.includes('fire tv') || extractedDevice.includes('fire stick')) {
          deviceInstructions = setupInstructions.firestick
        } else if (extractedDevice.includes('smart tv') || extractedDevice.includes('samsung') || extractedDevice.includes('lg') || extractedDevice.includes('sony') || extractedDevice.includes('tv box') || extractedDevice.includes('android tv box')) {
          deviceInstructions = setupInstructions['smart-tv']
        } else if (extractedDevice.includes('android')) {
          deviceInstructions = setupInstructions.android
        } else if (extractedDevice.includes('iphone') || extractedDevice.includes('ipad') || extractedDevice.includes('ios') || extractedDevice.includes('apple')) {
          deviceInstructions = setupInstructions.iphone
        }

        // Confirm to customer — FULLY SELF-CONTAINED email
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Smart Live TV <noreply@smartlivetv.co.uk>',
            to: [email],
            subject: isTrial
              ? `Your Free Trial is Being Activated — Here's How to Set Up 📺`
              : `Your Smart Live TV Order — Here's Everything You Need 📺`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
                <div style="background: linear-gradient(135deg, #0a0a0f, #1a1a2e); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: #00e676; margin: 0; font-size: 22px;">${isTrial ? '🎉 Your Free Trial is Being Activated!' : '✅ Order Received!'}</h1>
                </div>
                
                <div style="background: #fff; padding: 24px; border: 1px solid #eee; border-top: none;">
                  <p>Hi ${name},</p>
                  
                  ${isTrial 
                    ? `<p>We're setting up your <strong>24-hour free trial</strong> right now. Your login credentials will be sent to your WhatsApp${whatsapp ? ` (<strong>${whatsapp}</strong>)` : ''} within <strong>5 minutes</strong>.</p>
                       <p>While you wait, <strong>get your device ready</strong> — follow the steps below so you can start watching instantly when your credentials arrive.</p>`
                    : `<p>Thank you for your <strong>${plan}</strong> order! We're setting up your account and will send your credentials to your WhatsApp${whatsapp ? ` (<strong>${whatsapp}</strong>)` : ''} within <strong>5 minutes</strong>.</p>
                       <p>Your purchase is protected by our <strong>7-day money-back guarantee</strong>.</p>`
                  }

                  ${deviceInstructions}

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
            `,
          }),
        })
      } catch (emailErr) {
        // Log but don't fail the order
        console.error('[ORDER] Email send failed:', emailErr)
      }
    } else {
      console.warn('[ORDER] RESEND_API_KEY not set — email not sent. Order details:', { name, email, plan })
    }

    // Save customer to database for tracking and follow-ups
    let savedCustomerId: string | null = null
    try {
      const existingCustomer = await getCustomerByEmail(email)
      if (!existingCustomer) {
        const newCustomer = await createCustomer({
          name,
          email,
          whatsapp: whatsapp || '',
          device: device || extractedDevice || '',
          country: '',
          connectionType: '',
          internetSpeed: '',
          plan: isTrial ? undefined : plan,
          source: isTrial ? 'trial_form' : 'buy_form',
        })
        savedCustomerId = newCustomer.id
        console.log(`[ORDER] Customer record created for ${email} (id: ${newCustomer.id})`)
      } else {
        savedCustomerId = existingCustomer.id
        console.log(`[ORDER] Customer ${email} already exists`)
      }
    } catch (dbErr) {
      console.error('[ORDER] Failed to save customer:', dbErr)
    }

    // AUTO-PROVISION TRIAL — if panel is configured, create the account automatically
    const isPanelConfigured = !!(
      process.env.CMS8K_API_KEY ||
      (process.env.CMS8K_USERNAME && process.env.CMS8K_PASSWORD)
    )
    const isTrialPlan = plan === 'Free Trial Request'

    console.log(`[ORDER] Processing order for ${email}. isTrial: ${isTrialPlan}, isPanelConfigured: ${isPanelConfigured}`)

    // A-07: record fraud fingerprints BEFORE the outbound provisioning
    // starts. Previously this fired only on provision success, so a fraud
    // lock expiring mid-provision (extended to 300s in detect.ts) could
    // let a duplicate request through before the fingerprint was written.
    // Now the fingerprint is committed as soon as we decide to serve this
    // customer, so dedup remains sound even under lock expiry.
    if (isTrialPlan && savedCustomerId) {
      try {
        await recordFraudFingerprints({
          customerId: savedCustomerId,
          email,
          name,
          whatsapp: whatsapp || '',
          device: device || extractedDevice || '',
        })
      } catch (fpErr) {
        console.error('[ORDER] Failed to record fraud fingerprint before provisioning:', fpErr)
      }
    }

    if (isTrialPlan && isPanelConfigured && resendKey) {
      try {
        console.log(`[ORDER] Starting automated trial provisioning for ${email}...`)
        await provisionTrialAndNotify({
          customerId: savedCustomerId,
          name,
          email,
          whatsapp: whatsapp || '',
          resendKey,
        })
        console.log(`[ORDER] Automated trial provisioning completed for ${email}`)
      } catch (err) {
        console.error('[ORDER] Background provisioning failed:', err)
      }
    } else if (isTrialPlan && !isPanelConfigured) {
      console.warn('[ORDER] Trial requested but CMS8K panel is not configured! Check CMS8K_API_KEY or CMS8K_USERNAME in Vercel environment variables.')
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[ORDER ERROR]', err)
    return NextResponse.json(
      { success: false, error: 'Order processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Background: create trial on panel, then email credentials to customer.
 * Runs after the 200 response is already sent, so the customer isn't waiting.
 */
async function provisionTrialAndNotify({
  customerId,
  name,
  email,
  whatsapp,
  resendKey,
}: {
  customerId: string | null
  name: string
  email: string
  whatsapp: string
  resendKey: string
}) {
  console.log(`[PROVISION] Starting trial for ${email}`)

  const result = await createTrialAccount(name, `Trial for ${name} <${email}>`)

  if (!result.success) {
    console.error(`[PROVISION] Failed for ${email}:`, result.error)
    // Notify owner to do it manually
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Smart Live TV <noreply@smartlivetv.co.uk>',
        to: [process.env.ORDER_NOTIFY_EMAIL || 'support@smartlivetv.co.uk'],
        subject: `⚠️ AUTO-PROVISION FAILED — Manual action needed for ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px;">
              <h3 style="color: #991b1b; margin: 0 0 12px;">Auto-provisioning failed</h3>
              <p><strong>Customer:</strong> ${name} (${email})</p>
              <p><strong>WhatsApp:</strong> ${whatsapp}</p>
              <p><strong>Error:</strong> ${result.error}</p>
              <p>Please create their trial manually on the panel and send credentials via WhatsApp.</p>
            </div>
          </div>
        `,
      }),
    })
    return
  }

  const { credentials } = result
  console.log(`[PROVISION] Trial created for ${email} — username: ${credentials.username}`)

  // Update customer record with credentials and trial status
  if (customerId) {
    try {
      await updateCustomer(customerId, {
        trialStatus: 'active',
        trialStartedAt: new Date().toISOString(),
        trialExpiresAt: credentials.expiresAt,
        trialCredentials: {
          server: credentials.server,
          username: credentials.username,
          password: credentials.password,
        },
      })
    } catch (dbErr) {
      console.error('[PROVISION] Failed to update customer record:', dbErr)
    }
    // A-07: recordFraudFingerprints used to fire here (post-success). Moved
    // upstream to the caller so dedup fingerprints exist BEFORE the panel
    // call starts. See orders/route.ts around the "record fraud fingerprints
    // BEFORE the outbound provisioning" comment.
  }

  // Send credentials email — the customer gets EVERYTHING they need
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Smart Live TV <noreply@smartlivetv.co.uk>',
      to: [email],
      subject: `🔑 Your Smart Live TV Credentials — You're Ready to Watch!`,
      html: `
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
                  <td style="padding: 10px 0; color: #00e676; font-family: monospace; font-size: 14px; word-break: break-all;">${credentials.server}</td>
                </tr>
                <tr style="border-top: 1px solid #1a1a2e;">
                  <td style="padding: 10px 0; color: #888; font-size: 13px;">👤 Username</td>
                  <td style="padding: 10px 0; color: #fff; font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px;">${credentials.username}</td>
                </tr>
                <tr style="border-top: 1px solid #1a1a2e;">
                  <td style="padding: 10px 0; color: #888; font-size: 13px;">🔑 Password</td>
                  <td style="padding: 10px 0; color: #fff; font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px;">${credentials.password}</td>
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
      `,
    }),
  })

  // Also notify yourself so you know a trial was auto-provisioned
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Smart Live TV <noreply@smartlivetv.co.uk>',
      to: [process.env.ORDER_NOTIFY_EMAIL || 'support@smartlivetv.co.uk'],
      subject: `✅ Auto-provisioned trial: ${name} (${credentials.username})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px;">
            <h3 style="color: #166534; margin: 0 0 12px;">Trial auto-created ✅</h3>
            <p><strong>Customer:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>WhatsApp:</strong> ${whatsapp || 'Not provided'}</p>
            <p><strong>Panel username:</strong> <code>${credentials.username}</code></p>
            <p><strong>Panel password:</strong> <code>${credentials.password}</code></p>
            <p><strong>Expires:</strong> ${credentials.expiresAt}</p>
            <p style="margin: 0; color: #166534; font-size: 13px;">Credentials email already sent to customer automatically.</p>
          </div>
        </div>
      `,
    }),
  })

  console.log(`[PROVISION] Credentials emailed to ${email} successfully`)
}
