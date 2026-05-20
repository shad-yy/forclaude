"use client"
import { motion } from "framer-motion"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import Link from "next/link"
import { Check } from "lucide-react"
import { LEAGUES } from "@/lib/constants/leagues"
import { LeagueBadge } from "@/components/league/league-badge"
import { LiveStats } from "@/components/homepage/LiveStats"

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
              <span className="text-text-primary">Replaces £120+/month in streaming subscriptions</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Replace Netflix, Sky Sports & Disney+ <br />
              <span className="text-accent-primary">With One £12 Subscription</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary max-w-xl font-normal leading-relaxed"
            >
              Watch every Premier League match, Champions League, UFC, Formula 1, NBA — plus Netflix, Disney+, Amazon Prime, Hulu, Shahid and every streaming service. One subscription. All devices. Cancel anytime.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2"
            >
              <ShimmerButton href="/buy" variant="primary"
                className="w-full sm:w-auto px-8 py-4 text-lg rounded-lg">
                Get Instant Access →
              </ShimmerButton>
              <ShimmerButton href="/free-trial" variant="ghost"
                className="w-full sm:w-auto px-8 py-4 text-lg rounded-lg">
                Try Free for 24H ↓
              </ShimmerButton>
            </motion.div>

            {/* Live Stats Ticker */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="w-full"
            >
              <LiveStats />
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="pt-2 w-full flex flex-wrap items-center gap-x-4 gap-y-3 text-sm lg:text-base text-text-muted font-semibold"
            >
              <span className="flex items-center gap-1.5 text-text-secondary"><Check className="w-4 h-4 text-accent-primary" strokeWidth={3} /> Sky Sports Included</span>
              <span className="hidden sm:inline text-border">|</span>
              <span className="flex items-center gap-1.5 text-text-secondary"><Check className="w-4 h-4 text-accent-primary" strokeWidth={3} /> Netflix & Disney+ Included</span>
              <span className="hidden sm:inline text-border">|</span>
              <span className="flex items-center gap-1.5 text-text-secondary"><Check className="w-4 h-4 text-accent-primary" strokeWidth={3} /> 4K Quality</span>
              <span className="hidden lg:inline text-border">|</span>
              <span className="flex items-center gap-1.5 text-text-secondary"><Check className="w-4 h-4 text-accent-primary" strokeWidth={3} /> All Devices</span>
              <span className="hidden sm:inline text-border">|</span>
              <span className="flex items-center gap-1.5 text-text-secondary"><Check className="w-4 h-4 text-accent-primary" strokeWidth={3} /> Cancel Anytime</span>
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
                {[
                  { value: '£109', label: 'Monthly Saving vs Sky + Netflix' },
                  { value: '4K', label: 'Ultra HD Quality' },
                  { value: '∞', label: 'Netflix, Disney+, Shahid & more' },
                  { value: '24H', label: 'Free Trial — No Card' },
                ].map(stat => (
                  <div key={stat.value} className="bg-surface rounded-lg p-3 border border-border/50">
                    <div className="text-2xl font-black text-accent-primary leading-none">{stat.value}</div>
                    <div className="text-[11px] text-text-muted font-medium mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 border-t border-border pt-4">
                <div className="flex -space-x-2">
                  {[
                    { src: '/leagues/premier-league.png', alt: 'Premier League' },
                    { src: '/leagues/ufc.png', alt: 'UFC' },
                    { src: '/leagues/champions-league.png', alt: 'Champions League' },
                  ].map((league, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-surface border-2 border-surface-elevated flex items-center justify-center p-1.5 relative flex-shrink-0">
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff1744] rounded-full border-2 border-[#0a0a0f] z-10" />
                      <img
                        src={league.src}
                        alt={league.alt}
                        width={28}
                        height={28}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Live on Smart Live TV
                </span>
              </div>
            </motion.div>

            <div className="mt-8 flex items-center gap-3 bg-surface/50 border border-border/50 px-4 py-2 rounded-full backdrop-blur-sm text-sm text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
              <span>
                Free 24H Trial · No Card · Works Worldwide
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
