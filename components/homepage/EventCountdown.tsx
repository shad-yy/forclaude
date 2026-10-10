"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  type CountdownEvent,
  pickNextF1Race,
  pickNextUfcEvent,
  soonest,
  withinCountdownWindow,
} from "@/lib/events/countdown-source"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Last-resort fallback, used only when both live sources are unreachable.
 *
 * Reviewed 2026-10-10. Kick-off times confirmed against the Premier League's
 * October fixture-amendment listing. This list goes stale by design: the live
 * F1 lookup above covers the next grand prix for most of the season, so this
 * exists to cover a provider outage, not to be the primary source.
 */
const FALLBACK_EVENTS: CountdownEvent[] = [
  {
    name: 'Manchester United vs Tottenham — PL Matchweek 6',
    date: new Date('2026-10-10T17:30:00+01:00'),
    href: '/watch/premier-league',
    sport: 'Premier League',
    badge: '/leagues/premier-league.png',
  },
  {
    name: 'Liverpool vs Manchester City — PL Matchweek 6',
    date: new Date('2026-10-11T16:30:00+01:00'),
    href: '/watch/premier-league',
    sport: 'Premier League',
    badge: '/leagues/premier-league.png',
  },
  {
    name: 'Coventry City vs Newcastle United — PL Matchweek 6',
    date: new Date('2026-10-12T20:00:00+01:00'),
    href: '/watch/premier-league',
    sport: 'Premier League',
    badge: '/leagues/premier-league.png',
  },
]

function getFallbackEvent(now: number): CountdownEvent | null {
  return (
    FALLBACK_EVENTS.filter(e => withinCountdownWindow(e.date, now)).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    )[0] ?? null
  )
}

export function EventCountdown() {
  const [upcomingEvent, setUpcomingEvent] = useState<CountdownEvent | null>(null)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [loading, setLoading] = useState(true)

  // Live sources first, hardcoded fallback only if both are unreachable.
  useEffect(() => {
    const loadEvent = async () => {
      const now = Date.now()

      const read = async (path: string): Promise<unknown> => {
        try {
          const res = await fetch(path, { cache: 'no-store' })
          return res.ok ? await res.json() : null
        } catch {
          return null
        }
      }

      const [ufcData, f1Data] = await Promise.all([
        read('/api/espn/mma/ufc/scoreboard'),
        read('/api/espn/racing/f1/scoreboard'),
      ])

      const live = soonest(pickNextUfcEvent(ufcData, now), pickNextF1Race(f1Data, now))
      setUpcomingEvent(live ?? getFallbackEvent(now))
      setLoading(false)
    }

    loadEvent()
  }, [])

  // Countdown ticker
  useEffect(() => {
    if (!upcomingEvent) return
    const tick = () => setTimeLeft(getTimeLeft(upcomingEvent.date))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [upcomingEvent])

  // Don't render if no upcoming event within 14 days
  if (loading || !upcomingEvent || !timeLeft) return null

  return (
    <div className="bg-gradient-to-r from-[#1a0000] 
      via-[#0d0d14] to-[#001a00] border-y border-[#2a2a3a] 
      py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between 
          gap-4 flex-wrap">
          
          {/* Event info */}
          <div className="flex items-center gap-3">
            <Image
              src={upcomingEvent.badge}
              alt={upcomingEvent.sport}
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <div>
              <p className="text-[10px] font-bold text-gray-500 
                uppercase tracking-widest">
                {upcomingEvent.sport} — Coming Soon
              </p>
              <p className="text-white font-extrabold text-sm">
                {upcomingEvent.name}
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3">
            {[
              { value: timeLeft.days, label: 'Days' },
              { value: timeLeft.hours, label: 'Hours' },
              { value: timeLeft.minutes, label: 'Min' },
              { value: timeLeft.seconds, label: 'Sec' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="bg-[#12121a] border 
                  border-[#2a2a3a] rounded-xl px-3 py-1.5 
                  min-w-[48px]">
                  <span className="text-white font-extrabold 
                    text-xl tabular-nums">
                    {pad(value)}
                  </span>
                </div>
                <span className="text-[10px] text-gray-600 
                  font-medium mt-0.5 block">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link href="/buy"
            className="flex-shrink-0 bg-[#00e676] 
              text-black font-bold text-xs px-5 py-2.5 
              rounded-xl hover:bg-[#00ff87] transition-all 
              touch-manipulation hidden sm:block">
            Watch Live →
          </Link>
        </div>
      </div>
    </div>
  )
}
