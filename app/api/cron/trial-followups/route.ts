import { NextResponse } from 'next/server'
import { listTrialsExpiringSoon, listActiveTrials, markEmailSent, getCustomer } from '@/lib/db/customers'

/**
 * Cron Job: Trial Follow-ups
 * 
 * Runs every 15 minutes via Vercel Cron.
 * Checks for trials that need follow-up emails:
 * 
 * 1. Check-in (2 hours after trial start) - "How's it going?"
 * 2. Trial ending (2 hours before expiry) - "Ready to continue? Here's your checkout link"
 * 3. Trial expired (2 hours after expiry) - "Your trial ended. Still want access?"
 * 
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey || resendKey === 'your-resend-key') {
    return NextResponse.json({ error: 'Resend not configured' }, { status: 503 })
  }

  const results = {
    checkins: 0,
    trialEnding: 0,
    trialExpired: 0,
    errors: 0,
  }

  try {
    // 1. Check-in emails (2 hours after trial start)
    const activeTrials = await listActiveTrials()
    const now = Date.now()
    
    for (const customer of activeTrials) {
      try {
        if (!customer.trialStartedAt) continue
        
        const trialStart = new Date(customer.trialStartedAt).getTime()
        const hoursSinceStart = (now - trialStart) / (1000 * 60 * 60)
        
        // Send check-in at ~2 hours if not already sent
        if (hoursSinceStart >= 2 && hoursSinceStart < 4 && !customer.emailsSent.includes('checkin_2h')) {
          await sendEmail(resendKey, customer.email, customer.name, 'checkin')
          await markEmailSent(customer.id, 'checkin_2h')
          results.checkins++
        }
      } catch {
        results.errors++
      }
    }

    // 2. Trial ending soon (within 120 minutes)
    const expiringSoon = await listTrialsExpiringSoon(120)
    
    for (const customer of expiringSoon) {
      try {
        if (!customer.emailsSent.includes('trial_ending')) {
          await sendEmail(resendKey, customer.email, customer.name, 'ending')
          await markEmailSent(customer.id, 'trial_ending')
          results.trialEnding++
        }
      } catch {
        results.errors++
      }
    }

    // 3. Trial expired (check active trials that are past expiry)
    for (const customer of activeTrials) {
      try {
        if (!customer.trialExpiresAt) continue
        
        const expiryTime = new Date(customer.trialExpiresAt).getTime()
        const hoursPastExpiry = (now - expiryTime) / (1000 * 60 * 60)
        
        // Send expired email 2 hours after expiry, if not already sent
        if (hoursPastExpiry >= 2 && hoursPastExpiry < 6 && !customer.emailsSent.includes('trial_expired')) {
          await sendEmail(resendKey, customer.email, customer.name, 'expired')
          await markEmailSent(customer.id, 'trial_expired')
          results.trialExpired++
        }
      } catch {
        results.errors++
      }
    }
  } catch (err) {
    console.error('[CRON] Trial follow-ups error:', err)
    return NextResponse.json({ error: 'Cron job failed', results }, { status: 500 })
  }

  console.log('[CRON] Trial follow-ups complete:', results)
  return NextResponse.json({ success: true, results })
}

async function sendEmail(resendKey: string, email: string, name: string, type: 'checkin' | 'ending' | 'expired') {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartlivetv.co.uk'
  const whatsappUrl = 'https://wa.me/447429313810'

  const templates = {
    checkin: {
      subject: `How\'s it going, ${name}? 📺`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
          <h2 style="color: #00e676;">How's Your Trial Going? 📺</h2>
          <p>Hi ${name},</p>
          <p>Just checking in — have you had a chance to set up your IPTV app and explore the channels?</p>
          <p><strong>Quick reminders:</strong></p>
          <ul>
            <li>Your trial is active for <strong>24 hours</strong></li>
            <li>Check out the <strong>Sports</strong> section for live matches</li>
            <li>The <strong>Movies</strong> section has thousands of on-demand titles</li>
          </ul>
          <p>If you're having any issues with setup or streaming, don't hesitate to reach out:</p>
          <p><a href="${whatsappUrl}" style="display: inline-block; background: #25D366; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Message us on WhatsApp</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #666; font-size: 13px;">Smart Live TV · <a href="${baseUrl}" style="color: #00e676;">smartlivetv.co.uk</a></p>
        </div>
      `,
    },
    ending: {
      subject: `Your trial ends in 2 hours — ready to continue? ⏰`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
          <h2 style="color: #ff9800;">Your Trial Ends in 2 Hours ⏰</h2>
          <p>Hi ${name},</p>
          <p>Your Smart Live TV trial is ending soon. If you've enjoyed the service, you can keep access by choosing a plan:</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr><td style="padding: 4px 0;"><strong>1 Month</strong></td><td style="text-align: right;"><strong>£12</strong></td></tr>
              <tr><td style="padding: 4px 0;"><strong>3 Months</strong> <span style="color: #00a652; font-size: 12px;">★ Best Value</span></td><td style="text-align: right;"><strong>£24</strong> (£8/mo)</td></tr>
              <tr><td style="padding: 4px 0;"><strong>6 Months</strong></td><td style="text-align: right;"><strong>£36</strong> (£6/mo)</td></tr>
              <tr><td style="padding: 4px 0;"><strong>12 Months</strong></td><td style="text-align: right;"><strong>£54</strong> (£4.50/mo)</td></tr>
            </table>
          </div>
          <p style="text-align: center;">
            <a href="${baseUrl}/buy" style="display: inline-block; background: #00e676; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Continue Watching →</a>
          </p>
          <p style="text-align: center; font-size: 13px; color: #666;">All plans include 7-day money-back guarantee</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #666; font-size: 13px;">Smart Live TV · <a href="${baseUrl}" style="color: #00e676;">smartlivetv.co.uk</a></p>
        </div>
      `,
    },
    expired: {
      subject: `Your Smart Live TV trial has ended`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
          <h2 style="color: #333;">Your Trial Has Ended</h2>
          <p>Hi ${name},</p>
          <p>Your free trial of Smart Live TV has come to an end. We hope you enjoyed the experience!</p>
          <p>If you'd like to continue watching, plans start from just <strong>£12/month</strong> with a 7-day money-back guarantee.</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="${baseUrl}/buy" style="display: inline-block; background: #00e676; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Get Full Access →</a>
          </p>
          <p>Have questions? <a href="${whatsappUrl}" style="color: #25D366; font-weight: bold;">Message us on WhatsApp</a> — we're happy to help.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #666; font-size: 13px;">Smart Live TV · <a href="${baseUrl}" style="color: #00e676;">smartlivetv.co.uk</a></p>
        </div>
      `,
    },
  }

  const template = templates[type]

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Smart Live TV <noreply@smartlivetv.co.uk>',
      to: [email],
      subject: template.subject,
      html: template.html,
    }),
  })
}
