import { Button } from "@/components/ui/button"
import { ResponsiveImage } from "@/components/ui/responsive-image"
import Link from "next/link"
import { memo } from "react"

export const HeroSection = memo(function HeroSection() {
  return (
    <div className="relative h-[500px] rounded-xl overflow-hidden flex items-center justify-center text-center">
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70 z-10" />

      <ResponsiveImage
        src="/images/hero-sports-collage.png"
        alt="Dynamic collage of sports moments including football, basketball, soccer, and more"
        aspectRatio="video"
        priority
        quality={90}
        sizes="100vw"
        className="absolute inset-0"
      />

      <div className="relative z-20 max-w-4xl px-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
          The Ultimate Hub for
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">
            Every Sports Fan
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
          Today's matches, breaking news, and in-depth analysis. All in one place. Never miss a moment.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-8 py-3 text-lg"
          >
            <Link href="/subscribe">🚀 Subscribe Now</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg bg-transparent"
          >
            <Link href="/scores">📊 View Scores</Link>
          </Button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Today's Updates</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Latest Scores</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span>Breaking News</span>
          </div>
        </div>
      </div>
    </div>
  )
})
