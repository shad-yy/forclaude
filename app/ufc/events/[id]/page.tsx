import type { Metadata } from 'next'
import Link from 'next/link'
import { ENV } from '@/lib/config/env'
import { ArrowLeft, Calendar, MapPin, Trophy } from 'lucide-react'

export const metadata: Metadata = {
  title: 'UFC Event | Smart Live TV',
  robots: { index: false, follow: true },
}

async function getUFCEvent(id: string) {
  try {
    // Try ESPN first
    const res = await fetch(
      `https://sports.core.api.espn.com/v2/sports/mma/leagues/ufc/events/${id}`,
      { next: { revalidate: 1800 } }
    )
    if (res.ok) return await res.json()
    
    // Try TheSportsDB as fallback
    const res2 = await fetch(
      `https://www.thesportsdb.com/api/v1/json/123/lookupevent.php?id=${id}`,
      { next: { revalidate: 1800 } }
    )
    if (res2.ok) {
      const data = await res2.json()
      return data?.events?.[0] || null
    }
    return null
  } catch {
    return null
  }
}

export default async function UFCEventPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const event = await getUFCEvent(params.id)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 
      pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Back link */}
        <Link href="/ufc"
          className="inline-flex items-center gap-2 text-gray-500 
            hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to UFC
        </Link>

        {event ? (
          <>
            <h1 className="text-3xl md:text-4xl font-extrabold 
              text-white mb-4">
              {event.name || event.strEvent || 'UFC Event'}
            </h1>
            
            <div className="flex flex-wrap gap-4 mb-8 text-sm 
              text-gray-400">
              {(event.date || event.dateEvent) && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.date || event.dateEvent)
                    .toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                </div>
              )}
              {(event.location || event.strVenue) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {event.location || event.strVenue}
                </div>
              )}
            </div>

            {/* Fight card if available */}
            {event.competitions && event.competitions.length > 0 && (
              <div className="space-y-4 mb-12">
                <h2 className="text-xl font-bold text-white mb-6">
                  Fight Card
                </h2>
                {event.competitions.map((comp: any, i: number) => (
                  <div key={i} 
                    className="bg-[#12121a] border border-[#2a2a3a] 
                      rounded-2xl p-5">
                    <div className="flex items-center 
                      justify-between gap-4">
                      {comp.competitors?.map((c: any, j: number) => (
                        <div key={j} 
                          className="flex-1 text-center">
                          <p className="font-bold text-white text-sm">
                            {c.displayName || c.athlete?.displayName || 
                             'TBA'}
                          </p>
                          {c.score && (
                            <p className="text-[#00e676] font-extrabold 
                              text-xl mt-1">
                              {c.score}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    {comp.notes?.[0]?.headline && (
                      <p className="text-xs text-gray-500 text-center 
                        mt-3">
                        {comp.notes[0].headline}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Graceful fallback — NEVER show 404 */
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <h1 className="text-2xl font-extrabold text-white mb-3">
              UFC Event
            </h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Detailed fight card information is loading. 
              Check back closer to the event date, or 
              browse all upcoming UFC events below.
            </p>
            <Link href="/ufc"
              className="inline-flex items-center gap-2 
                bg-[#00e676] text-black font-bold px-8 py-3.5 
                rounded-xl text-sm">
              View All UFC Events →
            </Link>
          </div>
        )}

        {/* CTA */}
        <div className="bg-[#12121a] border border-[#2a2a3a] 
          rounded-2xl p-6 text-center mt-8">
          <h3 className="font-bold text-white mb-2">
            Watch This Event Live in 4K
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Every UFC event included — no PPV extra charges.
            Free 24-hour trial, no card needed.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/free-trial"
              className="bg-[#00e676] text-black font-bold 
                px-6 py-3 rounded-xl text-sm">
              Try Free for 24H →
            </Link>
            <Link href="/pricing"
              className="border border-[#2a2a3a] hover:border-[#00e676]/30 
                text-gray-300 font-bold px-6 py-3 rounded-xl text-sm">
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
