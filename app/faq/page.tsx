import type { Metadata } from 'next'
import { ENV } from '@/lib/config/env'
import { FadeIn } from "@/components/ui/fade-in"
import { FaqAccordion } from '@/components/pricing/faq-accordion'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Smart Live TV',
  description: 'Got questions? We have answers. Learn more about Smart Live TV channels, setup, billing, and support.',
  alternates: { canonical: `${ENV.BASE_URL}/faq` },
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 pt-28 md:pt-36 pb-16 md:pb-20">
      <FadeIn>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-400 text-lg">Everything you need to know about Smart Live TV.</p>
        </div>

        <div className="bg-[#12121a] rounded-3xl p-6 md:p-10 border border-[#2a2a3a]">
          <FaqAccordion />
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
          <p className="text-gray-400 mb-6">Our support team is available 7 days a week on WhatsApp.</p>
          <a
            href={process.env.NEXT_PUBLIC_WHATSAPP_URL || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#00e676] hover:bg-[#00ff87] text-black font-extrabold px-8 py-3 rounded-xl text-base shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
      </FadeIn>
    </div>
  )
}
