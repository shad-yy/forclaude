"use client"
import { useState } from "react"
import Link from "next/link"
import { Wifi, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react"

type SpeedResult = {
  mbps: number
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  message: string
  color: string
}

function getQuality(mbps: number): SpeedResult {
  if (mbps >= 50) return {
    mbps,
    quality: 'excellent',
    message: `${mbps} Mbps — Perfect for 4K on multiple screens`,
    color: '#00e676',
  }
  if (mbps >= 25) return {
    mbps,
    quality: 'good',
    message: `${mbps} Mbps — Great for 4K streaming`,
    color: '#00e676',
  }
  if (mbps >= 10) return {
    mbps,
    quality: 'fair',
    message: `${mbps} Mbps — Good for HD streaming`,
    color: '#f59e0b',
  }
  if (mbps >= 5) return {
    mbps,
    quality: 'fair',
    message: `${mbps} Mbps — Suitable for SD streaming. Wired connection recommended for HD.`,
    color: '#f59e0b',
  }
  return {
    mbps,
    quality: 'poor',
    message: `${mbps} Mbps — May experience buffering. Contact your ISP to upgrade before subscribing.`,
    color: '#ff1744',
  }
}

export function SpeedChecker() {
  const [status, setStatus] = useState<
    'idle' | 'testing' | 'done' | 'error'
  >('idle')
  const [result, setResult] = useState<SpeedResult | null>(null)

  const runTest = async () => {
    setStatus('testing')
    setResult(null)

    // Method 1: navigator.connection (Chrome/Android)
    const conn = (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection

    if (conn?.downlink && conn.downlink > 0) {
      // downlink is in Mbps
      const mbps = Math.round(conn.downlink)
      setResult(getQuality(mbps))
      setStatus('done')
      return
    }

    // Method 2: Fetch own API route with timing
    // This avoids CORS and CDN caching issues
    try {
      const iterations = 3
      const times: number[] = []

      for (let i = 0; i < iterations; i++) {
        const start = performance.now()
        // Fetch a known-size response from our own server
        // Adding timestamp prevents caching
        await fetch(
          `/api/speed-test?t=${Date.now()}&i=${i}`,
          { cache: 'no-store' }
        )
        const end = performance.now()
        times.push(end - start)
      }

      // Remove fastest (likely cached) and average the rest
      times.sort((a, b) => a - b)
      const avgMs = times.slice(1).reduce(
        (a, b) => a + b, 0
      ) / (times.length - 1)

      // Our test payload is ~50KB
      // Speed (Mbps) = (50 * 8) / (avgMs / 1000) / 1000
      const fileSizeKb = 50
      const mbps = Math.round(
        (fileSizeKb * 8) / (avgMs / 1000) / 1000
      )

      const cappedMbps = Math.min(Math.max(mbps, 1), 500)
      setResult(getQuality(cappedMbps))
      setStatus('done')
    } catch {
      // Method 3: Graceful fallback
      setStatus('done')
      setResult({
        mbps: 0,
        quality: 'fair' as const,
        message: 'Could not measure automatically. UK average is 79 Mbps — most connections support 4K.',
        color: '#f59e0b',
      })
    }
  }

  return (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center">
          <Wifi className="w-5 h-5 text-[#00e676]" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">
            Is your connection fast enough?
          </h3>
          <p className="text-gray-500 text-xs">
            HD needs 10 Mbps · 4K needs 25 Mbps
          </p>
        </div>
      </div>

      {status === 'idle' && (
        <button
          onClick={runTest}
          className="w-full bg-[#00e676] text-black font-bold py-3 rounded-xl text-sm hover:bg-[#00ff87] transition-all touch-manipulation cursor-pointer"
        >
          Test My Connection Speed →
        </button>
      )}

      {status === 'testing' && (
        <div className="text-center py-4">
          <div className="w-8 h-8 border-2 border-[#00e676] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            Testing your connection…
          </p>
        </div>
      )}

      {status === 'done' && result && (
        <div className="space-y-3">
          {/* Speed readout */}
          <div className="bg-[#0a0a0f] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Your speed</span>
              <span
                className="font-extrabold text-xl"
                style={{ color: result.color }}
              >
                {result.mbps} Mbps
              </span>
            </div>
            {/* Visual bar */}
            <div className="h-2 bg-[#2a2a3a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((result.mbps / 100) * 100, 100)}%`,
                  backgroundColor: result.color,
                }}
              />
            </div>
          </div>

          {/* Quality message */}
          <div className="flex items-start gap-2.5">
            {result.quality === 'poor' ? (
              <AlertTriangle className="w-4 h-4 text-[#ff1744] mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-[#00e676] mt-0.5 flex-shrink-0" />
            )}
            <p className="text-sm" style={{ color: result.color }}>
              {result.message}
            </p>
          </div>

          {/* CTA if connection is good enough */}
          {result.quality !== 'poor' && (
            <Link
              href="/buy"
              className="block w-full text-center bg-[#00e676] text-black font-bold py-3 rounded-xl text-sm mt-2 hover:bg-[#00ff87] transition-all"
            >
              Your Connection Is Ready — Get Access →
            </Link>
          )}

          <button
            onClick={runTest}
            className="w-full text-center text-xs text-gray-600 hover:text-gray-400 py-1 transition-colors cursor-pointer"
          >
            Test again
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-2">
          <p className="text-gray-400 text-sm mb-3">
            Could not measure your speed automatically.
            <br />
            Most UK home broadband (79 Mbps average) easily supports 4K streaming.
          </p>
          <Link
            href="/buy"
            className="block w-full text-center bg-[#00e676] text-black font-bold py-3 rounded-xl text-sm hover:bg-[#00ff87] transition-all"
          >
            Get Access Now →
          </Link>
        </div>
      )}
    </div>
  )
}
