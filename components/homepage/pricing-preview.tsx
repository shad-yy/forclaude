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

const FEATURES = [
  "230,000+ Live Channels",
  "4K Ultra HD Quality",
  "All Live Sports & PPV",
  "Anti-Buffer Technology",
  "Works on All Devices"
]

export function PricingPreview() {
  return (
    <section className="py-24 bg-[#0a0a0f] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-400">
            All plans include 230,000+ channels, 4K quality and a free 24-hour trial.
          </p>
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
                  {FEATURES.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-[#00e676]/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#00e676]" />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link 
                href="/free-trial"
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all text-center mt-auto
                  ${plan.color === 'highlighted'
                    ? 'bg-[#00e676] text-black hover:bg-[#00ff87] shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                    : 'bg-[#1a1a24] text-white hover:bg-[#2a2a3a] border border-[#2a2a3a]'
                  }`}
              >
                Start Free Trial
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 font-medium bg-[#12121a] inline-block px-6 py-2 rounded-full border border-[#2a2a3a]">
            <span className="text-[#00e676] mr-2">✓</span>
            All plans have identical features · Only duration differs · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
