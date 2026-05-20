"use client"

import Link from "next/link"
import { memo } from "react"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { motion } from "framer-motion"

const footerLinks = [
  {
    title: "Leagues",
    links: [
      { name: "Premier League", href: "/watch/premier-league" },
      { name: "La Liga", href: "/watch/la-liga" },
      { name: "Bundesliga", href: "/watch/bundesliga" },
      { name: "Serie A", href: "/watch/serie-a" },
      { name: "Ligue 1", href: "/watch/ligue-1" },
    ],
  },
  {
    title: "Setup Guides",
    links: [
      { name: "Firestick", href: "/setup/firestick" },
      { name: "Smart TV", href: "/setup/smart-tv" },
      { name: "Android", href: "/setup/android" },
      { name: "iPhone", href: "/setup/iphone" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "Pricing", href: "/pricing" },
      { name: 'About Us', href: '/about' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  },
]

export const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8 transition-colors duration-500 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          <div className="space-y-6 md:col-span-2">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.svg"
                alt="Smart Live TV"
                width={180}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-text-secondary leading-relaxed max-w-sm">
              Stream all sports on any device with our premium IPTV service. No blackouts, no cable required.
            </p>
            <div className="flex space-x-4">
              {/* Social icons — enable when accounts are created
              {[
                { 
                  Icon: Facebook, 
                  href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
                  label: 'Facebook'
                },
                { 
                  Icon: Twitter, 
                  href: process.env.NEXT_PUBLIC_SOCIAL_TWITTER,
                  label: 'Twitter / X'
                },
                { 
                  Icon: Instagram, 
                  href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
                  label: 'Instagram'
                },
                { 
                  Icon: Youtube, 
                  href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
                  label: 'YouTube'
                },
              ].filter(s => s.href).map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-text-muted hover:text-[#00e676] hover:bg-surface border border-border transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
              */}
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-text-primary mb-6 text-lg">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-text-secondary hover:text-accent-primary transition-colors duration-200 block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-text-muted">
          <p>&copy; {currentYear} SmartLiveTV. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-text-primary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
})
