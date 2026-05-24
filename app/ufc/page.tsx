import type { Metadata } from 'next'
import Link from 'next/link'
import { ENV } from '@/lib/config/env'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { Calendar, MapPin, ArrowLeft } from 'lucide-react'
import { getUpcomingEvents, getPastEvents } from '@/lib/api/ufc'

export const metadata: Metadata = {
  title: 'Watch UFC Live — All Fight Nights in 4K',
  description: 'Stream every UFC event live in 4K. Prelims, main card and PPV events all included. Free 24-hour trial — no card needed.',
  alternates: { canonical: `${ENV.BASE_URL}/ufc` },
}

function safeDateFormat(dateStr?: string): string {
  if (!dateStr) return 'TBA'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 'TBA'
  // Reject obviously wrong dates
  if (d.getFullYear() < 2024 || d.getFullYear() > 2030) return 'TBA'
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  '@id': `${ENV.BASE_URL}/ufc#breadcrumb`,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'UFC', item: `${ENV.BASE_URL}/ufc` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I watch UFC without pay-per-view?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Smart Live TV includes every UFC event — prelims, main card, and PPV — all included in your subscription from £12/month. No separate pay-per-view charges.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which channel shows UFC in the UK?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'UFC events in the UK are typically shown on TNT Sports and BT Sport. Smart Live TV includes TNT Sports and all UFC coverage from £12/month.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I watch UFC live in 4K?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Smart Live TV streams all UFC events in HD and 4K where available. Works on Firestick, Smart TV, Android, iPhone and PC.',
      },
    },
  ],
}

export default async function UFCPage() {
  const [upcoming, recent] = await Promise.allSettled([
    getUpcomingEvents(),
    getPastEvents(),
  ])

  const upcomingEvents = upcoming.status === 'fulfilled' 
    ? upcoming.value : []
  const recentEvents = recent.status === 'fulfilled' 
    ? recent.value : []

  // Filter out any events with obviously wrong dates
  const validUpcoming = upcomingEvents.filter(e => {
    if (!e.date) return true // TBA is OK
    const d = new Date(e.date)
    return isNaN(d.getTime()) || d.getFullYear() >= 2025
  })

  const validRecent = recentEvents.filter(e => {
    if (!e.date) return false
    const d = new Date(e.date)
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    )
    return !isNaN(d.getTime()) && 
      d >= thirtyDaysAgo && 
      d.getFullYear() >= 2025
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <SchemaMarkup schema={breadcrumbSchema} />
      <SchemaMarkup schema={faqSchema} />

      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-16 px-4 
        text-center border-b border-[#2a2a3a]"
        style={{
          background: 'linear-gradient(135deg, #1a0000 0%, #0a0a0f 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <img
              src="/leagues/ufc.png"
              alt="UFC"
              width={72}
              height={72}
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold 
            text-white mb-4">
            UFC — Every Fight Night Live
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Every UFC event included — prelims, main card, and PPV. 
            No pay-per-view charges. Stream in 4K on any device.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/buy"
              className="bg-[#00e676] text-black font-extrabold 
                px-8 py-4 rounded-xl text-base hover:bg-[#00ff87] 
                transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)]">
              Watch UFC Now →
            </Link>
            <Link href="/free-trial"
              className="border border-[#2a2a3a] hover:border-[#00e676]/40 
                text-gray-300 font-bold px-8 py-4 rounded-xl text-base">
              Try Free for 24H
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 
        lg:px-8 py-16 space-y-16">

        {/* Upcoming Events */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold 
            text-white mb-8">
            Upcoming UFC Events
          </h2>
          {validUpcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 
              lg:grid-cols-3 gap-6">
              {validUpcoming.map(event => (
                <Link
                  key={event.id}
                  href={`/ufc/events/${event.id}`}
                  className="bg-[#12121a] border border-[#2a2a3a] 
                    rounded-2xl overflow-hidden 
                    hover:border-[#00e676]/30 transition-all group"
                >
                  <div className="h-1.5 bg-gradient-to-r 
                    from-[#ff1744] to-[#ff6b35]" />
                  <div className="p-5">
                    <span className="inline-flex items-center gap-1.5 
                      bg-[#ff1744]/10 text-[#ff1744] text-[10px] 
                      font-extrabold uppercase tracking-wide 
                      px-2.5 py-1 rounded-full mb-3">
                      <span className="w-1.5 h-1.5 rounded-full 
                        bg-[#ff1744] animate-pulse" />
                      Upcoming
                    </span>
                    <h3 className="font-extrabold text-white mb-3 
                      group-hover:text-[#00e676] transition-colors 
                      leading-tight">
                      {event.name}
                    </h3>
                    <div className="space-y-1.5 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{safeDateFormat(event.date)}</span>
                      </div>
                      {event.location && event.location !== 'TBA' && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {event.location}
                          </span>
                        </div>
                      )}
                    </div>
                    {event.mainEvent && (
                      <p className="mt-3 text-xs font-semibold 
                        text-gray-400 border-t border-[#2a2a3a] pt-3">
                        Main Event: {event.mainEvent}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[#12121a] border border-[#2a2a3a] 
              rounded-2xl p-10 text-center">
              <img src="/leagues/ufc.png" alt="UFC"
                width={48} height={48}
                className="object-contain mx-auto mb-4 opacity-40" />
              <h3 className="font-bold text-white mb-2">
                Next Event Being Scheduled
              </h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                The next UFC event details will appear here once 
                confirmed. All events are included in your subscription.
              </p>
            </div>
          )}
        </section>

        {/* Recent Results — only show if we have them */}
        {validRecent.length > 0 && (
          <section className="border-t border-[#2a2a3a] pt-16">
            <h2 className="text-2xl md:text-3xl font-bold 
              text-white mb-8">
              Recent Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 
              lg:grid-cols-3 gap-6">
              {validRecent.slice(0, 6).map(event => (
                <Link
                  key={event.id}
                  href={`/ufc/events/${event.id}`}
                  className="bg-[#12121a] border border-[#2a2a3a] 
                    rounded-2xl overflow-hidden 
                    hover:border-[#00e676]/30 transition-all group"
                >
                  <div className="h-1.5 bg-[#2a2a3a]" />
                  <div className="p-5">
                    <span className="inline-block bg-gray-800 
                      text-gray-400 text-[10px] font-bold uppercase 
                      tracking-wide px-2.5 py-1 rounded-full mb-3">
                      Completed
                    </span>
                    <h3 className="font-extrabold text-white mb-3 
                      group-hover:text-[#00e676] transition-colors 
                      leading-tight">
                      {event.name}
                    </h3>
                    <div className="space-y-1.5 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{safeDateFormat(event.date)}</span>
                      </div>
                      {event.location && event.location !== 'TBA' && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {event.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="border-t border-[#2a2a3a] pt-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 max-w-3xl">
            {faqSchema.mainEntity.map((f: any) => (
              <div key={f.name}
                className="bg-[#12121a] border border-[#2a2a3a] 
                  rounded-2xl p-5">
                <h3 className="font-bold text-white text-sm mb-2">
                  {f.name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {f.acceptedAnswer.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-[#00e676]/10 pt-16 
          text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Watch Every UFC Fight Night Live
          </h2>
          <p className="text-gray-400 mb-8">
            No PPV charges. Every event included from £12/month.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/buy"
              className="bg-[#00e676] text-black font-extrabold 
                px-10 py-4 rounded-xl hover:bg-[#00ff87] transition-all">
              Get Access Now →
            </Link>
            <Link href="/free-trial"
              className="border border-[#2a2a3a] text-gray-300 
                font-bold px-10 py-4 rounded-xl 
                hover:border-[#00e676]/30 transition-all">
              Try Free for 24H
            </Link>
          </div>
        </section>
      </div>

      {/* Mobile sticky */}
      <div className="fixed bottom-0 left-0 right-0 z-50 
        md:hidden bg-[#0a0a0f]/95 backdrop-blur-sm 
        border-t border-[#2a2a3a] p-4">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/buy"
            className="bg-[#00e676] text-black font-bold 
              text-sm py-4 rounded-2xl text-center 
              touch-manipulation active:scale-[0.98]">
            Watch Now
          </Link>
          <Link href="/free-trial"
            className="border border-[#2a2a3a] text-gray-300 
              font-bold text-sm py-4 rounded-2xl text-center 
              touch-manipulation">
            Free Trial
          </Link>
        </div>
      </div>
    </div>
  )
}
