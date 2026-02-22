"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SearchBar } from "./search-bar"
import { AdminToggle } from "@/components/admin/admin-toggle"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Menu, X, Home, Trophy, Users, Calendar, Newspaper, Zap, User } from "lucide-react"
import { useState, useEffect, memo, useMemo, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Scores", href: "/scores", icon: Zap },
  { name: "Leagues", href: "/leagues", icon: Trophy },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Players", href: "/players", icon: User },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "UFC", href: "/ufc", icon: Trophy },
]

export const Header = memo(function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const lastScrollY = useRef(0)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Track if we are scrolled down for background opacity
      setIsScrolled(currentScrollY > 20)

      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY.current || currentScrollY < 100) {
        setIsVisible(true)
      } else if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
        // Hide when scrolling down past 100px
        setIsVisible(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }, [isMobileMenuOpen])

  const navigationItems = useMemo(() => {
    return navigation.map((item) => {
      const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
      return { ...item, isActive }
    })
  }, [pathname])

  return (
    <>
      {/* Hover detection zone at the top */}
      <div
        className="fixed top-0 left-0 w-full h-4 z-50 bg-transparent"
        onMouseEnter={() => setIsVisible(true)}
      />

      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 z-40 w-full transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)",
          isVisible ? "translate-y-0" : "-translate-y-full",
          isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm" : "bg-transparent border-transparent"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-105">
                <OptimizedImage
                  src="/images/logo.png"
                  alt="Smart Live TV Logo"
                  width={40}
                  height={40}
                  priority
                  className="object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">Smart Live TV</span>
                <div className="text-xs text-muted-foreground font-medium">Sports Hub</div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full transition-all duration-300",
                      item.isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="hidden md:block flex-1 max-w-md mx-4">
              <SearchBar />
            </div>

            <div className="flex items-center gap-2">
              <AdminToggle />
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full hover:bg-muted/50"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="md:hidden pb-4">
            <SearchBar />
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden fixed inset-x-0 top-16 bg-background/95 backdrop-blur-xl border-b border-border/50 transition-all duration-300 ease-in-out overflow-hidden",
            isMobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 gap-3">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200",
                      item.isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      </header>
    </>
  )
})
