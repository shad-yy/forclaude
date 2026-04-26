"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown, Heart } from "lucide-react"
import { useState, useEffect, memo, useRef } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ShimmerButton } from "@/components/ui/shimmer-button"

import { CommandPalette } from "@/components/search/command-palette"

const WATCH_LINKS = {
  football: [
    {
      name: "Premier League",
      href: "/watch/premier-league",
      badge: "https://www.thesportsdb.com/images/media/league/badge/i6o0kh1549879062.png",
      desc: "English top flight"
    },
    {
      name: "La Liga",
      href: "/watch/la-liga",
      badge: "https://www.thesportsdb.com/images/media/league/badge/qphamq1575285108.png",
      desc: "Spanish football"
    },
    {
      name: "Bundesliga",
      href: "/watch/bundesliga",
      badge: "https://www.thesportsdb.com/images/media/league/badge/0j9mq11549630092.png",
      desc: "German football"
    },
    {
      name: "Serie A",
      href: "/watch/serie-a",
      badge: "https://www.thesportsdb.com/images/media/league/badge/dupte51529670364.png",
      desc: "Italian football"
    },
    {
      name: "Ligue 1",
      href: "/watch/ligue-1",
      badge: "https://www.thesportsdb.com/images/media/league/badge/mekpox1549629429.png",
      desc: "French football"
    },
    {
      name: "Champions League",
      href: "/watch/champions-league",
      badge: "https://www.thesportsdb.com/images/media/league/badge/qywjqy1610461035.png",
      desc: "Europe's elite cup"
    },
    {
      name: "Europa League",
      href: "/watch/europa-league",
      badge: "https://www.thesportsdb.com/images/media/league/badge/9pmsij1527785881.png",
      desc: "UEFA second tier"
    },
    {
      name: "World Cup 2026",
      href: "/watch/world-cup-2026",
      badge: "https://www.thesportsdb.com/images/media/league/badge/bxh0ky1549630504.png",
      desc: "Live now • USA/CAN/MEX"
    },
  ],
  more: [
    {
      name: "Formula 1",
      href: "/watch/formula-1",
      badge: "https://www.thesportsdb.com/images/media/league/badge/7onmyv1587591215.png",
      desc: "Every race live"
    },
    {
      name: "UFC / MMA",
      href: "/ufc",
      badge: "https://www.thesportsdb.com/images/media/league/badge/ro2wo91683355307.png",
      desc: "Fight nights live"
    },
  ]
}

export const Header = memo(function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  let dropdownTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsDropdownOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleMouseEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    setIsDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setIsDropdownOpen(false)
    }, 150) // slight delay to make it feel natural
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          isScrolled
            ? "bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#2a2a3a]/60 shadow-[0_1px_0_0_rgba(255,255,255,0.04)] py-3"
            : "bg-transparent border-transparent py-4"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* LEFT: Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.span
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="text-xl font-bold tracking-tight text-text-primary"
              >
                Smart <span className="inline-flex items-center">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-[#ff1744] mr-1"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  Live
                </span> TV
              </motion.span>
            </Link>

            {/* CENTER: Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <motion.button
                  className="flex items-center gap-2 text-sm font-semibold
                    text-gray-300 hover:text-white transition-colors py-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-[#ff1744] flex-shrink-0"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  Watch Live
                  <motion.span
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" 
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </motion.span>
                </motion.button>

                {/* Desktop Dropdown */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3
                        w-[500px] rounded-2xl border border-[#2a2a3a]
                        bg-[#0d0d14] shadow-[0_16px_48px_rgba(0,0,0,0.6)]
                        overflow-hidden z-50"
                      style={{ willChange: 'transform, opacity' }}
                    >
                      {/* Header band */}
                      <div className="px-5 py-3 border-b border-[#2a2a3a] 
                        flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-500 
                          uppercase tracking-widest">
                          Live Sports
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full 
                            bg-[#ff1744] animate-ping inline-block" />
                          <span className="text-[11px] font-semibold text-[#ff1744]">
                            LIVE
                          </span>
                        </span>
                      </div>

                      <div className="p-3">
                        {/* Football section label */}
                        <p className="text-[10px] font-bold text-gray-600 
                          uppercase tracking-widest px-2 mb-2">
                          Football
                        </p>

                        {/* Football grid — 2 columns */}
                        <div className="grid grid-cols-2 gap-1 mb-3">
                          {WATCH_LINKS.football.map((link, i) => (
                            <motion.div
                              key={link.name}
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03, duration: 0.18 }}
                            >
                              <Link
                                href={link.href}
                                className="flex items-center gap-3 px-3 py-2.5 
                                  rounded-xl hover:bg-white/5 transition-colors group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-[#12121a] 
                                  border border-[#2a2a3a] flex items-center 
                                  justify-center flex-shrink-0 overflow-hidden
                                  group-hover:border-[#00e676]/30 transition-colors">
                                  <img
                                    src={link.badge}
                                    alt={link.name}
                                    className="w-5 h-5 object-contain"
                                    onError={(e) => {
                                      const t = e.target as HTMLImageElement
                                      t.style.display = 'none'
                                    }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-200 
                                    group-hover:text-white transition-colors 
                                    truncate leading-tight">
                                    {link.name}
                                  </p>
                                  <p className="text-[11px] text-gray-600 
                                    group-hover:text-gray-400 transition-colors 
                                    leading-tight">
                                    {link.desc}
                                  </p>
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-[#2a2a3a] mx-2 mb-3" />

                        {/* More sports */}
                        <p className="text-[10px] font-bold text-gray-600 
                          uppercase tracking-widest px-2 mb-2">
                          More Sports
                        </p>
                        <div className="grid grid-cols-2 gap-1 mb-3">
                          {WATCH_LINKS.more.map((link, i) => (
                            <Link
                              key={link.name}
                              href={link.href}
                              className="flex items-center gap-3 px-3 py-2.5 
                                rounded-xl hover:bg-white/5 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#12121a] 
                                border border-[#2a2a3a] flex items-center 
                                justify-center flex-shrink-0 overflow-hidden
                                group-hover:border-[#00e676]/30 transition-colors">
                                <img
                                  src={link.badge}
                                  alt={link.name}
                                  className="w-5 h-5 object-contain"
                                  onError={(e) => {
                                    const t = e.target as HTMLImageElement
                                    t.style.display = 'none'
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-200 
                                  group-hover:text-white transition-colors truncate">
                                  {link.name}
                                </p>
                                <p className="text-[11px] text-gray-600 
                                  group-hover:text-gray-400 transition-colors">
                                  {link.desc}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Footer CTA */}
                        <div className="px-2 pt-2 border-t border-[#2a2a3a]">
                          <Link
                            href="/free-trial"
                            className="flex items-center justify-between w-full 
                              px-4 py-3 bg-[#00e676]/10 hover:bg-[#00e676]/20 
                              border border-[#00e676]/20 hover:border-[#00e676]/40 
                              rounded-xl transition-all group"
                          >
                            <span className="text-sm font-bold text-[#00e676]">
                              Get free 24-hour access to all channels
                            </span>
                            <span className="text-[#00e676] text-sm 
                              group-hover:translate-x-1 transition-transform">
                              →
                            </span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/news" className="text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors">News</Link>
              <Link href="/channels" className="text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors">Channels</Link>
              <Link href="/blog" className="text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors">Blog</Link>
              <Link href="/ufc" className="text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors">UFC</Link>
              <Link href="/pricing" className="text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors">Pricing</Link>
            </nav>

            {/* RIGHT: Desktop Auth / CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <CommandPalette />
              <Link href="/favorites" className="p-2 rounded-lg text-text-muted hover:text-red-400 transition-colors" aria-label="Favorites">
                <Heart className="w-4 h-4" />
              </Link>

              <Link href="/login" className="text-sm font-semibold text-text-muted hover:text-text-primary transition-colors">
                Sign In
              </Link>
              <ShimmerButton href="/free-trial" className="text-sm px-6 py-2.5">
                Free Trial →
              </ShimmerButton>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-text-primary hover:text-accent-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <div
          className={cn(
            "lg:hidden fixed inset-0 top-[60px] bg-background/95 backdrop-blur-xl z-40 transition-all duration-300 ease-in-out border-t border-border",
            isMobileMenuOpen ? "opacity-100 visible h-[calc(100vh-60px)]" : "opacity-0 invisible h-0"
          )}
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          <div className="flex flex-col h-full p-6 overflow-y-auto pb-24">
            <div className="space-y-6">
              <div>
                <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Watch Live</div>
                <div className="grid gap-2">
                  {[...WATCH_LINKS.football, ...WATCH_LINKS.more].map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="flex items-center gap-3 py-3.5 px-3 touch-manipulation rounded-lg bg-surface border border-border text-text-primary hover:border-accent-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#12121a] border 
                        border-[#2a2a3a] flex items-center justify-center 
                        flex-shrink-0">
                        <img
                          src={link.badge}
                          alt={link.name}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement
                            t.style.display = 'none'
                          }}
                        />
                      </div>
                      <span className="font-semibold">{link.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-col gap-2">
                <Link href="/favorites" className="py-3.5 touch-manipulation active:bg-white/5 text-lg font-bold text-text-primary flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}><Heart className="w-4 h-4 text-red-400" /> Favorites</Link>
                <Link href="/news" className="py-3.5 touch-manipulation active:bg-white/5 text-lg font-bold text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>News</Link>
                <Link href="/channels" className="py-3.5 touch-manipulation active:bg-white/5 text-lg font-bold text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>Channels</Link>
                <Link href="/blog" className="py-3.5 touch-manipulation active:bg-white/5 text-lg font-bold text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                <Link href="/ufc" className="py-3.5 touch-manipulation active:bg-white/5 text-lg font-bold text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>UFC</Link>
                <Link href="/pricing" className="py-3.5 touch-manipulation active:bg-white/5 text-lg font-bold text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
                <Link href="/about" className="py-3.5 touch-manipulation active:bg-white/5 text-lg font-bold text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                <Link href="/contact" className="py-3.5 touch-manipulation active:bg-white/5 text-lg font-bold text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
                <div className="pt-2 flex items-center gap-2">
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <div onClick={() => setIsMobileMenuOpen(false)} className="mb-4">
                <ShimmerButton
                  href="/free-trial"
                  variant="primary"
                  className="w-full justify-center py-4 rounded-xl text-base"
                >
                  Free Trial →
                </ShimmerButton>
              </div>
              <Link
                href="/login"
                className="w-full flex justify-center text-sm font-semibold text-text-secondary py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Already have an account? Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  )
})
