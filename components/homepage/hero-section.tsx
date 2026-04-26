"use client"
import { motion } from "framer-motion"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import Link from "next/link"
import { Check } from "lucide-react"
import { LEAGUES } from "@/lib/constants/leagues"
import { LeagueBadge } from "@/components/league/league-badge"

export function HeroSection() {
  return (
    <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-background flex flex-col items-center justify-center">
      {/* Background with CSS grid pattern overlay at 5% opacity and subtle radial gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-accent-primary/20 via-background to-background opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent-secondary/20 via-transparent to-transparent opacity-50"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-10"></div>

        {/* Animated floating particles */}
        <div className="absolute top-[20%] left-[10%] w-32 h-32 bg-accent-primary/20 rounded-full blur-[60px] animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[10%] w-40 h-40 bg-accent-secondary/20 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] right-[30%] w-24 h-24 bg-accent-primary/10 rounded-full blur-[50px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">

          {/* LEFT COLUMN (60%) */}
          <div className="flex-1 lg:max-w-[60%] flex flex-col items-start text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="inline-flex items-center gap-2 bg-surface-elevated border border-accent-primary/30 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-live-red"></span>
              </span>
              <span className="text-text-primary">15,000+ Channels Streaming Now</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Watch Every Match Live <br />
              <span className="text-accent-primary">— No Blackouts, No Cable</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary max-w-xl font-normal leading-relaxed"
            >
              Stream Premier League, La Liga, Champions League, UFC & more in 4K
              on any device. No contracts. Cancel anytime.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2"
            >
              <ShimmerButton href="/free-trial" variant="primary"
                className="w-full sm:w-auto px-8 py-4 text-lg rounded-lg">
                Get My Free 24-Hour Trial
              </ShimmerButton>
              <ShimmerButton href="#fixtures" variant="ghost"
                className="w-full sm:w-auto px-8 py-4 text-lg rounded-lg">
                See Tonight's Matches ↓
              </ShimmerButton>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="pt-2 w-full flex flex-wrap items-center gap-x-4 gap-y-3 text-sm lg:text-base text-text-muted font-semibold"
            >
              <span className="flex items-center gap-1.5 text-text-secondary"><Check className="w-4 h-4 text-accent-primary" strokeWidth={3} /> 15,000+ Channels</span>
              <span className="hidden sm:inline text-border">|</span>
              <span className="flex items-center gap-1.5 text-text-secondary"><Check className="w-4 h-4 text-accent-primary" strokeWidth={3} /> 4K Streaming</span>
              <span className="hidden sm:inline text-border">|</span>
              <span className="flex items-center gap-1.5 text-text-secondary"><Check className="w-4 h-4 text-accent-primary" strokeWidth={3} /> All Devices</span>
              <span className="hidden lg:inline text-border">|</span>
              <span className="flex items-center gap-1.5 text-text-secondary"><Check className="w-4 h-4 text-accent-primary" strokeWidth={3} /> Cancel Anytime</span>
              <span className="hidden sm:inline text-border">|</span>
              <span className="flex items-center gap-1.5 text-text-secondary"><Check className="w-4 h-4 text-accent-primary" strokeWidth={3} /> 24hr Free Trial</span>
            </motion.div>
          </div>

          {/* RIGHT COLUMN (40%) */}
          <div className="w-full lg:w-[40%] flex flex-col items-center lg:items-end">
            <motion.div
              initial={{ opacity: 0, x: 20, rotate: -2 }}
              animate={{ opacity: 1, x: 0, rotate: -2 }}
              whileHover={{ rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="w-full max-w-sm bg-surface-elevated border border-border rounded-xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-semibold text-text-secondary uppercase tracking-widest">Platform Highlights</span>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-live-red"></span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-surface rounded-lg p-3 border border-border/50">
                  <div className="text-2xl font-black text-accent-primary leading-none">15K+</div>
                  <div className="text-[11px] text-text-muted font-medium mt-0.5">Live Channels</div>
                </div>
                <div className="bg-surface rounded-lg p-3 border border-border/50">
                  <div className="text-2xl font-black text-accent-primary leading-none">4K</div>
                  <div className="text-[11px] text-text-muted font-medium mt-0.5">Stream Quality</div>
                </div>
                <div className="bg-surface rounded-lg p-3 border border-border/50">
                  <div className="text-2xl font-black text-accent-primary leading-none">99.9%</div>
                  <div className="text-[11px] text-text-muted font-medium mt-0.5">Uptime</div>
                </div>
                <div className="bg-surface rounded-lg p-3 border border-border/50">
                  <div className="text-2xl font-black text-text-primary leading-none">Free</div>
                  <div className="text-[11px] text-text-muted font-medium mt-0.5">24hr Trial</div>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-border pt-4">
                <div className="flex -space-x-2">
                  {[
                    {
                      src: "https://www.thesportsdb.com/images/media/league/badge/i6o0kh1549879062.png/tiny",
                      alt: "Premier League",
                      fallback: "🏴"
                    },
                    {
                      src: "https://www.thesportsdb.com/images/media/league/badge/ro2wo91683355307.png/tiny",
                      alt: "UFC",
                      fallback: "🥊"
                    },
                    {
                      src: "https://www.thesportsdb.com/images/media/league/badge/qywjqy1610461035.png/tiny",
                      alt: "Champions League",
                      fallback: "🏆"
                    },
                  ].map((league, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-surface border-2 border-surface-elevated flex items-center justify-center p-1 relative">
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff1744] rounded-full z-10" />
                      <img
                        src={league.src}
                        alt={league.alt}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement
                          t.style.display = 'none'
                          t.parentElement!.querySelector('span.fallback')!.classList.remove('hidden')
                        }}
                      />
                      <span className="fallback hidden text-lg absolute">
                        {league.fallback}
                      </span>
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Top Events Ongoing</span>
              </div>
            </motion.div>

            <div className="mt-8 flex items-center gap-2 text-text-secondary bg-surface/50 border border-border/50 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="flex text-yellow-400">
                ★★★★★
              </div>
              <span className="text-sm font-medium">Used by sports fans across the UK & Europe</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
