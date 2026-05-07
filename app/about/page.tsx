import type { Metadata } from 'next'
import Link from 'next/link'
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"

export const metadata: Metadata = {
  title: 'About Smart Live TV | IPTV Streaming Service',
  description: 'Learn about Smart Live TV — the UK\'s premium IPTV service with 230,000+ channels, 4K streaming, and no contracts. Free 24-hour trial.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <FadeIn>
      <section className="pt-28 md:pt-36 pb-16 md:pb-20 px-4 border-b border-[#2a2a3a]">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 md:mb-6">About Smart Live TV</h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            Smart Live TV gives UK sports fans and TV viewers the ability to watch everything they love — Premier League, Champions League, UFC, Formula 1, and all their favourite shows on Netflix, Disney+, Amazon Prime and Shahid — for a single monthly subscription that costs less than Sky Sports alone.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            We believe the era of paying separately for 8 different streaming services is over. Our subscribers cancel Netflix, Disney+, Sky Sports, and TNT Sports and replace everything with one service at a fraction of the cost.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { stat: '£109', label: 'Average monthly saving vs Sky + Netflix combined' },
              { stat: '4K', label: 'Ultra HD streaming quality' },
              { stat: '24H', label: 'Free trial — no card required' },
            ].map(item => (
              <div key={item.stat} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 text-center">
                <div className="text-3xl font-extrabold text-[#00e676] mb-2">{item.stat}</div>
                <div className="text-gray-400 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            We believe sport and entertainment should be accessible. Our mission is simple: give every
            fan the ability to watch their team and their favourite shows, on any device, from anywhere in the
            world — without paying a fortune or signing a long-term contract.
          </p>
          <Link href="/pricing" className="inline-flex items-center px-8 py-4 bg-[#00e676] text-black font-bold rounded-lg hover:bg-[#00ff87] transition-colors">
            Get My Free Trial →
          </Link>
        </div>
      </section>
      </FadeIn>
    </div>
  )
}
