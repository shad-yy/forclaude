import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { cn } from "@/lib/utils"
import { ENV } from "@/lib/config/env"

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
  metadataBase: new URL(ENV.BASE_URL),
  title: {
    default: "Smart Live TV",
    template: "%s | Smart Live TV",
  },
  description:
    "Watch Premier League, La Liga, Champions League, UFC and more live. Stream all sports on any device with our IPTV service.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "SmartLiveTV",
    title: "Smart Live TV - Watch Sports Live",
    description: "Watch Premier League, La Liga, Champions League, UFC and more live. Stream all sports on any device with our IPTV service.",
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
    card: "summary_large_image",
    site: "@smartlivetv",
    title: "Smart Live TV - Watch Sports Live",
    description: "Watch Premier League, La Liga, Champions League, UFC and more live. Stream all sports on any device with our IPTV service.",
    images: ["/og-default.png"],
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
      {/* ... head ... */}
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

        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Basic performance monitoring
              if ('performance' in window && 'PerformanceObserver' in window) {
                try {
                  const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      if (entry.entryType === 'navigation') {
                        console.log('Page Load Time:', entry.loadEventEnd - entry.loadEventStart, 'ms');
                      }
                    }
                  });
                  observer.observe({ entryTypes: ['navigation'] });
                } catch (e) {
                  // Silently fail if not supported
                }
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
