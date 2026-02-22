import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: "Smart Live TV - Your Ultimate Sports Hub",
    template: "%s | Smart Live TV",
  },
  description:
    "Live scores, breaking news, and in-depth analysis for every sports fan. Never miss a moment with Smart Live TV.",
  keywords: [
    "sports",
    "live scores",
    "football",
    "soccer",
    "UFC",
    "news",
    "teams",
    "players",
    "leagues",
    "fixtures",
    "results",
  ],
  authors: [{ name: "Smart Live TV Team" }],
  creator: "Smart Live TV",
  publisher: "Smart Live TV",
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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Smart Live TV - Your Ultimate Sports Hub",
    description:
      "Live scores, breaking news, and in-depth analysis for every sports fan. Never miss a moment with Smart Live TV.",
    url: "https://smart-live-tv.vercel.app",
    siteName: "Smart Live TV",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Smart Live TV - Your Ultimate Sports Hub",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Live TV - Your Ultimate Sports Hub",
    description: "Live scores, breaking news, and in-depth analysis for every sports fan.",
    images: ["/images/twitter-card.png"],
    creator: "@SmartLiveTV",
    site: "@SmartLiveTV",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
    other: {
      "msvalidate.01": "your-bing-verification-code",
    },
  },
  alternates: {
    canonical: "https://smart-live-tv.vercel.app",
  },
  generator: 'v0.app'
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
          <Toaster />
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
