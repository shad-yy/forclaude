import Stripe from 'stripe'

// Singleton Stripe instance
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  if (stripeInstance) return stripeInstance
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key === 'your-stripe-secret-key') {
    console.warn('[Stripe] STRIPE_SECRET_KEY not configured')
    return null
  }
  stripeInstance = new Stripe(key, { apiVersion: '2024-12-18.acacia' })
  return stripeInstance
}

/**
 * Plan configuration mapping plan IDs to Stripe prices.
 * After creating products in Stripe Dashboard, add the price IDs here.
 * For now, we use ad-hoc checkout sessions with inline pricing.
 */
export const PLANS = {
  '1month': {
    name: '1 Month Basic',
    period: '1 Month',
    priceGBP: 1200,       // in pence
    displayPrice: '£12',
    monthly: '£12/mo',
    durationDays: 30,
  },
  '3month': {
    name: '3 Month Popular',
    period: '3 Months',
    priceGBP: 2400,
    displayPrice: '£24',
    monthly: '£8/mo',
    durationDays: 90,
  },
  '6month': {
    name: '6 Month Standard',
    period: '6 Months',
    priceGBP: 3600,
    displayPrice: '£36',
    monthly: '£6/mo',
    durationDays: 180,
  },
  '12month': {
    name: '12 Month Premium',
    period: '12 Months',
    priceGBP: 5400,
    displayPrice: '£54',
    monthly: '£4.50/mo',
    durationDays: 365,
  },
} as const

export type PlanId = keyof typeof PLANS
