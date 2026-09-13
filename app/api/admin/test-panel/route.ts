import { NextRequest, NextResponse } from 'next/server'
import { createTrialAccount } from '@/lib/panel/cms8k'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
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
