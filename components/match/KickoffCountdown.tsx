'use client'

import { useEffect, useState } from 'react'
import { Clock, Radio } from 'lucide-react'

interface KickoffCountdownProps {
  targetDate: string | Date | null | undefined
  matchTitle?: string
  homeTeam?: string
  awayTeam?: string
  className?: string
  variant?: 'card' | 'badge'
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isLive: boolean
  isPast: boolean
}

function calculateTimeRemaining(target: Date): TimeRemaining {
  const now = new Date().getTime()
  const distance = target.getTime() - now

  if (distance <= 0) {
    const isLive = Math.abs(distance) < 2 * 60 * 60 * 1000
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive, isPast: !isLive }
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, isLive: false, isPast: false }
}

export function KickoffCountdown({
  targetDate,
  matchTitle,
  homeTeam,
  awayTeam,
  className = '',
  variant = 'card',
}: KickoffCountdownProps) {
  const [target, setTarget] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState<TimeRemaining | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!targetDate) return

    const parsed = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
    if (isNaN(parsed.getTime())) return

    setTarget(parsed)
    setTimeLeft(calculateTimeRemaining(parsed))

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(parsed))
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  if (!mounted || !target || !timeLeft) {
    return null
  }

  if (timeLeft.isLive) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider ${className}`}>
        <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
        <span>Live Now</span>
      </div>
    )
  }

  if (timeLeft.isPast) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/60 border border-gray-700 text-gray-400 text-xs font-medium ${className}`}>
        <span>Full Time</span>
      </div>
    )
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#181824] border border-[#2a2a3a] text-xs font-medium text-gray-300 ${className}`}>
        <Clock className="w-3 h-3 text-[#00e676]" />
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
      </div>
    )
  }

  return (
    <div className={`bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4 md:p-6 text-center ${className}`}>
      <div className="flex items-center justify-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-[#00e676]">
        <Clock className="w-4 h-4" />
        <span>Kickoff Countdown</span>
      </div>

      {(matchTitle || (homeTeam && awayTeam)) && (
        <h4 className="text-base md:text-lg font-bold text-white mb-4">
          {matchTitle || `${homeTeam} vs ${awayTeam}`}
        </h4>
      )}

      <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
        <div className="bg-[#1a1a24] border border-white/5 rounded-lg py-2 px-1">
          <span className="block text-xl md:text-2xl font-black text-white">{timeLeft.days}</span>
          <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Days</span>
        </div>
        <div className="bg-[#1a1a24] border border-white/5 rounded-lg py-2 px-1">
          <span className="block text-xl md:text-2xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Hours</span>
        </div>
        <div className="bg-[#1a1a24] border border-white/5 rounded-lg py-2 px-1">
          <span className="block text-xl md:text-2xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Mins</span>
        </div>
        <div className="bg-[#1a1a24] border border-white/5 rounded-lg py-2 px-1">
          <span className="block text-xl md:text-2xl font-black text-[#00e676]">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Secs</span>
        </div>
      </div>
    </div>
  )
}
