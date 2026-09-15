import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { ENV } from '@/lib/config/env'
import { createTrialAccount } from '@/lib/panel/cms8k'

export const dynamic = 'force-dynamic'

/**
 * Admin ops endpoint: runs a live trial-line provision on the panel and
 * reports the current panel env config. Was previously reachable via
 * `?secret=` or `Authorization: Bearer` matching JWT_SECRET or
 * CRON_SECRET; both bypasses were closed in A-03 because JWT_SECRET is a
 * signing secret, not an auth-by-value credential, and CRON_SECRET was
 * never intended to authorise a real cms-8k provision.
 *
 * Auth: admin-session cookie only.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin-session')?.value
  if (!token || !ENV.JWT_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized — admin session required' },
      { status: 401 },
    )
  }

  let adminSub: string | undefined
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(ENV.JWT_SECRET))
    adminSub = typeof payload.sub === 'string' ? payload.sub : undefined
  } catch {
    return NextResponse.json(
      { error: 'Unauthorized — admin session invalid or expired' },
      { status: 401 },
    )
  }

  const testName = 'DiagTest' + Math.floor(100 + Math.random() * 900)
  console.log(`[PROVISION-DIAG] admin=${adminSub ?? 'unknown'} running trial creation for ${testName}`)

  const envCheck = {
    CMS8K_API_KEY: process.env.CMS8K_API_KEY ? `present (len ${process.env.CMS8K_API_KEY.length})` : 'MISSING',
    CMS8K_USERNAME: process.env.CMS8K_USERNAME ? `present (${process.env.CMS8K_USERNAME})` : 'MISSING',
    CMS8K_PASSWORD: process.env.CMS8K_PASSWORD ? 'present' : 'MISSING',
    CMS8K_SERVER_URL: process.env.CMS8K_SERVER_URL || 'MISSING',
    CMS8K_URL: process.env.CMS8K_URL || 'https://cms-8k.com (default)',
    RESEND_API_KEY: process.env.RESEND_API_KEY ? 'present' : 'MISSING',
    UPSTASH_CONFIGURED: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  }

  try {
    const result = await createTrialAccount(testName, `Diagnostic panel test (admin=${adminSub ?? 'unknown'})`)
    return NextResponse.json(
      { timestamp: new Date().toISOString(), environment: envCheck, result },
      { status: result.success ? 200 : 500 },
    )
  } catch (err: any) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        environment: envCheck,
        error: err?.message || 'Unknown error during test',
      },
      { status: 500 },
    )
  }
}
