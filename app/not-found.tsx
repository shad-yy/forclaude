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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-gray-900 border-gray-800 text-center">
        <CardHeader>
          <div className="mx-auto bg-red-500/10 rounded-full p-4 w-24 h-24 flex items-center justify-center border-2 border-red-500/20 mb-4">
            <span className="text-5xl font-bold text-red-400">404</span>
          </div>
          <CardTitle className="text-2xl text-white mb-2">Page Not Found</CardTitle>
          <p className="text-gray-400">Sorry, we couldn't find the page you're looking for.</p>
          <p className="text-sm text-gray-500 mt-2">
            The page may have been moved, deleted, or you may have mistyped the URL.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
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

          <div className="pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-400 mb-3">Popular sections:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button asChild variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                <Link href="/scores">Live Scores</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                <Link href="/news">Sports News</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                <Link href="/leagues">Leagues</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                <Link href="/ufc">UFC</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
