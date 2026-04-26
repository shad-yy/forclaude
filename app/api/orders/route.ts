import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const orderSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(200).toLowerCase().trim(),
  whatsapp: z.string().max(20).optional(),
  plan: z.enum(['1 Month', '3 Months', '6 Months', '12 Months']),
  message: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = orderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      )
    }
    const { name, email, whatsapp, plan, message } = parsed.data

    const resendKey = process.env.RESEND_API_KEY
    const notifyEmail = process.env.ORDER_NOTIFY_EMAIL || 'orders@smartlivetv.com'

    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Smart Live TV Orders <noreply@smartlivetv.com>',
          to: [notifyEmail],
          subject: `New Order: ${plan} — ${name}`,
          html: `
            <h2>New Order Received</h2>
            <table>
              <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
              <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
              <tr><td><strong>WhatsApp:</strong></td><td>${whatsapp || 'Not provided'}</td></tr>
              <tr><td><strong>Plan:</strong></td><td>${plan}</td></tr>
              <tr><td><strong>Message:</strong></td><td>${message || 'None'}</td></tr>
              <tr><td><strong>Time:</strong></td><td>${new Date().toISOString()}</td></tr>
            </table>
          `,
        }),
      })

      // Also send confirmation to customer
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Smart Live TV <noreply@smartlivetv.com>',
          to: [email],
          subject: 'Your Smart Live TV Order — We\'ll Be In Touch Shortly',
          html: `
            <h2>Thanks ${name}!</h2>
            <p>We've received your order for the <strong>${plan}</strong> plan.</p>
            <p>Our team will contact you within <strong>2 hours</strong> via 
            WhatsApp${whatsapp ? ` (${whatsapp})` : ''} or email to get you set up.</p>
            <p>In the meantime, if you have any questions, message us on WhatsApp.</p>
            <br/>
            <p>The Smart Live TV Team</p>
          `,
        }),
      })
    }

    // Always log as backup regardless of Resend
    if (process.env.NODE_ENV !== 'production') {
      console.log('[ORDER]', {
        name, email, whatsapp, plan,
        timestamp: new Date().toISOString(),
      })
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
