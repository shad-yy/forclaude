import Link from "next/link"
import { PricingCardsSlider } from "@/components/pricing/PricingCardsSlider"

export function PricingPreview() {
  return (
    <section className="py-20 md:py-24 bg-[#0a0a0f] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            One Price. Everything Included.
          </h2>
          <p className="text-base md:text-lg text-gray-400">
            Compare what you pay now vs what you&apos;d pay with Smart Live TV.
          </p>
        </div>

        {/* Cost comparison strip */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 mb-6 max-w-2xl mx-auto">
          <h3 className="text-center text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">
            What You&apos;re Paying Now
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { name: "Sky Sports", price: "£43" },
              { name: "Netflix", price: "£18" },
              { name: "Disney+", price: "£5" },
              { name: "TNT Sports", price: "£31" },
            ].map((s) => (
              <div
                key={s.name}
                className="text-center bg-[#0a0a0f] rounded-xl p-3 border border-red-500/10"
              >
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

        {/* Arrow + price pill */}
        <div className="text-center mb-8 text-2xl text-gray-600">↓</div>
        <div className="bg-[#00e676]/5 border border-[#00e676]/20 rounded-2xl p-4 mb-10 max-w-xs mx-auto text-center">
          <div className="text-[#00e676] font-extrabold text-4xl">£12</div>
          <div className="text-white text-sm font-semibold mt-1">
            Smart Live TV — Everything Above Included
          </div>
          <div className="text-gray-500 text-xs mt-1">
            + Netflix, Disney+, Shahid, Hulu &amp; more
          </div>
        </div>

        {/* Pricing cards — slider on mobile, grid on desktop */}
        <PricingCardsSlider fullFeatures={false} showTrialCta />

        {/* Bottom disclaimer */}
        <div className="text-center mt-10 space-y-3">
          <p className="text-sm text-gray-500 font-medium bg-[#12121a] inline-block px-6 py-2 rounded-full border border-[#2a2a3a]">
            <span className="text-[#00e676] mr-2">✓</span>
            All plans have identical features · Only duration differs · Cancel anytime
          </p>
          <p className="text-center text-xs text-gray-600">
            Not sure yet?{" "}
            <Link href="/free-trial" className="text-[#00e676] hover:underline">
              Try free for 24 hours — no card needed
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
