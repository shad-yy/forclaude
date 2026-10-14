#!/usr/bin/env node
/**
 * PageSpeed Insights check for the daily growth routine.
 *
 * Reports two kinds of numbers, and labels which is which:
 *   field — Chrome UX Report data from real visitors (p75), when Google has
 *           enough traffic for the URL or origin. This is what ranking uses.
 *   lab   — a single Lighthouse run on Google's servers. Useful for spotting
 *           regressions, not a measurement of real users.
 *
 * Environment:
 *   PSI_API_KEY  a Google Cloud API key with the PageSpeed Insights API
 *                enabled. Without one the shared anonymous quota is used and
 *                is usually exhausted (HTTP 429, seen 2026-10-14).
 *
 * Usage:
 *   node scripts/routine/pagespeed.mjs [--out report.json] [path ...]
 *
 * Exit codes: 0 ok, 2 not configured or quota exhausted, 1 other error.
 * On exit 2 the routine reports page speed as unavailable. It never
 * substitutes guessed or remembered numbers.
 */
import { writeFileSync } from "node:fs"
import { pathToFileURL } from "node:url"

export const ORIGIN = "https://smartlivetv.co.uk"
export const DEFAULT_PATHS = ["/", "/pricing", "/free-trial", "/buy", "/watch/premier-league", "/setup/firestick"]

/** Google's published "good" thresholds for Core Web Vitals. */
export const GOOD = { lcpMs: 2500, inpMs: 200, cls: 0.1 }

/** Pull the numbers that matter out of one PSI response. */
export function summarise(path, psi) {
  const field = psi.loadingExperience?.metrics ?? {}
  const origin = psi.originLoadingExperience?.metrics ?? {}
  const pick = (m, k) => m[k]?.percentile
  const fieldSource = Object.keys(field).length ? "url" : Object.keys(origin).length ? "origin" : "none"
  const f = fieldSource === "url" ? field : origin
  const lcp = pick(f, "LARGEST_CONTENTFUL_PAINT_MS")
  const inp = pick(f, "INTERACTION_TO_NEXT_PAINT")
  const clsRaw = pick(f, "CUMULATIVE_LAYOUT_SHIFT_SCORE")
  const cls = typeof clsRaw === "number" ? clsRaw / 100 : undefined
  const audits = psi.lighthouseResult?.audits ?? {}
  const cats = psi.lighthouseResult?.categories ?? {}
  const score = (c) => (typeof cats[c]?.score === "number" ? Math.round(cats[c].score * 100) : undefined)
  return {
    path,
    field: {
      source: fieldSource,
      lcpMs: lcp,
      inpMs: inp,
      cls,
      passes: fieldSource === "none" ? null : (lcp ?? Infinity) <= GOOD.lcpMs && (inp ?? Infinity) <= GOOD.inpMs && (cls ?? Infinity) <= GOOD.cls,
    },
    lab: {
      performance: score("performance"),
      seo: score("seo"),
      accessibility: score("accessibility"),
      bestPractices: score("best-practices"),
      lcpMs: audits["largest-contentful-paint"]?.numericValue,
      tbtMs: audits["total-blocking-time"]?.numericValue,
      cls: audits["cumulative-layout-shift"]?.numericValue,
    },
  }
}

async function run(path, key) {
  const qs = new URLSearchParams({ url: `${ORIGIN}${path}`, strategy: "mobile" })
  for (const c of ["performance", "seo", "accessibility", "best-practices"]) qs.append("category", c)
  if (key) qs.set("key", key)
  const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${qs}`)
  const body = await res.json()
  if (res.status === 429) {
    const e = new Error("PageSpeed Insights quota exhausted (HTTP 429)")
    e.exitCode = 2
    throw e
  }
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status} ${body?.error?.message ?? ""}`)
  return summarise(path, body)
}

async function main(argv) {
  const outIdx = argv.indexOf("--out")
  const out = outIdx >= 0 ? argv[outIdx + 1] : null
  const paths = argv.filter((a, i) => a.startsWith("/") && argv[i - 1] !== "--out")
  const key = process.env.PSI_API_KEY
  if (!key) console.error("PSI_API_KEY not set — trying the shared anonymous quota, which is usually exhausted.")

  const results = []
  for (const p of paths.length ? paths : DEFAULT_PATHS) results.push(await run(p, key))
  if (out) writeFileSync(out, JSON.stringify(results, null, 2))

  const fmt = (n, unit = "") => (typeof n === "number" ? `${Math.round(n)}${unit}` : "—")
  console.log("| Page | Field source | LCP p75 | INP p75 | CLS p75 | Field CWV | Lab perf | Lab SEO | Lab LCP | TBT |")
  console.log("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |")
  for (const r of results) {
    const pass = r.field.passes === null ? "no data" : r.field.passes ? "pass" : "FAIL"
    const cls = typeof r.field.cls === "number" ? r.field.cls.toFixed(2) : "—"
    console.log(`| ${r.path} | ${r.field.source} | ${fmt(r.field.lcpMs, "ms")} | ${fmt(r.field.inpMs, "ms")} | ${cls} | ${pass} | ${fmt(r.lab.performance)} | ${fmt(r.lab.seo)} | ${fmt(r.lab.lcpMs, "ms")} | ${fmt(r.lab.tbtMs, "ms")} |`)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).catch((e) => {
    console.error(`PageSpeed: ${e.message}`)
    process.exit(e.exitCode ?? 1)
  })
}
