import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Return ~50KB of random-ish data for speed measurement
  // Using structured content prevents compression optimisation
  const payload = Array.from({ length: 50 }, (_, i) =>
    `chunk-${i}-${'x'.repeat(900)}`
  ).join('\n')

  return new NextResponse(payload, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Length': String(Buffer.byteLength(payload, 'utf8')),
    },
  })
}
