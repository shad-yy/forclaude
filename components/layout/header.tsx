"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown } from "lucide-react"
import { useState, useEffect, memo, useRef } from "react"
import { cn } from "@/lib/utils"

const watchLiveLinks = [
  { name: "Premier League", href: "/watch/premier-league", icon: "🏴" },
  { name: "La Liga", href: "/watch/la-liga", icon: "🇪🇸" },
  { name: "Bundesliga", href: "/watch/bundesliga", icon: "🇩🇪" },
  { name: "Serie A", href: "/watch/serie-a", icon: "🇮🇹" },
  { name: "Ligue 1", href: "/watch/ligue-1", icon: "🇫🇷" },
  { name: "Champions League", href: "/watch/champions-league", icon: "🏆" },
]

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
            ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3"
            : "bg-transparent border-transparent py-4"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* LEFT: Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-xl font-bold tracking-tight text-text-primary">
                Smart <span className="inline-flex items-center"><span className="w-2 h-2 rounded-full bg-live-red animate-pulse mr-1"></span>Live</span> TV
              </span>
            </Link>

            {/* CENTER: Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex items-center gap-1 text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors py-2">
                  Watch Live
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                </button>

                {/* Desktop Dropdown */}
                <div
                  className={cn(
                    "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border border-border bg-surface-elevated/90 backdrop-blur-xl shadow-xl transition-all duration-200 origin-top",
                    isDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                  )}
                >
                  <div className="p-2 grid gap-1">
                    {watchLiveLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                      >
                        <span className="text-base">{link.icon}</span>
                        <span className="font-medium">{link.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/news" className="text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors">News</Link>
              <Link href="/ufc" className="text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors">UFC</Link>
              <Link href="/pricing" className="text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors">Pricing</Link>
            </nav>

            {/* RIGHT: Desktop Auth / CTA */}
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/login" className="text-sm font-semibold text-text-muted hover:text-text-primary transition-colors">
                Sign In
              </Link>
              <Link
                href="/pricing"
                className="bg-accent-primary text-black font-bold text-sm px-6 py-2.5 rounded-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,230,118,0.3)]"
              >
                Watch Now →
              </Link>
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
        >
          <div className="flex flex-col h-full p-6 overflow-y-auto pb-24">
            <div className="space-y-6">
              <div>
                <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Watch Live</div>
                <div className="grid gap-2">
                  {watchLiveLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border text-text-primary hover:border-accent-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-xl">{link.icon}</span>
                      <span className="font-semibold">{link.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-col gap-4">
                <Link href="/news" className="text-lg font-bold text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>News</Link>
                <Link href="/ufc" className="text-lg font-bold text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>UFC</Link>
                <Link href="/pricing" className="text-lg font-bold text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <Link
                href="/pricing"
                className="w-full flex justify-center bg-accent-primary text-black font-bold text-base px-6 py-4 rounded-xl hover:brightness-110 mb-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Watch Now →
              </Link>
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
