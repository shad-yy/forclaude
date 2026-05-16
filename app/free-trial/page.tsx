import { Metadata } from 'next'
import Link from 'next/link'
import { ENV } from '@/lib/config/env'
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { TrialForm } from "@/components/trial/TrialForm"

export const metadata: Metadata = {
  title: 'Get Your Free 24-Hour IPTV Trial',
  description: 'Claim your free 24-hour trial. No credit card. All 230,000+ channels included. Set up in 5 minutes on any device.',
  alternates: { canonical: `${ENV.BASE_URL}/free-trial` },
}

export default function FreeTrialPage() {
  return (
    <div className="bg-[#0a0a0f] min-h-screen pt-28 md:pt-36 pb-16 md:pb-20 px-4">
      {/* SECTION 1 — HERO */}
      <FadeIn>
      <section className="text-center max-w-2xl mx-auto">
        <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-4 py-2 rounded-full mb-6 inline-block">
          ✦ Only 10 Free Trials Available Daily
        </span>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Your Free 24-Hour Trial
        </h1>

        <p className="text-gray-400 text-lg mb-10">
          Get full access to Netflix, Disney+, Sky Sports, Champions League, UFC, and every streaming service you pay for separately — all in one place, for one price.
        </p>

        <div className="flex gap-6 justify-center flex-wrap mb-10">
          <div className="text-center">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-sm font-bold text-white">Full Access</div>
            <div className="text-xs text-gray-500">All 230,000+ channels</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">⏱</div>
            <div className="text-sm font-bold text-white">24 Hours</div>
            <div className="text-xs text-gray-500">Complete trial period</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">💳</div>
            <div className="text-sm font-bold text-white">No Card</div>
            <div className="text-xs text-gray-500">Zero payment details</div>
          </div>
        </div>
      </section>
      </FadeIn>

      {/* SECTION 2 — THE WHATSAPP CTA */}
      <FadeIn direction="up">
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-3xl p-6 md:p-10 max-w-xl mx-auto mb-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-2">
            Request Your Free Trial
          </h2>
          <p className="text-gray-400 text-sm">
            Fill in the form below. We'll send your credentials 
            to WhatsApp within 5 minutes.
          </p>
        </div>

        <TrialForm />
      </div>
      </FadeIn>

      {/* SECTION 3 — HOW IT WORKS */}
      <FadeIn direction="up">
      <section className="max-w-2xl mx-auto mb-16 md:mb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          How It Works
        </h2>

        <StaggerIn className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#00e676] text-black font-extrabold text-sm flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div>
              <div className="font-bold text-white text-sm">Message Us on WhatsApp</div>
              <div className="text-gray-500 text-sm">Tell us what device you'll be watching on (Firestick, Smart TV, Android or iPhone).</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#00e676] text-black font-extrabold text-sm flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div>
              <div className="font-bold text-white text-sm">We Send Your Trial Credentials</div>
              <div className="text-gray-500 text-sm">Within 5 minutes you'll receive your login details and a setup guide for your specific device.</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#00e676] text-black font-extrabold text-sm flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div>
              <div className="font-bold text-white text-sm">Watch Everything Live for 24 Hours</div>
              <div className="text-gray-500 text-sm">Full access to all 230,000+ channels. No restrictions. If you love it, choose a plan. No pressure.</div>
            </div>
          </div>
        </StaggerIn>
      </section>
      </FadeIn>

      {/* SECTION 4 — WHAT'S INCLUDED */}
      <FadeIn direction="up">
      <section className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          What's Included in Your Trial
        </h2>

        <StaggerIn className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Netflix (included — no extra charge)",
            "Disney+ (included — no extra charge)",
            "Amazon Prime Video (included — no extra charge)",
            "Shahid & Arabic streaming platforms",
            "Sky Sports Premier League (live matches)",
            "TNT Sports (Champions League)",
            "Sky Sports F1 (no ad breaks)",
            "UFC Fight Pass",
            "BBC, ITV, Channel 4, Channel 5",
            "Sky Atlantic, Sky Max & Sky Cinema",
            "40,000+ on-demand movies & series",
            "230,000+ total channels from 50+ countries"
          ].map((item, i) => (
            <div key={i} className="bg-[#12121a] border border-[#2a2a3a] rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-[#00e676]">✓</span>
              <span className="text-sm text-gray-300">{item}</span>
            </div>
          ))}
        </StaggerIn>

        <div className="text-center mt-8">
          <span className="text-sm text-gray-500">Plus 230,000+ more channels across every category</span>
          <Link href="/channels" className="text-[#00e676] text-sm hover:underline ml-2">
            Browse full channel list →
          </Link>
        </div>
      </section>
      </FadeIn>
    </div>
  )
}
