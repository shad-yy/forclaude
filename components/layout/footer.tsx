"use client"

import Link from "next/link"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { memo, useState, useEffect } from "react"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

const footerLinks = [
  {
    title: "Discover",
    links: [
      { name: "Scores", href: "/scores" },
      { name: "Leagues", href: "/leagues" },
      { name: "Teams", href: "/teams" },
      { name: "Players", href: "/players" },
    ],
  },
  {
    title: "Content",
    links: [
      { name: "Events", href: "/events" },
      { name: "News", href: "/news" },
      { name: "UFC", href: "/ufc" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/info/about-us" },
      { name: "Contact Us", href: "/info/contact-us" },
      { name: "Privacy Policy", href: "/info/privacy-policy" },
      { name: "Terms of Service", href: "/info/terms-of-service" },
    ],
  },
]

export const Footer = memo(function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="bg-background border-t border-border/50 pt-16 pb-8 transition-colors duration-500">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative overflow-hidden rounded-lg">
                <OptimizedImage
                  src="/images/logo.png"
                  alt="Smart Live TV Logo"
                  width={48}
                  height={48}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <span className="text-2xl font-bold text-foreground tracking-tight">Smart Live TV</span>
                <div className="text-sm text-muted-foreground">Sports Hub</div>
              </div>
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              Your ultimate destination for live sports scores, news, and updates. Experience the game like never before.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-foreground mb-6 text-lg">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 block hover:translate-x-1 transform"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {currentYear || "2024"} Smart Live TV. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/info/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/info/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-foreground transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
})
