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
  // If user provided an active session cookie in environment variables, prioritize it
  const envCookie = process.env.CMS8K_SESSION_COOKIE
  if (envCookie) {
    return envCookie.startsWith('STORMERSESSID=') || envCookie.startsWith('PHPSESSID=')
      ? envCookie
      : `STORMERSESSID=${envCookie}`
  }

  const username = process.env.CMS8K_USERNAME
  const password = process.env.CMS8K_PASSWORD
  const panelUrl = process.env.CMS8K_URL || 'https://cms-8k.com'

  if (!username || !password) {
    return null
  }

  // Reuse session if it's still valid (sessions last ~30 min, refresh every 20)
  if (sessionCookie && Date.now() < sessionExpiry) {
    return sessionCookie
  }

  try {
    const res = await fetch(`${panelUrl}/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': panelUrl,
        'Referer': `${panelUrl}/login.php`,
      },
      body: new URLSearchParams({
        uname: username,
        upass: password,
        'btn-login': '',
      }).toString(),
      redirect: 'manual',
    })

    const setCookie = res.headers.get('set-cookie')
    if (!setCookie) {
      return null
    }

    const stormerSession = setCookie.match(/STORMERSESSID=([^;]+)/)?.[1]
    const phpSession = setCookie.match(/PHPSESSID=([^;]+)/)?.[1]
    const sessionToken = stormerSession ? `STORMERSESSID=${stormerSession}` : (phpSession ? `PHPSESSID=${phpSession}` : null)

    if (!sessionToken) {
      return null
    }

    sessionCookie = sessionToken
    sessionExpiry = Date.now() + 20 * 60 * 1000 // 20 minutes
    console.log('[CMS8K] Web session established')
    return sessionCookie
  } catch (err) {
    console.error('[CMS8K] Session login attempt error:', err)
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: new URLSearchParams({
        mac_check: '1',
        new_mac: username,
      }).toString(),
    })

    const text = await res.text()
    try {
      const parsed = JSON.parse(text)
      if (parsed.msg === 'not_taken' || parsed.result === true) return true
      if (parsed.msg === 'taken') return false
    } catch {
      // Fallback text check
    }
    return text.trim() !== '1' && !text.toLowerCase().includes('taken')
  } catch {
    return true
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
  // Also guard against invalid/epoch/past timestamps by defaulting to 24h from now
  if (isNaN(parsedMs) || parsedMs <= Date.now() || parsedMs > maxAllowedTimestamp + (10 * 60 * 1000)) {
    return new Date(maxAllowedTimestamp).toISOString()
  }

  return new Date(parsedMs).toISOString()
}

/**
 * Create a 24-hour free trial line on the reseller panel.
 * Returns the credentials to send to the customer.
 * 
 * IMPORTANT: NEVER returns fake/random passwords. If the panel fails or
 * does not return real credentials, this function returns { success: false }.
 */
export async function createTrialAccount(customerName: string, comment?: string): Promise<CreateTrialResult> {
  const panelUrl = process.env.CMS8K_URL || 'https://cms-8k.com'
  const apiKey = process.env.CMS8K_API_KEY
  const username = generateUsername(customerName)

  // 1. STRATEGY A: OFFICIAL GOLD PANEL API KEY
  if (apiKey) {
    try {
      console.log(`[CMS8K API] Attempting trial creation for ${username} with API key...`)
      const params = new URLSearchParams({
        action: 'new',
        type: 'lines',
        mac: username,
        sub_id: LOCKED_TRIAL_SUB_ID, // Strictly locked to 24h trial package
        country: '["ALL"]',
        comment: comment || `Trial - ${customerName}`,
        api_key: apiKey,
      })

      const res = await fetch(`${panelUrl}/api.php?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/javascript, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      })

      const responseText = await res.text()
      console.log('[CMS8K API] Raw response:', responseText.slice(0, 300))

      let data: any = null
      try {
        data = JSON.parse(responseText)
      } catch {
        // Not valid JSON (e.g. PHP warnings or HTML)
      }

      // Check for genuine success and verified credentials from the panel
      const isSuccess = data && (data.result === 'success' || data.result === true || data.status === 'success')
      const pass = data?.password

      if (isSuccess && typeof pass === 'string' && pass.trim().length > 0) {
        const user = data.username || data.mac || username
        const server = data.server || process.env.CMS8K_SERVER_URL || 'http://pro.business-cloud-8.ru'
        const expiry = calculateStrictExpiry(data.expire)

        return {
          success: true,
          username: user,
          credentials: {
            username: user,
            password: pass.trim(),
            server,
            m3uUrl: `${server}/get.php?username=${user}&password=${pass.trim()}&type=m3u_plus`,
            expiresAt: expiry,
          },
        }
      }

      console.warn('[CMS8K API] API key call did not return verified credentials. Response was:', responseText.slice(0, 200))
    } catch (err) {
      console.error('[CMS8K API] Error during API key trial creation:', err)
    }
  }

  // 2. STRATEGY B: SESSION AUTHENTICATION (via CMS8K_SESSION_COOKIE or login)
  const session = await getSession()
  if (session) {
    try {
      console.log(`[CMS8K SESSION] Attempting line creation via session cookie for ${username}...`)
      const addData = {
        mac: username,
        sub_id: LOCKED_TRIAL_SUB_ID,
        comment: comment || `Trial - ${customerName} - ${new Date().toISOString()}`,
        bouq_list: DEFAULT_BOUQUETS,
        type: 'lines',
        bouq_custom: '',
        country: '["ALL"]',
      }

      const queryParams = new URLSearchParams({
        action: 'add_new',
        data: JSON.stringify(addData),
        _: Date.now().toString(),
      })

      const res = await fetch(`${panelUrl}/api.php?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Cookie': session,
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Referer': `${panelUrl}/addnew?t=lines`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      })

      const responseText = await res.text()
      console.log('[CMS8K SESSION] Create line response:', responseText)

      let parsedResult: any = null
      try {
        parsedResult = JSON.parse(responseText)
      } catch {}

      if (parsedResult && parsedResult.result === true) {
        // Line created on panel! Retrieve the generated password from panel table
        const credentials = await getLineCredentials(username, session)
        if (credentials && credentials.password) {
          return { success: true, credentials, username }
        }
        return {
          success: false,
          error: `Line ${username} was created on panel, but could not retrieve generated password. Check panel manually.`,
        }
      }
    } catch (sessionErr) {
      console.error('[CMS8K SESSION] Error creating line via session:', sessionErr)
    }
  }

  // Neither strategy yielded verified credentials — fail safely and notify owner
  return {
    success: false,
    error: 'Reseller panel did not return valid credentials. API key may need activation on Telegram or CMS8K_SESSION_COOKIE is required.',
  }
}

/**
 * Fetch credentials for an existing line from the panel table or get_line_info
 */
async function getLineCredentials(username: string, session: string): Promise<LineCredentials | null> {
  const panelUrl = process.env.CMS8K_URL || 'https://cms-8k.com'
  const server = process.env.CMS8K_SERVER_URL || 'http://pro.business-cloud-8.ru'

  // Step 1: Query api_table.php (lines table) where password is directly stored
  try {
    const tableParams = new URLSearchParams({
      draw: '1',
      start: '0',
      length: '10',
      'search[value]': username,
      'search[regex]': 'false',
      id: 'lines',
      filter: '15',
      state: '0',
      reseller: '',
      template: '0',
      _: Date.now().toString(),
    })

    const tableRes = await fetch(`${panelUrl}/api_table.php?${tableParams.toString()}`, {
      headers: {
        'Cookie': session,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Referer': `${panelUrl}/lines`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })

    const tableText = await tableRes.text()
    try {
      const tableJson = JSON.parse(tableText)
      if (Array.isArray(tableJson.data)) {
        const matchingRow = tableJson.data.find((r: any) => r.username === username)
        if (matchingRow && matchingRow.password) {
          const pass = String(matchingRow.password).trim()
          return {
            username,
            password: pass,
            server,
            m3uUrl: `${server}/get.php?username=${username}&password=${pass}&type=m3u_plus`,
            expiresAt: calculateStrictExpiry(matchingRow.exp_date_flag),
          }
        }
      }
    } catch {}
  } catch (tableErr) {
    console.warn('[CMS8K] Error querying api_table.php:', tableErr)
  }

  // Step 2: Fallback to get_line_info
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })

    const text = await res.text()
    const info = JSON.parse(text)

    if (info && info.password) {
      const pass = String(info.password).trim()
      return {
        username: info.username || username,
        password: pass,
        server,
        m3uUrl: `${server}/get.php?username=${info.username || username}&password=${pass}&type=m3u_plus`,
        expiresAt: calculateStrictExpiry(info.exp_date),
      }
    }
  } catch (err) {
    console.error('[CMS8K] Get credentials error:', err)
  }

  return null
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
