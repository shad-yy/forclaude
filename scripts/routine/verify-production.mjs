#!/usr/bin/env node
/**
 * After a routine merge, prove the change is live and nothing broke.
 *
 * Runs on the GitHub Actions runner (which can reach smartlivetv.co.uk; the
 * Claude Code sandbox cannot). Waits until every post the PR touched answers
 * 200 on the live site — which also proves the new production deployment is
 * serving — then checks the key commercial pages and the sitemap.
 *
 * Environment: CHANGED_FILES (newline-separated paths from the PR),
 * optional BASE_URL (default https://smartlivetv.co.uk), TIMEOUT_MINUTES (15).
 * Exit 0 when live and healthy, 1 otherwise (the workflow then opens an issue).
 */
import { pathToFileURL } from "node:url"

export const KEY_PAGES = ["/", "/pricing", "/free-trial", "/buy"]

/** Blog slugs a PR touched, from its changed file list. */
export function postSlugs(files) {
  return files
    .map((f) => f.trim().match(/^content\/blog\/([a-z0-9][a-z0-9-]*)\.mdx$/))
    .filter(Boolean)
    .map((m) => m[1])
}

async function status(url) {
  try {
    const res = await fetch(url, { redirect: "manual", headers: { "cache-control": "no-cache" } })
    return { status: res.status, body: res.status === 200 ? await res.text() : "" }
  } catch (e) {
    return { status: 0, body: "", error: e.message }
  }
}

async function main() {
  const base = (process.env.BASE_URL ?? "https://smartlivetv.co.uk").replace(/\/$/, "")
  const slugs = postSlugs((process.env.CHANGED_FILES ?? "").split("\n"))
  const deadline = Date.now() + Number(process.env.TIMEOUT_MINUTES ?? 15) * 60_000
  const problems = []

  // 1. Wait for the posts to go live (proves the production deploy is serving).
  if (slugs.length) {
    let pending = [...slugs]
    while (pending.length && Date.now() < deadline) {
      const still = []
      for (const s of pending) if ((await status(`${base}/blog/${s}`)).status !== 200) still.push(s)
      pending = still
      if (pending.length) {
        console.log(`waiting for: ${pending.join(", ")}`)
        await new Promise((r) => setTimeout(r, 30_000))
      }
    }
    for (const s of pending) problems.push(`/blog/${s} not live after ${process.env.TIMEOUT_MINUTES ?? 15} minutes`)
  } else {
    // Nothing new to wait on (a refresh or log-only change): give Vercel time to promote.
    await new Promise((r) => setTimeout(r, 4 * 60_000))
  }

  // 2. Key commercial pages must still answer 200.
  for (const p of KEY_PAGES) {
    const r = await status(`${base}${p}`)
    if (r.status !== 200) problems.push(`${p} returned ${r.status}${r.error ? ` (${r.error})` : ""}`)
  }

  // 3. The sitemap must list every post the PR touched.
  if (slugs.length) {
    const sm = await status(`${base}/sitemap.xml`)
    if (sm.status !== 200) problems.push(`/sitemap.xml returned ${sm.status}`)
    else for (const s of slugs) if (!sm.body.includes(`/blog/${s}<`)) problems.push(`/sitemap.xml does not list /blog/${s}`)
  }

  if (problems.length) {
    console.log(`PRODUCTION CHECK FAILED\n- ${problems.join("\n- ")}`)
    process.exit(1)
  }
  console.log(`production healthy; live: ${slugs.map((s) => `${base}/blog/${s}`).join(", ") || "(no post changes)"}`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main().catch((e) => { console.error(e.message); process.exit(1) })
