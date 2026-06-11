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

    try {
      // Measure download speed by timing a real fetch of a known-size resource.
      // We use a public Wikimedia image (~200KB) — no API key needed.
      const testUrl =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/1200px-Camponotus_flavomarginatus_ant.jpg'

      const startTime = performance.now()
      const response = await fetch(testUrl, {
        cache: 'no-store',
        mode: 'cors',
      })
      const blob = await response.blob()
      const endTime = performance.now()

      const fileSizeInBits = blob.size * 8
      const durationInSeconds = (endTime - startTime) / 1000
      const mbps = Math.round(
        (fileSizeInBits / durationInSeconds) / 1_000_000
      )

      setResult(getQuality(Math.min(mbps, 500)))
      setStatus('done')
    } catch {
      // Fallback: use navigator.connection if available
      const conn = (navigator as any).connection
      if (conn?.downlink) {
        const mbps = Math.round(conn.downlink)
        setResult(getQuality(mbps))
        setStatus('done')
      } else {
        setStatus('error')
      }
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
