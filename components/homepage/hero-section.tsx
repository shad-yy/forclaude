"use client"
import { motion, AnimatePresence } from "framer-motion"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import Link from "next/link"
import { Check } from "lucide-react"
import { LiveStats } from "@/components/homepage/LiveStats"
import { useState, useEffect, useCallback } from "react"

// Curated high-quality sports imagery from TheSportsDB league fanart
// These are fallback images — we also try to load dynamic event images
const FALLBACK_HERO_IMAGES = [
  "https://r2.thesportsdb.com/images/media/league/fanart/xwqypw1421853005.jpg",   // Premier League
  "https://r2.thesportsdb.com/images/media/league/fanart/sqqxuw1421853008.jpg",   // PL fanart 2
  "https://r2.thesportsdb.com/images/media/league/fanart/tvywrr1421853012.jpg",   // PL fanart 3
  "https://r2.thesportsdb.com/images/media/league/fanart/rrsswu1421852498.jpg",   // La Liga
  "https://r2.thesportsdb.com/images/media/league/fanart/yvsuqp1421853038.jpg",   // Champions League
]

export function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [heroImages, setHeroImages] = useState<string[]>(FALLBACK_HERO_IMAGES)
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Try to load dynamic event images from the spotlight API
  useEffect(() => {
    async function loadDynamicImages() {
      try {
        const res = await fetch('/api/spotlight')
        if (res.ok) {
          const data = await res.json()
          const dynamicImages = (data.heroImages || []).filter(Boolean)
          if (dynamicImages.length > 0) {
            setHeroImages([...dynamicImages, ...FALLBACK_HERO_IMAGES].slice(0, 6))
          }
        }
      } catch {
        // Fallback images already set
      }
    }
    loadDynamicImages()
  }, [])

  // Rotate images every 6 seconds
  useEffect(() => {
    if (heroImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroImages.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [heroImages.length])

  return (
    <section className="relative w-full min-h-[600px] md:min-h-[700px] overflow-hidden bg-[#0a0a0f] flex flex-col items-center justify-center">
      {/* ─── Dynamic Background Image Carousel ─── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <img
              src={heroImages[currentImageIndex]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onLoad={() => setImagesLoaded(true)}
              onError={(e) => {
                // Skip broken images
                const img = e.target as HTMLImageElement
                img.style.display = 'none'
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark gradient overlays — ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/95 via-[#0a0a0f]/80 to-[#0a0a0f]/60 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/80 via-transparent to-transparent z-[1]" />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 z-[2]" />

        {/* Animated ambient glow particles */}
        <div className="absolute top-[20%] left-[10%] w-32 h-32 bg-[#00e676]/15 rounded-full blur-[60px] animate-pulse-slow z-[2]" />
        <div className="absolute bottom-[30%] right-[10%] w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] animate-pulse-slow z-[2]" style={{ animationDelay: '1s' }} />
      </div>

      {/* ─── Content ─── */}
      <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-7xl pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">

          {/* LEFT COLUMN (60%) */}
          <div className="flex-1 lg:max-w-[60%] flex flex-col items-start text-left space-y-8">
            <div
              className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-[#00e676]/30 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff1744] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff1744]" />
              </span>
              <span className="text-white/90">Replaces £120+/month in streaming subscriptions</span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] drop-shadow-lg hero-speakable"
            >
              Replace Netflix, Sky Sports & Disney+ <br />
              <span className="text-[#00e676]">With One £12 Subscription</span>
            </h1>

            <p
              className="text-lg md:text-xl text-gray-300 max-w-xl font-normal leading-relaxed"
            >
              Watch every Premier League match, Champions League, UFC, Formula 1, NBA — plus Netflix, Disney+, Amazon Prime, Hulu, Shahid and every streaming service. One subscription. All devices. Cancel anytime.
            </p>

            <div
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
            </div>

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
              className="pt-2 w-full flex flex-wrap items-center gap-x-4 gap-y-3 text-sm lg:text-base text-gray-400 font-semibold"
            >
              <span className="flex items-center gap-1.5 text-gray-300"><Check className="w-4 h-4 text-[#00e676]" strokeWidth={3} /> Sky Sports Included</span>
              <span className="hidden sm:inline text-gray-600">|</span>
              <span className="flex items-center gap-1.5 text-gray-300"><Check className="w-4 h-4 text-[#00e676]" strokeWidth={3} /> Netflix & Disney+ Included</span>
              <span className="hidden sm:inline text-gray-600">|</span>
              <span className="flex items-center gap-1.5 text-gray-300"><Check className="w-4 h-4 text-[#00e676]" strokeWidth={3} /> 4K Quality</span>
              <span className="hidden lg:inline text-gray-600">|</span>
              <span className="flex items-center gap-1.5 text-gray-300"><Check className="w-4 h-4 text-[#00e676]" strokeWidth={3} /> All Devices</span>
              <span className="hidden sm:inline text-gray-600">|</span>
              <span className="flex items-center gap-1.5 text-gray-300"><Check className="w-4 h-4 text-[#00e676]" strokeWidth={3} /> Cancel Anytime</span>
            </motion.div>
          </div>

          {/* RIGHT COLUMN (40%) */}
          <div className="w-full lg:w-[40%] flex flex-col items-center lg:items-end">
            <motion.div
              initial={{ opacity: 0, x: 20, rotate: -2 }}
              animate={{ opacity: 1, x: 0, rotate: -2 }}
              whileHover={{ rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="w-full max-w-sm bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Platform Highlights</span>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff1744] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff1744]" />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { value: '£109', label: 'Monthly Saving vs Sky + Netflix' },
                  { value: '4K', label: 'Ultra HD Quality' },
                  { value: '∞', label: 'Netflix, Disney+, Shahid & more' },
                  { value: '24H', label: 'Free Trial — No Card' },
                ].map(stat => (
                  <div key={stat.value} className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="text-2xl font-black text-[#00e676] leading-none">{stat.value}</div>
                    <div className="text-[11px] text-gray-500 font-medium mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                <div className="flex -space-x-2">
                  {[
                    { src: '/leagues/premier-league.png', alt: 'Premier League' },
                    { src: '/leagues/ufc.png', alt: 'UFC' },
                    { src: '/leagues/champions-league.png', alt: 'Champions League' },
                  ].map((league, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-[#1a1a24] border-2 border-black/50 flex items-center justify-center p-1.5 relative flex-shrink-0">
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
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Live on Smart Live TV
                </span>
              </div>
            </motion.div>

            <div className="mt-8 flex items-center gap-3 bg-black/30 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-sm text-gray-400">
              <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
              <span>
                Free 24H Trial · No Card · Works Worldwide
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Image rotation indicators */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
          {heroImages.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImageIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === currentImageIndex % heroImages.length
                  ? 'bg-[#00e676] w-4'
                  : 'bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Show image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
