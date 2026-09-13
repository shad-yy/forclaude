import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getStripe, PLANS, PlanId } from '@/lib/stripe'

const checkoutSchema = z.object({
  planId: z.enum(['1month', '3month', '6month', '12month']),
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().max(200).toLowerCase().trim(),
  whatsapp: z.string().max(20).optional(),
  device: z.string().max(100).optional(),
  customerId: z.string().optional(), // link to existing customer record
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    if (!stripe) {
      // Fallback: if Stripe is not configured, redirect to WhatsApp
      return NextResponse.json(
        { error: 'Payment not configured', fallback: 'whatsapp' },
        { status: 503 }
      )
    }

    const { planId, name, email, whatsapp, device, customerId } = parsed.data
    const plan = PLANS[planId as PlanId]

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartlivetv.co.uk'

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Smart Live TV — ${plan.name}`,
              description: `${plan.period} subscription. 230,000+ channels including Sky Sports, Netflix, Disney+. Instant activation.`,
              images: [`${baseUrl}/og-default.png`],
            },
            unit_amount: plan.priceGBP,
          },
          quantity: 1,
        },
      ],
      metadata: {
        planId,
        customerName: name,
        customerEmail: email,
        customerWhatsapp: whatsapp || '',
        customerDevice: device || '',
        customerId: customerId || '',
        durationDays: plan.durationDays.toString(),
      },
      success_url: `${baseUrl}/buy?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/buy?cancelled=true`,
      // Allow promotions/coupons in the future
      allow_promotion_codes: true,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (err) {
    console.error('[CHECKOUT ERROR]', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
