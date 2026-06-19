import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // 100KB payload for meaningful throughput measurement
  // Using varied content to prevent compression from
  // making the measurement meaningless
  const BASE = 'SmartLiveTV-speed-test-payload-'
  const payload = Array.from(
    { length: 100 },
    (_, i) => `${BASE}${i}-${Math.random().toString(36)}-${'x'.repeat(900)}`
  ).join('\n')

  return new NextResponse(payload, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
    },
  })
}
