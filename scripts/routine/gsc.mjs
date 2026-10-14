#!/usr/bin/env node
/**
 * Google Search Console snapshot for the daily growth routine.
 *
 * Reads real Search Console data through a Google Cloud service account that
 * the site owner has added as a user on the Search Console property. No
 * third-party SEO tool sits in between, and nothing here estimates: every
 * number printed is a number Google returned.
 *
 * Environment (set in the Claude Code cloud environment, never committed):
 *   GSC_SERVICE_ACCOUNT_JSON  the service account key file, as raw JSON or base64
 *   GSC_SITE_URL              optional, default "sc-domain:smartlivetv.co.uk"
 *
 * Usage:
 *   node scripts/routine/gsc.mjs [--out report.json] [--inspect URL ...]
 *
 * Exit codes: 0 ok, 2 not configured (prints what is missing), 1 API error.
 * Exit 2 is not a failure of the routine: it reports "GSC unavailable" and
 * carries on without GSC numbers — it must never substitute guesses.
 */
import { createSign } from "node:crypto"
import { writeFileSync } from "node:fs"
import { pathToFileURL } from "node:url"

export const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
export const TOKEN_URL = "https://oauth2.googleapis.com/token"
const API = "https://searchconsole.googleapis.com"

/** Parse the key from raw JSON or base64-encoded JSON. */
export function parseServiceAccount(raw) {
  if (!raw || !raw.trim()) return null
  const text = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8")
  const key = JSON.parse(text)
  if (!key.client_email || !key.private_key) throw new Error("service account JSON lacks client_email or private_key")
  return key
}

const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_")

/** Build the RS256-signed JWT Google's token endpoint expects. */
export function buildJwt(key, nowSeconds = Math.floor(Date.now() / 1000)) {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const claims = b64url(
    JSON.stringify({ iss: key.client_email, scope: SCOPE, aud: TOKEN_URL, iat: nowSeconds, exp: nowSeconds + 3600 }),
  )
  const signer = createSign("RSA-SHA256")
  signer.update(`${header}.${claims}`)
  return `${header}.${claims}.${b64url(signer.sign(key.private_key))}`
}

/** GSC data is final roughly 3 days back; use a full 28-day window ending there. */
export function window28(today = new Date()) {
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 3))
  const start = new Date(end.getTime() - 27 * 86400000)
  const prevEnd = new Date(start.getTime() - 86400000)
  const prevStart = new Date(prevEnd.getTime() - 27 * 86400000)
  const d = (x) => x.toISOString().slice(0, 10)
  return { start: d(start), end: d(end), prevStart: d(prevStart), prevEnd: d(prevEnd) }
}

/**
 * Queries ranking 8-20 with real impressions: one push away from page one.
 * Thresholds are deliberately plain so the report can say why a row is here.
 */
export function strikingDistance(rows, minImpressions = 20) {
  return rows
    .filter((r) => r.position >= 8 && r.position <= 20 && r.impressions >= minImpressions)
    .sort((a, b) => b.impressions - a.impressions)
}

/** Page-one queries whose CTR is under 2%: the snippet, not the rank, is losing the click. */
export function lowCtrOnPageOne(rows, maxCtr = 0.02, minImpressions = 50) {
  return rows
    .filter((r) => r.position <= 10 && r.ctr < maxCtr && r.impressions >= minImpressions)
    .sort((a, b) => b.impressions - a.impressions)
}

async function token(key) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: buildJwt(key) }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(`token: HTTP ${res.status} ${JSON.stringify(body)}`)
  return body.access_token
}

async function query(access, site, body) {
  const res = await fetch(`${API}/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: "POST",
    headers: { authorization: `Bearer ${access}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`searchAnalytics: HTTP ${res.status} ${JSON.stringify(json)}`)
  return (json.rows ?? []).map((r) => ({ key: r.keys?.join(" | ") ?? "", ...r }))
}

async function inspect(access, site, url) {
  const res = await fetch(`${API}/v1/urlInspection/index:inspect`, {
    method: "POST",
    headers: { authorization: `Bearer ${access}`, "content-type": "application/json" },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: site }),
  })
  const json = await res.json()
  if (!res.ok) return { url, error: `HTTP ${res.status}` }
  const r = json.inspectionResult?.indexStatusResult ?? {}
  return { url, verdict: r.verdict, coverageState: r.coverageState, lastCrawlTime: r.lastCrawlTime, googleCanonical: r.googleCanonical }
}

async function main(argv) {
  const outIdx = argv.indexOf("--out")
  const out = outIdx >= 0 ? argv[outIdx + 1] : null
  const inspectIdx = argv.indexOf("--inspect")
  const toInspect = inspectIdx >= 0 ? argv.slice(inspectIdx + 1).filter((a) => !a.startsWith("--")) : []

  let key
  try {
    key = parseServiceAccount(process.env.GSC_SERVICE_ACCOUNT_JSON)
  } catch (e) {
    console.error(`GSC not configured: GSC_SERVICE_ACCOUNT_JSON is set but unreadable (${e.message}).`)
    process.exit(2)
  }
  if (!key) {
    console.error("GSC not configured: set GSC_SERVICE_ACCOUNT_JSON in the cloud environment. Report GSC as unavailable; do not estimate.")
    process.exit(2)
  }
  const site = process.env.GSC_SITE_URL || "sc-domain:smartlivetv.co.uk"
  const w = window28()
  const access = await token(key)
  const base = { dataState: "final", rowLimit: 250 }

  const [totals, prevTotals, queries, pages] = await Promise.all([
    query(access, site, { ...base, startDate: w.start, endDate: w.end }),
    query(access, site, { ...base, startDate: w.prevStart, endDate: w.prevEnd }),
    query(access, site, { ...base, startDate: w.start, endDate: w.end, dimensions: ["query"] }),
    query(access, site, { ...base, startDate: w.start, endDate: w.end, dimensions: ["page"] }),
  ])
  const inspections = []
  for (const u of toInspect) inspections.push(await inspect(access, site, u))

  const report = {
    site,
    window: w,
    totals: totals[0] ?? null,
    previousTotals: prevTotals[0] ?? null,
    strikingDistance: strikingDistance(queries).slice(0, 25),
    lowCtrOnPageOne: lowCtrOnPageOne(queries).slice(0, 25),
    topQueries: queries.slice(0, 50),
    topPages: pages.slice(0, 50),
    inspections,
  }
  if (out) writeFileSync(out, JSON.stringify(report, null, 2))

  const t = report.totals
  const p = report.previousTotals
  const pct = (a, b) => (b ? `${(((a - b) / b) * 100).toFixed(1)}%` : "n/a")
  console.log(`# Search Console ${w.start} to ${w.end} (${site})`)
  if (t) {
    console.log(`clicks ${t.clicks} (${pct(t.clicks, p?.clicks)} vs prior 28d) | impressions ${t.impressions} (${pct(t.impressions, p?.impressions)}) | CTR ${(t.ctr * 100).toFixed(2)}% | avg position ${t.position.toFixed(1)}`)
  } else {
    console.log("no rows returned for this window")
  }
  console.log(`\n## Striking distance (pos 8-20, >=20 impressions): ${report.strikingDistance.length}`)
  for (const r of report.strikingDistance.slice(0, 15)) console.log(`- ${r.key} — pos ${r.position.toFixed(1)}, ${r.impressions} impr, ${r.clicks} clicks`)
  console.log(`\n## Page-one, CTR under 2% (>=50 impressions): ${report.lowCtrOnPageOne.length}`)
  for (const r of report.lowCtrOnPageOne.slice(0, 15)) console.log(`- ${r.key} — pos ${r.position.toFixed(1)}, CTR ${(r.ctr * 100).toFixed(2)}%, ${r.impressions} impr`)
  if (inspections.length) {
    console.log("\n## URL inspection")
    for (const i of inspections) console.log(`- ${i.url}: ${i.error ?? `${i.verdict} / ${i.coverageState} / last crawl ${i.lastCrawlTime ?? "never"}`}`)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).catch((e) => {
    console.error(`GSC error: ${e.message}`)
    process.exit(1)
  })
}
