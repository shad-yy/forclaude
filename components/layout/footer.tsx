"use client"

import Link from "next/link"
import { memo } from "react"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { motion } from "framer-motion"

const footerLinks = [
  {
    title: "Watch Live",
    links: [
      { name: "Premier League", href: "/watch/premier-league" },
      { name: "La Liga", href: "/watch/la-liga" },
      { name: "Champions League", href: "/watch/champions-league" },
      { name: "Europa League", href: "/watch/europa-league" },
      { name: "World Cup 2026", href: "/watch/world-cup-2026" },
      { name: "Formula 1", href: "/watch/formula-1" },
      { name: "UFC / MMA", href: "/ufc" },
    ],
  },
  {
    title: "Get Started",
    links: [
      { name: "Pricing", href: "/pricing" },
      { name: "Free Trial", href: "/free-trial" },
      { name: "Buy Now", href: "/buy" },
      { name: "Channels", href: "/channels" },
      { name: "Blog", href: "/blog" },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10 mb-12">
          <div className="space-y-6 lg:col-span-2">
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

        {/* Payment Methods */}
        <div className="pt-8 border-t border-border mb-8">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 text-center">We Accept All Payment Methods</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Visa */}
            <div className="bg-white/5 border border-border rounded-lg px-3 py-2 flex items-center justify-center" title="Visa">
              <svg width="40" height="14" viewBox="0 0 40 14" fill="none"><path d="M16.3 0.5L10.7 13.5H7.1L4.3 3.2C4.1 2.5 3.9 2.2 3.3 1.9C2.4 1.4 0.9 1 0 0.7L0.1 0.5H5.8C6.5 0.5 7.1 1 7.2 1.8L8.5 8.8L12 0.5H16.3ZM28.8 9.2C28.8 5.7 23.8 5.5 23.8 3.9C23.8 3.4 24.3 2.9 25.4 2.8C25.9 2.7 27.4 2.7 29 3.4L29.7 0.9C28.8 0.6 27.7 0.3 26.3 0.3C22.2 0.3 19.4 2.4 19.4 5.4C19.4 7.6 21.4 8.8 22.9 9.5C24.5 10.3 25 10.8 25 11.5C25 12.5 23.8 12.9 22.7 12.9C20.9 12.9 19.9 12.5 19.1 12.1L18.4 14.7C19.2 15 20.7 15.4 22.3 15.4C26.7 15.4 29.3 13.3 28.8 9.2ZM38.2 13.5H34.8L35.1 12.2H31.4L30.8 13.5H26.5L31.8 1.2C32 0.7 32.5 0.5 33.1 0.5H36L38.2 13.5ZM33.3 4L31.9 9.4H34.7L33.3 4ZM17.8 13.5L21 0.5H17.2L14 13.5H17.8Z" fill="#e5e7eb"/></svg>
            </div>
            {/* Mastercard */}
            <div className="bg-white/5 border border-border rounded-lg px-3 py-2 flex items-center justify-center" title="Mastercard">
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><circle cx="11" cy="10" r="9" fill="#eb001b" opacity="0.8"/><circle cx="21" cy="10" r="9" fill="#f79e1b" opacity="0.8"/><path d="M16 3.8a9 9 0 0 1 0 12.4 9 9 0 0 1 0-12.4z" fill="#ff5f00" opacity="0.9"/></svg>
            </div>
            {/* American Express */}
            <div className="bg-white/5 border border-border rounded-lg px-3 py-2 flex items-center justify-center" title="American Express">
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><rect x="1" y="1" width="30" height="18" rx="3" fill="none" stroke="#2e77bc" strokeWidth="1.5"/><text x="16" y="12" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="800" fontSize="7" fill="#2e77bc">AMEX</text></svg>
            </div>
            {/* PayPal */}
            <div className="bg-white/5 border border-border rounded-lg px-3 py-2 flex items-center justify-center" title="PayPal">
              <svg width="36" height="16" viewBox="0 0 36 16" fill="none"><text x="0" y="12" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="10" fill="#009cde">Pay</text><text x="17" y="12" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="10" fill="#012169">Pal</text></svg>
            </div>
            {/* Apple Pay */}
            <div className="bg-white/5 border border-border rounded-lg px-3 py-2 flex items-center justify-center" title="Apple Pay">
              <svg width="40" height="16" viewBox="0 0 40 16" fill="none"><path d="M7.8 2.4C7.3 3 6.5 3.5 5.7 3.4C5.6 2.6 6 1.8 6.4 1.2C6.9 0.6 7.8 0.1 8.5 0C8.6 0.9 8.3 1.7 7.8 2.4ZM8.5 3.6C7.3 3.5 6.3 4.3 5.7 4.3C5.1 4.3 4.2 3.6 3.2 3.7C2 3.7 0.9 4.4 0.4 5.5C-0.8 7.7 0.1 11 1.3 12.8C1.8 13.7 2.5 14.7 3.4 14.6C4.3 14.6 4.7 14 5.8 14C6.9 14 7.3 14.6 8.2 14.6C9.2 14.6 9.7 13.7 10.3 12.8C10.9 11.8 11.2 10.8 11.2 10.8C11.2 10.8 9.5 10.1 9.5 8.1C9.5 6.4 10.8 5.6 10.9 5.5C10 4.2 8.6 4 8.5 3.6Z" fill="#e5e7eb"/><text x="14" y="12" fontFamily="Inter,sans-serif" fontWeight="600" fontSize="9" fill="#e5e7eb">Pay</text></svg>
            </div>
            {/* Google Pay */}
            <div className="bg-white/5 border border-border rounded-lg px-3 py-2 flex items-center justify-center" title="Google Pay">
              <svg width="40" height="16" viewBox="0 0 40 16" fill="none"><text x="0" y="12" fontFamily="Inter,sans-serif" fontWeight="600" fontSize="9" fill="#4285f4">G</text><text x="7" y="12" fontFamily="Inter,sans-serif" fontWeight="600" fontSize="9" fill="#ea4335">o</text><text x="14" y="12" fontFamily="Inter,sans-serif" fontWeight="600" fontSize="9" fill="#fbbc05">o</text><text x="21" y="12" fontFamily="Inter,sans-serif" fontWeight="600" fontSize="9" fill="#4285f4">g</text><text x="27" y="12" fontFamily="Inter,sans-serif" fontWeight="600" fontSize="9" fill="#34a853">le</text><text x="37" y="12" fontFamily="Inter,sans-serif" fontWeight="600" fontSize="9" fill="#e5e7eb"> </text></svg>
            </div>
            {/* Crypto / Bitcoin */}
            <div className="bg-white/5 border border-border rounded-lg px-3 py-2 flex items-center justify-center" title="Cryptocurrency">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="none" stroke="#f7931a" strokeWidth="1.5"/><text x="10" y="14" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="800" fontSize="11" fill="#f7931a">₿</text></svg>
            </div>
            {/* Bank Transfer */}
            <div className="bg-white/5 border border-border rounded-lg px-3 py-2 flex items-center justify-center" title="Bank Transfer">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1L2 6V8H18V6L10 1Z" fill="none" stroke="#9ca3af" strokeWidth="1.2"/><rect x="4" y="9" width="2" height="6" rx="0.5" fill="#9ca3af"/><rect x="9" y="9" width="2" height="6" rx="0.5" fill="#9ca3af"/><rect x="14" y="9" width="2" height="6" rx="0.5" fill="#9ca3af"/><rect x="2" y="16" width="16" height="2" rx="0.5" fill="#9ca3af"/></svg>
            </div>
          </div>
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
