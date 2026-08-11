import type { Metadata } from 'next'
import { ENV } from '@/lib/config/env'
import { FadeIn } from "@/components/ui/fade-in"
import { FaqAccordion } from '@/components/pricing/faq-accordion'
import { AnswerBlock } from '@/components/seo/AnswerBlock'

export const metadata: Metadata = {
  title: 'Smart Live TV FAQ — Channels, Setup, Billing & Support Answered',
  description: 'Answers to every question about Smart Live TV: what channels are included, how to set up on Firestick & Smart TV, billing options, free trial details, and 24/7 support.',
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

        <AnswerBlock
          answer="Smart Live TV is a UK IPTV service that replaces Sky Sports, Netflix, Disney+, and TNT Sports with one subscription from £12/month. It includes 230,000+ live channels, works on Firestick, Smart TV, Android, iPhone, and PC, and offers a free 24-hour trial with no credit card required."
          facts={[
            "All Sky Sports, TNT Sports, beIN Sports, and 50+ country packages included",
            "Works on Firestick, Smart TV, Android, iPhone, iPad, PC, and Mac",
            "No contract — cancel anytime with no cancellation fees",
            "WhatsApp support 7 days a week, 9am–11pm UK time",
          ]}
          className="mb-8 text-left"
        />

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
