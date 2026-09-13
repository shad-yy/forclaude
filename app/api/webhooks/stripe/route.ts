import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import type Stripe from 'stripe'

/**
 * Stripe Webhook Handler
 * 
 * Listens for checkout.session.completed events to:
 * 1. Log the payment
 * 2. Send notification email to owner
 * 3. Send confirmation email to customer
 * 4. (Future) Auto-create subscription on reseller panel
 * 5. (Future) Update customer record in Redis
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    console.error('[STRIPE WEBHOOK] Missing signature or webhook secret')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[STRIPE WEBHOOK] Signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutCompleted(session)
      break
    }
    default:
      console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {}
  const {
    planId,
    customerName,
    customerEmail,
    customerWhatsapp,
    customerDevice,
    durationDays,
  } = metadata

  const amountPaid = session.amount_total
    ? `£${(session.amount_total / 100).toFixed(2)}`
    : 'Unknown'

  console.log('[STRIPE WEBHOOK] Payment completed:', {
    planId,
    customerName,
    customerEmail,
    amountPaid,
    sessionId: session.id,
  })

  // Send notification email to owner
  const resendKey = process.env.RESEND_API_KEY
  const notifyEmail = process.env.ORDER_NOTIFY_EMAIL || 'support@smartlivetv.co.uk'

  if (resendKey && resendKey !== 'your-resend-key') {
    try {
      // Notify owner — PAYMENT CONFIRMED (not just a request)
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Smart Live TV <noreply@smartlivetv.co.uk>',
          to: [notifyEmail],
          subject: `💰 PAYMENT RECEIVED: ${amountPaid} — ${customerName} (${planId})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <div style="background: #00e676; color: #000; padding: 16px 24px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">💰 Payment Confirmed!</h2>
              </div>
              <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px;">
                <table style="border-collapse: collapse; width: 100%;">
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${customerName}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${customerEmail}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>WhatsApp</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${customerWhatsapp || 'Not provided'}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Plan</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${planId} (${durationDays} days)</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount Paid</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; color: #00a652; font-weight: bold;">${amountPaid}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Device</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${customerDevice || 'Not specified'}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Stripe Session</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; font-family: monospace; font-size: 11px;">${session.id}</td></tr>
                  <tr><td style="padding: 8px;"><strong>Time (UTC)</strong></td><td style="padding: 8px;">${new Date().toUTCString()}</td></tr>
                </table>
                <div style="margin-top: 16px; padding: 12px; background: #fff3cd; border-radius: 6px;">
                  <strong>⚡ Action Required:</strong> Create their subscription on the reseller panel and send credentials via WhatsApp.
                </div>
              </div>
            </div>
          `,
          reply_to: customerEmail,
        }),
      })

      // Send confirmation to customer
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Smart Live TV <noreply@smartlivetv.co.uk>',
          to: [customerEmail],
          subject: '✅ Payment Confirmed — Your Smart Live TV Subscription',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0a0a0f, #12121a); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: #00e676; margin: 0; font-size: 24px;">Payment Confirmed! ✅</h1>
                <p style="color: #aaa; margin-top: 8px;">Your Smart Live TV subscription is being activated</p>
              </div>
              <div style="background: #fff; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #eee;">
                <p>Hi ${customerName},</p>
                <p>Thank you for your payment of <strong>${amountPaid}</strong> for the <strong>${planId?.replace('month', ' Month')}</strong> plan.</p>
                
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <h3 style="margin: 0 0 8px; color: #166534;">What happens next?</h3>
                  <p style="margin: 0; color: #166534;">Our team will send your login credentials to your WhatsApp within <strong>5 minutes</strong>. We'll also include a personalised setup guide for your device.</p>
                </div>

                <h3>Your Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 8px;">Plan</td>
                    <td style="padding: 8px; text-align: right; font-weight: bold;">${planId?.replace('month', ' Month')}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 8px;">Amount Paid</td>
                    <td style="padding: 8px; text-align: right; font-weight: bold; color: #00a652;">${amountPaid}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px;">Money-Back Guarantee</td>
                    <td style="padding: 8px; text-align: right; font-weight: bold;">7 Days</td>
                  </tr>
                </table>

                <div style="margin-top: 24px; padding: 16px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                  <p style="margin: 0 0 8px; font-weight: bold;">Need help or have questions?</p>
                  <a href="https://wa.me/447429313810" style="display: inline-block; background: #25D366; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Message us on WhatsApp</a>
                </div>

                <p style="margin-top: 24px; color: #666; font-size: 12px;">
                  This email confirms your payment for Smart Live TV. If you did not make this purchase, please contact us immediately.
                </p>
                <p style="color: #666; font-size: 12px;">
                  Smart Live TV · <a href="https://smartlivetv.co.uk" style="color: #00a652;">smartlivetv.co.uk</a>
                </p>
              </div>
            </div>
          `,
        }),
      })
    } catch (emailErr) {
      console.error('[STRIPE WEBHOOK] Email send failed:', emailErr)
    }
  }

  // TODO: When reseller panel API is integrated:
  // 1. Auto-create paid subscription account
  // 2. Send credentials via email/WhatsApp
  // 3. Update customer record in Redis
}
