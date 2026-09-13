import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { ENV } from '@/lib/config/env'
import { createTrialAccount } from '@/lib/panel/cms8k'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Security Gate: require admin-session cookie or secret query param
  const secretParam = req.nextUrl.searchParams.get('secret')
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const token = req.cookies.get('admin-session')?.value

  let isAuthorized = false

  // Check secret parameter or bearer token against JWT_SECRET or CRON_SECRET
  if (ENV.JWT_SECRET && (secretParam === ENV.JWT_SECRET || authHeader === ENV.JWT_SECRET)) {
    isAuthorized = true
  } else if (process.env.CRON_SECRET && (secretParam === process.env.CRON_SECRET || authHeader === process.env.CRON_SECRET)) {
    isAuthorized = true
  } else if (token && ENV.JWT_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(ENV.JWT_SECRET))
      isAuthorized = true
    } catch {
      isAuthorized = false
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized — valid admin session or ?secret= parameter required' },
      { status: 401 }
    )
  }

  const envCheck = {
    CMS8K_API_KEY: process.env.CMS8K_API_KEY ? 'Present (length ' + process.env.CMS8K_API_KEY.length + ')' : 'MISSING',
    CMS8K_USERNAME: process.env.CMS8K_USERNAME ? 'Present (' + process.env.CMS8K_USERNAME + ')' : 'MISSING',
    CMS8K_PASSWORD: process.env.CMS8K_PASSWORD ? 'Present' : 'MISSING',
    CMS8K_SERVER_URL: process.env.CMS8K_SERVER_URL || 'MISSING',
    CMS8K_URL: process.env.CMS8K_URL || 'https://cms-8k.com (default)',
    RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Present' : 'MISSING',
    UPSTASH_CONFIGURED: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  }

  // Run a live trial generation test
  const testName = 'DiagTest' + Math.floor(100 + Math.random() * 900)
  console.log(`[TEST-PANEL] Running test trial creation for ${testName}...`)

  try {
    const result = await createTrialAccount(testName, 'Diagnostic panel test')
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      result,
    }, { status: result.success ? 200 : 500 })
  } catch (err: any) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      error: err.message || 'Unknown error during test',
      stack: err.stack,
    }, { status: 500 })
  }
}
