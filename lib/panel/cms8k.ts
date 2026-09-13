/**
 * CMS8K Reseller Panel API
 * 
 * Panel: cms-8k.com
 * Protocol: Xtream Codes (lines)
 * 
 * How it works:
 * 1. Login to get session cookies (PHPSESSID)
 * 2. Check if username is free: POST /api_check.php
 * 3. Create line: GET /api.php?action=add_new&data={...}
 * 4. Fetch credentials: GET /api.php?action=get_line_info&mac={username}
 * 
 * Required env vars:
 *   CMS8K_URL        = https://cms-8k.com  (or your panel's URL if whitelabel)
 *   CMS8K_USERNAME   = your panel login username
 *   CMS8K_PASSWORD   = your panel login password
 *   CMS8K_TRIAL_SUB_ID = 8  (the 24h trial subscription package ID)
 */

export interface LineCredentials {
  username: string
  password: string
  server: string
  m3uUrl: string
  expiresAt: string // ISO timestamp
}

export type CreateTrialResult =
  | {
      success: true
      credentials: LineCredentials
      username: string
    }
  | {
      success: false
      error: string
    }

// The full bouquet list from HAR — all channel packages
export const DEFAULT_BOUQUETS = [
  "1079","1299","1533","35","1222","1264","13","67","17","5","43","6","14","3",
  "15","1","7","1168","1587","18","19","21","20","168","199","200","201","1269",
  "4","8","22","38","98","56","1594","110","1180","45","12","1492","31","28",
  "29","30","32","120","75","37","34","39","23","24","25","55","1330","44","74",
  "16","1084","46","1233","1546","1585","65","1158","1167","1221","1148","1325",
  "71","9","10","1234","11","1219","1302","1203","42","68","69","72","52","135",
  "137","66","33","1298","1141","1287","1591","1440","1074","1082","1094","1160",
  "243","1239","1277","1240","1461","1242","1241","1406","1266","1396","1599",
  "1270","1092","1543","1590","1438","1243","1473","1482","1528","1522","1558",
  "264","1020","1410","1465","1556","1504","1505","1506","1507","1508","1509",
  "1596","1561","1541","1516","1517","1518","1544","1545","1579","1393","1354",
  "244","245","246","281","261","262","1467","252","1469","247","248","249",
  "250","1570","253","254","1595","308","255","256","257","352","258","259",
  "260","1187","1185","1184","1186","1183","1181","1182","1188","1208","265",
  "1488","1408","266","267","1446","1526","1384","1453","1455","1457","269",
  "270","271","1471","272","273","274","275","276","277","278","279","280",
  "282","283","284","285","286","1569","287","1281","288","1568","1449","289",
  "1089","1090","268"
]

let sessionCookie: string | null = null
let sessionExpiry: number = 0

async function getSession(): Promise<string | null> {
  const username = process.env.CMS8K_USERNAME
  const password = process.env.CMS8K_PASSWORD
  const panelUrl = process.env.CMS8K_URL || 'https://cms-8k.com'

  if (!username || !password) {
    console.error('[CMS8K] Missing CMS8K_USERNAME or CMS8K_PASSWORD env vars')
    return null
  }

  // Reuse session if it's still valid (sessions last ~30 min, refresh every 20)
  if (sessionCookie && Date.now() < sessionExpiry) {
    return sessionCookie
  }

  try {
    const res = await fetch(`${panelUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,*/*',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/153.0.0.0 Mobile Safari/537.36',
        'Origin': panelUrl,
        'Referer': `${panelUrl}/login`,
      },
      body: new URLSearchParams({ username, password }).toString(),
      redirect: 'manual', // Don't follow redirects — we just want the Set-Cookie
    })

    // Grab PHPSESSID from Set-Cookie header
    const setCookie = res.headers.get('set-cookie')
    if (!setCookie) {
      console.error('[CMS8K] No Set-Cookie header in login response — wrong credentials?')
      return null
    }

    const phpSession = setCookie.match(/PHPSESSID=([^;]+)/)?.[1]
    if (!phpSession) {
      console.error('[CMS8K] Could not extract PHPSESSID from login response')
      return null
    }

    sessionCookie = `PHPSESSID=${phpSession}`
    sessionExpiry = Date.now() + 20 * 60 * 1000 // 20 minutes
    console.log('[CMS8K] Logged in, session cached')
    return sessionCookie
  } catch (err) {
    console.error('[CMS8K] Login failed:', err)
    return null
  }
}

/**
 * Generate a unique username for a customer.
 * Format: SLTV_{first5charsOfName}_{random4digits}
 * e.g. "SLTV_James_4821"
 */
export function generateUsername(customerName: string): string {
  const clean = customerName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toLowerCase()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `SLTV_${clean}_${rand}`
}

/**
 * Check if a username is already taken on the panel
 */
async function isUsernameAvailable(username: string, session: string): Promise<boolean> {
  const panelUrl = process.env.CMS8K_URL || 'https://cms-8k.com'

  try {
    const res = await fetch(`${panelUrl}/api_check.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': session,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Origin': panelUrl,
        'Referer': `${panelUrl}/addnew?t=lines`,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/153.0.0.0 Mobile Safari/537.36',
      },
      body: new URLSearchParams({
        mac_check: '1',
        new_mac: username,
      }).toString(),
    })

    const text = await res.text()
    console.log('[CMS8K] Username check response:', text)
    // Panel returns something like "0" (available) or "1" (taken) — adjust based on actual response
    return text.trim() !== '1' && !text.toLowerCase().includes('exists')
  } catch {
    return true // Assume available if check fails, let create fail gracefully
  }
}

/**
 * STRICT SECURITY CEILING:
 * Free trials are strictly hardcoded to Package ID '8' (24 Hours Test Line).
 * Under NO circumstances can any client parameter, request, or environment
 * override create a trial line longer than 24 hours or consume paid credits.
 */
export const LOCKED_TRIAL_SUB_ID = '8' as const
export const MAX_TRIAL_DURATION_MS = 24 * 60 * 60 * 1000 // Exactly 24 hours

export function calculateStrictExpiry(rawExpiry?: string | number): string {
  const maxAllowedTimestamp = Date.now() + MAX_TRIAL_DURATION_MS

  if (!rawExpiry) {
    return new Date(maxAllowedTimestamp).toISOString()
  }

  const parsedMs = typeof rawExpiry === 'number'
    ? (rawExpiry > 1e11 ? rawExpiry : rawExpiry * 1000)
    : new Date(rawExpiry).getTime()

  // Strict Ceiling: If panel returns an expiry further than 24h + 10m buffer, cap it to exactly 24h
  if (isNaN(parsedMs) || parsedMs > maxAllowedTimestamp + (10 * 60 * 1000)) {
    return new Date(maxAllowedTimestamp).toISOString()
  }

  return new Date(parsedMs).toISOString()
}

/**
 * Create a 24-hour free trial line on the reseller panel.
 * Returns the credentials to send to the customer.
 */
export async function createTrialAccount(customerName: string, comment?: string): Promise<CreateTrialResult> {
  const panelUrl = process.env.CMS8K_URL || 'https://cms-8k.com'
  const apiKey = process.env.CMS8K_API_KEY

  // 1. IF OFFICIAL GOLD PANEL API KEY IS CONFIGURED (Preferred & Cleanest)
  if (apiKey) {
    let username = generateUsername(customerName)
    try {
      // Direct Gold Panel API: action=new or action=add_new with api_key
      const params = new URLSearchParams({
        action: 'new',
        type: 'lines',
        mac: username,
        sub_id: LOCKED_TRIAL_SUB_ID, // Strictly locked to 24h trial package
        country: '["ALL"]',
        api_key: apiKey,
      })

      const res = await fetch(`${panelUrl}/api.php?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/javascript, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      const responseText = await res.text()
      console.log('[CMS8K API KEY] Create trial response:', responseText)

      let data: any = null
      try {
        data = JSON.parse(responseText)
      } catch {
        // Fallback check if plain text
      }

      if (data && (data.status === 'success' || data.mac || data.username)) {
        const user = data.mac || data.username || username
        const pass = data.password || ''
        const server = data.server || process.env.CMS8K_SERVER_URL || panelUrl
        const expiry = calculateStrictExpiry(data.expire)

        return {
          success: true,
          username: user,
          credentials: {
            username: user,
            password: pass,
            server,
            m3uUrl: `${server}/get.php?username=${user}&password=${pass}&type=m3u_plus`,
            expiresAt: expiry,
          }
        }
      }
    } catch (err) {
      console.error('[CMS8K API KEY] Error during trial creation:', err)
    }
  }

  // 2. FALLBACK: SESSION COOKIE AUTHENTICATION
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Could not authenticate with reseller panel' }
  }

  // Generate a unique username, retry if taken
  let username = generateUsername(customerName)
  const available = await isUsernameAvailable(username, session)
  if (!available) {
    username = generateUsername(customerName + Math.random().toString(36).slice(2, 5))
  }

  // Build the add_new request
  const data = {
    mac: username,
    sub_id: LOCKED_TRIAL_SUB_ID, // Strictly locked to 24h trial package
    comment: comment || `Trial - ${customerName} - ${new Date().toISOString()}`,
    bouq_list: DEFAULT_BOUQUETS,
    type: 'lines',
    bouq_custom: '',
    country: '["ALL"]',
  }

  const queryParams = new URLSearchParams({
    action: 'add_new',
    data: JSON.stringify(data),
    _: Date.now().toString(),
  })

  try {
    const res = await fetch(`${panelUrl}/api.php?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Cookie': session,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Referer': `${panelUrl}/addnew?t=lines`,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/153.0.0.0 Mobile Safari/537.36',
      },
    })

    const responseText = await res.text()
    console.log('[CMS8K] Create trial response:', responseText)

    // Parse response — CMS8K returns a short response (15 bytes per HAR)
    // Typically something like "1" or JSON with success indicator
    let responseData: { status?: string; password?: string } = {}
    try {
      responseData = JSON.parse(responseText)
    } catch {
      // Not JSON — check if it's a plain success indicator
    }

    const isSuccess = responseText.includes('1') || 
                      responseText.toLowerCase().includes('success') ||
                      responseData.status === 'ok' ||
                      res.ok

    if (!isSuccess) {
      return { success: false, error: `Panel returned error: ${responseText}` }
    }

    // Fetch the created line's credentials
    const credentials = await getLineCredentials(username, session)
    if (!credentials) {
      // Session might have expired during creation — clear and return partial info
      sessionCookie = null
      return {
        success: false,
        error: 'Line created but could not retrieve credentials — check panel manually',
      }
    }

    return { success: true, credentials, username }
  } catch (err) {
    console.error('[CMS8K] Create trial error:', err)
    return { success: false, error: `Failed to create trial: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

/**
 * Fetch credentials for an existing line
 */
async function getLineCredentials(username: string, session: string): Promise<LineCredentials | null> {
  const panelUrl = process.env.CMS8K_URL || 'https://cms-8k.com'

  try {
    const params = new URLSearchParams({
      action: 'get_line_info',
      mac: username,
      _: Date.now().toString(),
    })

    const res = await fetch(`${panelUrl}/api.php?${params.toString()}`, {
      headers: {
        'Cookie': session,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Referer': `${panelUrl}/lines`,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/153.0.0.0 Mobile Safari/537.36',
      },
    })

    const text = await res.text()
    console.log('[CMS8K] Get line info response:', text)

    let info: {
      username?: string
      password?: string
      exp_date?: string
      server_url?: string
    } = {}

    try {
      info = JSON.parse(text)
    } catch {
      return null
    }

    const server = process.env.CMS8K_SERVER_URL || panelUrl
    const user = info.username || username
    const pass = info.password || ''

    // Expiry capped strictly at maximum 24 hours
    const expiryTimestamp = calculateStrictExpiry(info.exp_date)

    return {
      username: user,
      password: pass,
      server,
      m3uUrl: `${server}/get.php?username=${user}&password=${pass}&type=m3u_plus`,
      expiresAt: expiryTimestamp,
    }
  } catch (err) {
    console.error('[CMS8K] Get credentials error:', err)
    return null
  }
}

/**
 * Delete/expire a trial line (e.g. when it expires or converts to paid)
 */
export async function deleteTrialAccount(username: string): Promise<boolean> {
  const panelUrl = process.env.CMS8K_URL || 'https://cms-8k.com'
  const session = await getSession()
  if (!session) return false

  try {
    const params = new URLSearchParams({
      action: 'delete',
      mac: username,
      _: Date.now().toString(),
    })

    const res = await fetch(`${panelUrl}/api.php?${params.toString()}`, {
      headers: {
        'Cookie': session,
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `${panelUrl}/lines`,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/153.0.0.0 Mobile Safari/537.36',
      },
    })

    return res.ok
  } catch {
    return false
  }
}
