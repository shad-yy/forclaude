import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createCustomer, getCustomerByEmail, updateCustomer } from '@/lib/db/customers'
import { createTrialAccount } from '@/lib/panel/cms8k'
import { checkFraud, recordFraudFingerprints, logBlockedRequest, canonicalEmail, isFraudInfraReady } from '@/lib/fraud/detect'
import { verifyCaptcha } from '@/lib/security/captcha'
import { getClientIp } from '@/lib/security/client-ip'
// X-11: five HTML email bodies used to live inline in this file
// (~200 lines of styling buried in the middle of order logic).
// Moved to lib/email/templates.ts, which also HTML-escapes
// user-supplied fields (name / message / whatsapp / error / creds)
// to close a small email-client XSS surface.
import {
  renderOwnerNotification,
  renderCustomerConfirmation,
  renderProvisionFailure,
  renderCredentialsEmail,
  renderSetupInstructions,
  renderAutoProvisionSuccess,
} from '@/lib/email/templates'

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
            html: renderOwnerNotification({ name, email, whatsapp, plan, message, isTrial }),
            reply_to: email,
          }),
        })

        // Confirm to customer — FULLY SELF-CONTAINED email
        const deviceInstructions = renderSetupInstructions(extractedDevice)
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
            html: renderCustomerConfirmation({
              name,
              whatsapp,
              plan,
              isTrial,
              deviceInstructionsHtml: deviceInstructions,
            }),
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
        html: renderProvisionFailure({ name, email, whatsapp, error: result.error ?? '' }),
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
      html: renderCredentialsEmail({ name, credentials }),
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
      html: renderAutoProvisionSuccess({ name, email, whatsapp, credentials }),
    }),
  })

  console.log(`[PROVISION] Credentials emailed to ${email} successfully`)
}
