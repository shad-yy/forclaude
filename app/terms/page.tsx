import type { Metadata } from 'next'
import { ENV } from '@/lib/config/env'

export const metadata: Metadata = {
  title: 'Terms of Service | Smart Live TV',
  description: 'Smart Live TV terms of service — your rights and responsibilities as a subscriber.',
  alternates: { canonical: `${ENV.BASE_URL}/terms` },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold text-white mb-4">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Service Description</h2>
            <p>Smart Live TV provides access to a streaming service with 15,000+ 
            live channels. A free 24-hour trial is available with no credit card 
            required. Paid subscriptions begin after the trial period at the 
            rate of your chosen plan.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Subscriptions & Billing</h2>
            <p>Subscriptions are billed monthly with no long-term contract. 
            You may cancel at any time before your next billing date. 
            No refunds are issued for partial months of service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Acceptable Use</h2>
            <p>Your subscription is for personal, non-commercial use only. 
            Sharing account credentials outside your household is not permitted. 
            We reserve the right to suspend accounts found to be in breach 
            of this policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Service Availability</h2>
            <p>We aim for 99.9% uptime but do not guarantee uninterrupted service. 
            Scheduled maintenance will be communicated where possible. 
            We are not liable for service disruptions caused by third-party 
            infrastructure failures.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Limitation of Liability</h2>
            <p>Smart Live TV's liability is limited to the amount paid in the 
            current billing month. We are not responsible for indirect or 
            consequential damages arising from use of the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Governing Law</h2>
            <p>These terms are governed by the laws of England and Wales. 
            Any disputes shall be subject to the exclusive jurisdiction 
            of the courts of England and Wales.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contact</h2>
            <p>Questions about these terms: <a href="mailto:support@smartlivetv.com"
              className="text-[#00e676] hover:underline">support@smartlivetv.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
