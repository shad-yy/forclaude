import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Smart Live TV | IPTV Streaming Service',
  description: 'Learn about Smart Live TV — the UK\'s premium IPTV service with 15,000+ channels, 4K streaming, and no contracts. Free 24-hour trial.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <section className="pt-32 pb-16 px-4 border-b border-gray-800">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">About Smart Live TV</h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            Smart Live TV is a premium IPTV streaming service built for sports fans
            who are tired of expensive cable packages, regional blackouts, and
            missing the matches that matter.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            We provide access to over 15,000 live channels — including every Premier
            League, La Liga, Champions League, Bundesliga, Serie A, and Ligue 1
            fixture — streamed in crystal-clear 4K on any device.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            No contracts. No credit card required for your free trial. Cancel any time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { stat: '15,000+', label: 'Live Channels' },
              { stat: '4K', label: 'Streaming Quality' },
              { stat: '24h', label: 'Free Trial' },
            ].map(item => (
              <div key={item.stat} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 text-center">
                <div className="text-3xl font-extrabold text-[#00e676] mb-2">{item.stat}</div>
                <div className="text-gray-400 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            We believe sport should be accessible. Our mission is simple: give every
            fan the ability to watch their team, on any device, from anywhere in the
            world — without paying a fortune or signing a long-term contract.
          </p>
          <Link href="/pricing" className="inline-flex items-center px-8 py-4 bg-[#00e676] text-black font-bold rounded-lg hover:bg-[#00ff87] transition-colors">
            Get My Free Trial →
          </Link>
        </div>
      </section>
    </div>
  )
}
