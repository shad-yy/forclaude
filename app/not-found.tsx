"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function NotFound() {
  useEffect(() => {
    // Track 404 errors for analytics
    if (typeof window !== "undefined") {
      console.log("404 Error:", window.location.pathname)
      // In production, you would send this to your analytics service
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-surface border-border text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-live-red/10 rounded-full p-4 w-24 h-24 flex items-center justify-center border-[3px] border-live-red/20 mb-4 shadow-[0_0_15px_rgba(255,23,68,0.2)]">
            <span className="text-5xl font-black text-live-red">404</span>
          </div>
          <CardTitle className="text-2xl text-text-primary mb-2 font-bold tracking-tight">Page Not Found</CardTitle>
          <p className="text-gray-400">Sorry, we couldn't find the page you're looking for.</p>
          <p className="text-sm text-gray-500 mt-2">
            The page may have been moved, deleted, or you may have mistyped the URL.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="flex-1 bg-accent-primary text-black hover:bg-accent-primary/90 font-bold">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="flex-1 border-border text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-400 mb-3">Or try searching for what you need:</p>
            <Button
              asChild
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <Link href="/search">
                <Search className="w-4 h-4 mr-2" />
                Search Sports Content
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-text-muted mb-3">Popular sections:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button asChild variant="ghost" size="sm" className="text-accent-primary hover:text-white hover:bg-accent-primary/20">
                <Link href="/#fixtures">Tonight's Matches</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-accent-primary hover:text-white hover:bg-accent-primary/20">
                <Link href="/news">Sports News</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-accent-primary hover:text-white hover:bg-accent-primary/20">
                <Link href="/watch/premier-league">Watch Live</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-accent-primary hover:text-white hover:bg-accent-primary/20">
                <Link href="/ufc">UFC</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div >
  )
}
