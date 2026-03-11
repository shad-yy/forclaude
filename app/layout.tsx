import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { cn } from "@/lib/utils"

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://smart-live-tv.vercel.app"),
  title: {
    default: "Smart Live TV - Watch Sports Live",
    template: "%s | SmartLiveTV - Watch Sports Live",
  },
  description:
    "Watch Premier League, La Liga, Champions League, UFC and more live. Stream all sports on any device with our IPTV service.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SmartLiveTV",
    title: "Smart Live TV - Watch Sports Live",
    description: "Watch Premier League, La Liga, Champions League, UFC and more live. Stream all sports on any device with our IPTV service.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Live TV - Watch Sports Live",
    description: "Watch Premier League, La Liga, Champions League, UFC and more live. Stream all sports on any device with our IPTV service.",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://smart-live-tv.vercel.app",
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

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      {/* ... head ... */}
      <body className={cn(inter.className, "bg-gray-950 text-gray-100 antialiased")}>
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
