import type { Metadata } from 'next'
import { ENV } from '@/lib/config/env'

export const metadata: Metadata = {
  title: 'Privacy Policy | Smart Live TV',
  description: 'Smart Live TV privacy policy — how we collect, use and protect your personal data.',
  alternates: { canonical: `${ENV.BASE_URL}/privacy` },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold text-white mb-4">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>When you place an order or contact us, we collect your name, 
            email address, and WhatsApp number. We do not collect payment 
            card details directly — payments are processed through our 
            secure payment partner.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your contact details solely to fulfil your subscription 
            order and provide customer support. We do not sell your data to 
            third parties. We may send you service-related communications 
            about your subscription.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data Storage</h2>
            <p>Your data is stored securely. We retain order information for 
            up to 2 years for customer service purposes. You may request 
            deletion of your data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Cookies</h2>
            <p>This website uses essential cookies only — for site functionality 
            and analytics. We do not use advertising or tracking cookies.
            You can disable cookies in your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Your Rights</h2>
            <p>Under UK GDPR you have the right to access, correct or delete 
            your personal data. To exercise these rights, contact us at 
            support@smartlivetv.com or via WhatsApp.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Contact</h2>
            <p>Privacy questions: <a href="mailto:support@smartlivetv.com" 
              className="text-[#00e676] hover:underline">support@smartlivetv.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
