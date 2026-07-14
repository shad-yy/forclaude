"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const STATS = [
  "230,000+ channels streaming right now",
  "Premier League · Champions League · UFC · F1 included",
  "Netflix · Disney+ · Amazon Prime all included",
  "Works on Firestick · Smart TV · iPhone · Android",
  "99.9% uptime · Anti-buffer technology",
  "£109 monthly saving vs Sky Sports + Netflix",
]

export function LiveStats() {
  const [mounted, setMounted] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % STATS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [mounted])

  return (
    <div className="flex items-center justify-center gap-2
      bg-[#12121a] border border-[#2a2a3a] rounded-full
      px-4 py-2 overflow-hidden max-w-sm mx-auto">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]
        flex-shrink-0 animate-pulse" />
      <div className="h-4 overflow-hidden relative flex-1">
        {mounted ? (
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[11px] text-gray-300 text-center
              font-medium whitespace-nowrap"
            >
              {STATS[index]}
            </motion.p>
          </AnimatePresence>
        ) : (
          <p className="text-[11px] text-gray-300 text-center font-medium whitespace-nowrap">
            {STATS[0]}
          </p>
        )}
      </div>
    </div>
  )
}
