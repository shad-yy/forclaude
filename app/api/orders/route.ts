import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createCustomer, getCustomerByEmail } from '@/lib/db/customers'

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
    const { name, email, whatsapp, plan, message, device } = parsed.data

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

        const isTrial = plan === 'Free Trial Request'

        // Confirm to customer
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
              ? 'Your Free Trial Request — We\'ll Be In Touch Within 5 Minutes'
              : 'Your Smart Live TV Order — We\'ll Be In Touch Shortly',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.5;">
                <h2 style="color: #00e676; margin-bottom: 20px;">${isTrial ? 'Your Free Trial is Processing' : 'Order Confirmation'}</h2>
                <p>Hi ${name},</p>
                
                ${isTrial 
                  ? `<p>Thanks for requesting a free trial! Our team is generating your login credentials right now. They will be sent to your WhatsApp${whatsapp ? ` (${whatsapp})` : ''} within <strong>5 minutes</strong>.</p>`
                  : `<p>Thank you for your <strong>${plan}</strong> order! Our team is setting up your account and will contact you via WhatsApp${whatsapp ? ` (${whatsapp})` : ''} within <strong>2 hours</strong>.</p>
                     <p>Remember, your purchase is covered by our <strong>7-day money-back guarantee</strong>.</p>`
                }

                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #00e676;">
                  <h3 style="margin-top: 0; color: #111;">Get Ready for Your Setup</h3>
                  <p>While you wait for your credentials, you can prepare your device.</p>
                  ${displayDevice ? `<p style="margin: 8px 0;"><strong>Your Device:</strong> ${displayDevice}</p>` : ''}
                  <p style="margin: 8px 0;"><strong>Recommended Apps:</strong> ${apps.join(', ')}</p>
                  
                  <div style="margin-top: 20px;">
                    <a href="${setupUrl}" style="display: inline-block; background-color: #00e676; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                      View Setup Guide
                    </a>
                  </div>
                </div>

                <h3 style="color: #111;">What Happens Next?</h3>
                <ol style="padding-left: 20px; margin-bottom: 30px;">
                  <li style="margin-bottom: 8px;">You will receive your Username, Password, and Server URL via WhatsApp.</li>
                  <li style="margin-bottom: 8px;">Download one of the recommended apps on your device.</li>
                  <li style="margin-bottom: 8px;">Enter your details to start watching!</li>
                </ol>

                <p>Need help? <a href="https://wa.me/447429313810" style="color: #00e676; font-weight: bold; text-decoration: none;">Message us on WhatsApp</a></p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="color: #666; font-size: 14px;">The Smart Live TV Team<br/>
                <a href="https://smartlivetv.co.uk" style="color: #666; text-decoration: none;">smartlivetv.co.uk</a></p>
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
    try {
      const existingCustomer = await getCustomerByEmail(email)
      if (!existingCustomer) {
        const isTrial = plan === 'Free Trial Request'
        await createCustomer({
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
        console.log(`[ORDER] Customer record created for ${email}`)
      } else {
        console.log(`[ORDER] Customer ${email} already exists, skipping creation`)
      }
    } catch (dbErr) {
      // Don't fail the order if DB save fails
      console.error('[ORDER] Failed to save customer:', dbErr)
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
