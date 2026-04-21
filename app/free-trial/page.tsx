import { Metadata } from 'next'
import Link from 'next/link'
import { ENV } from '@/lib/config/env'

export const metadata: Metadata = {
  title: 'Get Your Free 24-Hour IPTV Trial | Smart Live TV',
  description: 'Claim your free 24-hour trial. No credit card. All 15,000+ channels included. Set up in 5 minutes on any device.',
  alternates: { canonical: `${ENV.BASE_URL}/free-trial` },
}

export default function FreeTrialPage() {
  return (
    <div className="bg-[#0a0a0f] min-h-screen pt-28 pb-20 px-4">
      {/* SECTION 1 — HERO */}
      <section className="text-center max-w-2xl mx-auto">
        <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-4 py-2 rounded-full mb-6 inline-block">
          ✦ Only 10 Free Trials Available Daily
        </span>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Your Free 24-Hour Trial
        </h1>

        <p className="text-gray-400 text-lg mb-10">
          Get instant access to 15,000+ live channels — every Sky Sports, 
          TNT Sports, beIN Sports, UFC and BBC channel included.
          We set up every trial personally to make sure it works 
          perfectly on your device.
        </p>

        <div className="flex gap-6 justify-center flex-wrap mb-10">
          <div className="text-center">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-sm font-bold text-white">Full Access</div>
            <div className="text-xs text-gray-500">All 15,000+ channels</div>
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

      {/* SECTION 2 — THE WHATSAPP CTA */}
      <section className="bg-[#12121a] border border-[#2a2a3a] rounded-3xl p-8 md:p-12 max-w-lg mx-auto text-center mb-12">
        <h2 className="text-2xl font-extrabold text-white mb-3">
          Claim Your Trial on WhatsApp
        </h2>

        <p className="text-gray-400 text-sm mb-8">
          Tap the button below. Tell us what device you're using 
          and we'll have you watching live TV within 5 minutes.
        </p>

        <a
          href={process.env.NEXT_PUBLIC_WHATSAPP_URL ? `${process.env.NEXT_PUBLIC_WHATSAPP_URL}&text=Hi%2C+I%27d+like+to+claim+my+free+24h+trial.+Device%3A+` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:brightness-110 text-black font-extrabold text-lg px-8 py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(37,211,102,0.3)]"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current flex-shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Claim My Free Trial on WhatsApp
        </a>

        <div className="text-xs text-gray-600 mt-4">
          We respond within 5 minutes · Available 9am–11pm UK time
        </div>
      </section>

      {/* SECTION 3 — HOW IT WORKS */}
      <section className="max-w-2xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          How It Works
        </h2>

        <div className="flex flex-col gap-4">
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
              <div className="text-gray-500 text-sm">Full access to all 15,000+ channels. No restrictions. If you love it, choose a plan. No pressure.</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — WHAT'S INCLUDED */}
      <section className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          What's Included in Your Trial
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Sky Sports Premier League (live matches)",
            "TNT Sports (Champions League)",
            "Sky Sports F1 (no ad breaks)",
            "beIN Sports 1-7 (La Liga, more)",
            "UFC Fight Pass",
            "BBC One, Two, Three, Four",
            "ITV, Channel 4, Channel 5",
            "Sky Atlantic & Sky Max",
            "Sky Cinema (all 10 channels)",
            "NBA League Pass & NFL Game Pass",
            "40,000+ on-demand movies & shows",
            "Arabic, French, German & 50+ country packs"
          ].map((item, i) => (
            <div key={i} className="bg-[#12121a] border border-[#2a2a3a] rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-[#00e676]">✓</span>
              <span className="text-sm text-gray-300">{item}</span>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <span className="text-sm text-gray-500">Plus 15,000+ more channels across every category</span>
          <Link href="/channels" className="text-[#00e676] text-sm hover:underline ml-2">
            Browse full channel list →
          </Link>
        </div>
      </section>
    </div>
  )
}
