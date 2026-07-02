import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { cn } from "@/lib/utils"
import { ENV } from "@/lib/config/env"
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics"
import { WebVitals } from "@/components/analytics/WebVitals"
import { CookieBanner } from "@/components/consent/CookieBanner"
import { WhatsAppFloat } from "@/components/chat/WhatsAppFloat"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://smartlivetv.co.uk'),
  title: {
    default: "Smart Live TV",
    template: "%s",
  },
  description:
    "Smart Live TV — UK IPTV for live sports, Netflix, Sky Sports & 230,000+ channels. Free 24-hour trial from £12/month.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "SmartLiveTV",
    title: "Smart Live TV — Official UK IPTV Site",
    description:
      "Smart Live TV — UK IPTV replacing Netflix, Sky Sports & Disney+ from £12/month. Free 24-hour trial.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Smart Live TV",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@smartlivetv',
    title: 'Smart Live TV — Official UK IPTV | Free 24h Trial from £12/mo',
    description: 'Smart Live TV UK IPTV — Netflix, Sky Sports & Disney+ replaced from £12/month. Free 24-hour trial.',
    images: ['/og-default.png'],
  },
  alternates: {
    canonical: ENV.BASE_URL,
    languages: {
      "en-GB": ENV.BASE_URL,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

import { SportThemeProvider } from "@/components/sport-theme-provider"
import { ThemeProvider } from 'next-themes'

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="preconnect" href="https://www.thesportsdb.com" />
        <link rel="dns-prefetch" href="https://www.thesportsdb.com" />
        <link rel="preconnect" href="https://r2.thesportsdb.com" />
        <link rel="dns-prefetch" href="https://r2.thesportsdb.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://smartlivetv.co.uk/#organization",
              name: "Smart Live TV",
              url: "https://smartlivetv.co.uk",
              logo: {
                "@type": "ImageObject",
                url: "https://smartlivetv.co.uk/favicon.svg",
              },
              description:
                "UK IPTV streaming service with 230,000+ channels including Sky Sports, TNT Sports, Netflix, and Disney+ from £12/month.",
              foundingDate: "2024",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: ["English", "Arabic"],
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://smartlivetv.co.uk/#website",
              name: "Smart Live TV",
              url: "https://smartlivetv.co.uk",
              publisher: { "@id": "https://smartlivetv.co.uk/#organization" },
              inLanguage: "en-GB",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://smartlivetv.co.uk/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BroadcastService",
              broadcastDisplayName: "Smart Live TV",
              broadcastTimezone: "Europe/London",
              broadcaster: {
                "@id": "https://smartlivetv.co.uk/#organization",
              },
              area: {
                "@type": "Country",
                name: "United Kingdom",
              },
              broadcastFrequency: "Internet streaming",
            }),
          }}
        />
      </head>
      <body className={cn(inter.className, "antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
        <SportThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Skip to main content
          </a>

          <div className="flex flex-col min-h-screen transition-colors duration-500">
            <Header />
            <main id="main-content" className="flex-grow" tabIndex={-1}>
              {children}
            </main>
            <Footer />
          </div>
        </SportThemeProvider>
        </ThemeProvider>

        <GoogleAnalytics measurementId={ENV.GA_MEASUREMENT_ID} />
        <WebVitals />
        <CookieBanner />
        <WhatsAppFloat />
      </body>
    </html>
  )
}
