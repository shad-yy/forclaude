import type { Metadata } from 'next'
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"

export const metadata: Metadata = {
  title: 'Contact Smart Live TV | Get Support',
  description: 'Get in touch with the Smart Live TV team. We\'re here to help with setup, billing, or any questions about our IPTV service.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <FadeIn>
      <section className="pt-28 md:pt-36 pb-16 md:pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 md:mb-6">Contact Us</h1>
          <p className="text-gray-300 text-lg mb-8 md:mb-12">
            We typically respond within 2 hours. For the fastest response,
            reach us on WhatsApp.
          </p>
          <StaggerIn className="space-y-6">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="font-bold text-white mb-2">💬 WhatsApp (Fastest)</h2>
              <p className="text-gray-400 text-sm mb-4">Available 7 days a week, 9am–11pm GMT</p>
              <a href={process.env.NEXT_PUBLIC_WHATSAPP_URL || '#'} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-[#25D366] text-black font-bold rounded-lg hover:brightness-110 transition-all">
                Message Us on WhatsApp →
              </a>
            </div>
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="font-bold text-white mb-2">📧 Email</h2>
              <p className="text-gray-400 text-sm mb-2">For billing and account queries</p>
              <a href="mailto:support@smartlivetv.com" className="text-[#00e676] hover:underline">
                support@smartlivetv.com
              </a>
            </div>
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="font-bold text-white mb-2">⚡ Free Trial</h2>
              <p className="text-gray-400 text-sm mb-4">
                No card needed. Get instant access to 15,000+ channels.
              </p>
              <a href="/pricing" className="inline-flex items-center px-6 py-3 bg-[#00e676] text-black font-bold rounded-lg hover:bg-[#00ff87] transition-colors">
                Start Free Trial →
              </a>
            </div>
          </StaggerIn>
        </div>
      </section>
      </FadeIn>
    </div>
  )
}
