"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

const PRICING_PLANS = [
  {
    period: "1 Month",
    price: "£12",
    label: "Starter",
    color: "neutral"
  },
  {
    period: "3 Months",
    price: "£24",
    sub: "£8/mo",
    label: "Popular",
    color: "highlighted",
    badge: "BEST VALUE"
  },
  {
    period: "6 Months",
    price: "£36",
    sub: "£6/mo",
    label: "Standard",
    color: "neutral"
  },
  {
    period: "12 Months",
    price: "£54",
    sub: "£4.50/mo",
    label: "Ultimate",
    color: "neutral"
  }
]

const PLAN_FEATURES = [
  '230,000+ Channels, Movies & Series',
  'Netflix, Disney+, Amazon Prime Included',
  'Hulu, Apple TV+, Paramount+, Shahid Included',
  'All Sky Sports Channels in 4K',
  'TNT Sports — Champions League Included',
  'UFC, F1, NBA, NFL — All Sports Live',
  'Anti-Buffer Technology',
  'Electronic Program Guide (EPG)',
  'Works on ALL Devices',
  '24/7 Customer Support',
  'Free 24-Hour Trial — No Card Needed',
  '7-Day Money Back Guarantee',
  'No Contract — Cancel Anytime',
  'Instant Activation After Payment',
]

export function PricingPreview() {
  return (
    <section className="py-24 bg-[#0a0a0f] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            One Price. Everything Included.
          </h2>
          <p className="text-lg text-gray-400">
            Compare what you pay now vs what you&apos;d pay with Smart Live TV.
          </p>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 mb-8 max-w-2xl mx-auto">
          <h3 className="text-center text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">
            What You&apos;re Paying Now
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { name: 'Sky Sports', price: '£43' },
              { name: 'Netflix', price: '£18' },
              { name: 'Disney+', price: '£5' },
              { name: 'TNT Sports', price: '£31' },
            ].map(s => (
              <div key={s.name} className="text-center bg-[#0a0a0f] rounded-xl p-3 border border-red-500/10">
                <div className="text-red-400 font-extrabold text-lg">{s.price}</div>
                <div className="text-gray-600 text-xs mt-0.5">{s.name}</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <span className="text-red-400 font-bold text-sm">Total: £97+/month</span>
            <span className="text-gray-600 text-xs ml-2">(and rising)</span>
          </div>
        </div>

        <div className="text-center mb-6 text-2xl text-gray-600">↓</div>

        <div className="bg-[#00e676]/5 border border-[#00e676]/20 rounded-2xl p-4 mb-8 max-w-xs mx-auto text-center">
          <div className="text-[#00e676] font-extrabold text-4xl">£12</div>
          <div className="text-white text-sm font-semibold mt-1">Smart Live TV — Everything Above Included</div>
          <div className="text-gray-500 text-xs mt-1">+ Netflix, Disney+, Shahid, Hulu & more</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <motion.div
              key={plan.period}
              whileHover={{ y: -5 }}
              className={`relative bg-[#12121a] border rounded-2xl p-6 flex flex-col transition-all
                ${plan.color === 'highlighted' 
                  ? 'border-[#00e676] shadow-[0_0_20px_rgba(0,230,118,0.1)] scale-105 z-10' 
                  : 'border-[#2a2a3a] hover:border-[#00e676]/30'}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00e676] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-[#00e676]/20">
                  {plan.badge}
                </div>
              )}
              
              <div className="text-center mb-6 border-b border-[#2a2a3a]/50 pb-6">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                  {plan.period}
                </p>
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-white">
                    {plan.price}
                  </span>
                </div>
                {plan.sub && (
                  <p className="text-sm text-[#00e676] font-semibold">
                    {plan.sub}
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-2 font-medium">
                  {plan.label}
                </p>
              </div>

              <div className="flex-grow">
                <ul className="space-y-3 mb-6">
                  {PLAN_FEATURES.slice(0, 8).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-[#00e676]/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#00e676]" />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                  <li className="text-xs text-gray-500 pt-1">
                    + 4 more features on{' '}
                    <Link href="/pricing" 
                      className="text-[#00e676] hover:underline">
                      full pricing page
                    </Link>
                  </li>
                </ul>
              </div>

              {plan.color === 'highlighted' ? (
                <>
                  <Link 
                    href="/buy"
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all text-center mt-auto bg-[#00e676] text-black hover:bg-[#00ff87] shadow-[0_0_15px_rgba(0,230,118,0.3)] block"
                  >
                    Get Access Now →
                  </Link>
                  <Link 
                    href="/free-trial"
                    className="w-full py-2 mt-2 rounded-xl text-xs font-bold transition-all text-center border border-transparent text-gray-400 hover:text-white hover:bg-white/5 block"
                  >
                    Try Free First
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/buy"
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all text-center mt-auto bg-[#1a1a24] text-white hover:bg-[#2a2a3a] border border-[#2a2a3a] block"
                  >
                    Get Access Now →
                  </Link>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    or <Link href="/free-trial" className="hover:underline text-gray-400">try free for 24h →</Link>
                  </p>
                </>
              )}
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 font-medium bg-[#12121a] inline-block px-6 py-2 rounded-full border border-[#2a2a3a]">
            <span className="text-[#00e676] mr-2">✓</span>
            All plans have identical features · Only duration differs · Cancel anytime
          </p>
          <p className="text-center text-xs text-gray-600 mt-4">
            Not sure yet?{' '}
            <Link href="/free-trial" className="text-[#00e676] hover:underline">
              Try free for 24 hours — no card needed
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
