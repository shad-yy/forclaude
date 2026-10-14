/**
 * Editorial rules for new blog posts, as code.
 *
 * The daily growth routine (playbook/routines/daily-growth-routine.md) may
 * merge a content-only pull request to Version-3 without a human in the loop,
 * which deploys it to production. These checks are the gate: a post that
 * breaks one cannot pass tests/blog-content-rules.test.ts, so it cannot merge.
 *
 * They encode the owner's standing rules: cite real sources (never invent a
 * fact), answer first, UK English, honest about free BBC/ITV coverage, no
 * piracy keywords, no emojis, no fabricated customer numbers, and the three
 * internal links every post must carry.
 *
 * Applies to posts dated on or after RULES_APPLY_FROM. Older posts predate
 * the rules and are not retro-failed; refreshing one brings it under them.
 */
import matter from "gray-matter"

export const RULES_APPLY_FROM = "2026-10-14"

export const REQUIRED_INTERNAL_LINKS = ["/pricing", "/free-trial", "/setup/firestick"] as const

/** Phrases the owner never wants to target or print. Case-insensitive. */
const BANNED_TERMS = [
  /\bfree streams?\b/i,
  /\billegal\b/i,
  /\bpira(?:cy|ted|te sites?)\b/i,
  /\bcracked\b/i,
  /\bjailbr(?:oken|eak)\b/i,
]

/** A claim that BBC or ITV coverage needs IPTV. It does not: it is free-to-air in the UK. */
const BBC_ITV_REQUIRES_IPTV =
  /\b(?:BBC|ITV)\b[^.\n]{0,100}\b(?:requires?|needs?|only (?:available )?(?:on|via|through))\b[^.\n]{0,40}\bIPTV\b/i

/** US spellings that slip into UK copy most often. */
const US_SPELLINGS = /\b(?:canceled|canceling|color|colors|favorite|favorites)\b/i

/** Customer or subscriber counts — never publish one that is not real. */
const CUSTOMER_COUNT = /\b\d[\d,.]*\s*k?\+?\s+(?:happy\s+|satisfied\s+)?(?:customers|subscribers|users|members)\b/i

/** Stock phrases that make copy read as machine-written. */
const STOCK_PHRASES = [
  /\bin today'?s fast-paced\b/i,
  /\bdelve\b/i,
  /\bit'?s (?:important|worth) (?:to note|noting)\b/i,
  /\bin conclusion\b/i,
  /\bgame[- ]changer\b/i,
  /\bunlock the (?:power|full potential)\b/i,
  /\blook no further\b/i,
  /\bseamless(?:ly)?\b/i,
  /\btapestry\b/i,
  /\belevate your\b/i,
]

const EMOJI = /\p{Extended_Pictographic}/u

export interface PostAudit {
  applies: boolean
  violations: string[]
}

function firstParagraph(body: string): string {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  const prose = blocks.find((b) => !b.startsWith("#") && !b.startsWith("|") && !b.startsWith("<") && !b.startsWith("!["))
  return prose ?? ""
}

/** Hosts that are this site — a source on them does not count as independent. */
const OWN_HOSTS = new Set(["smartlivetv.co.uk", "www.smartlivetv.co.uk"])

/**
 * The hostname of a source URL, or null if it is not an absolute https URL.
 * Parsed with URL rather than matched with a regex: an unanchored pattern
 * would treat "smartlivetv.co.uk.example.com" as this site (CodeQL
 * js/regex/missing-regexp-anchor, 2026-10-14).
 */
function sourceHost(source: unknown): string | null {
  if (typeof source !== "string") return null
  try {
    const u = new URL(source)
    return u.protocol === "https:" && u.hostname.includes(".") ? u.hostname.toLowerCase() : null
  } catch {
    return null
  }
}

/** Every markdown link target in the body: the `x` in `[text](x)`. */
function linkTargets(markdown: string): string[] {
  return Array.from(markdown.matchAll(/\]\(([^)\s]+)\)/g), (m) => m[1])
}

/**
 * True if `target` points at `path` on this site, allowing a trailing
 * sub-path, fragment or query. Plain string comparison — no regex built from
 * input (CodeQL js/incomplete-sanitization, 2026-10-14).
 */
function linksTo(target: string, path: string): boolean {
  return target === path || target.startsWith(`${path}/`) || target.startsWith(`${path}#`) || target.startsWith(`${path}?`)
}

function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length
}

/**
 * Audit one post's raw MDX source. `slug` is only used in messages.
 */
export function auditPost(slug: string, source: string): PostAudit {
  const { data, content } = matter(source.replace(/^﻿/, ""))
  const date = typeof data.date === "string" ? data.date : String(data.date ?? "")
  const applies = /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= RULES_APPLY_FROM
  if (!applies) return { applies: false, violations: [] }

  const v: string[] = []
  const say = (msg: string) => v.push(`${slug}: ${msg}`)

  // Frontmatter
  const title = typeof data.title === "string" ? data.title : ""
  if (title.length < 10 || title.length > 70) say(`title must be 10-70 characters (is ${title.length})`)
  const description = typeof data.description === "string" ? data.description : ""
  if (description.length < 70 || description.length > 160) {
    say(`description must be 70-160 characters for search snippets (is ${description.length})`)
  }
  const metaTitle = typeof data.metaTitle === "string" ? data.metaTitle : ""
  if (!metaTitle || metaTitle.length > 65) say(`metaTitle is required and must be at most 65 characters (is ${metaTitle.length})`)
  if (typeof data.category !== "string" || !data.category) say("category is required")

  const sources: unknown[] = Array.isArray(data.sources) ? data.sources : []
  const external = sources.map(sourceHost).filter((h): h is string => h !== null && !OWN_HOSTS.has(h))
  if (external.length < 2) {
    say("sources must list at least two external https URLs the facts in this post were taken from")
  }

  // Body structure
  const lead = firstParagraph(content)
  if (wordCount(lead) > 60) say(`first paragraph must answer the query in 60 words or fewer (is ${wordCount(lead)})`)

  const targets = linkTargets(content)
  for (const link of REQUIRED_INTERNAL_LINKS) {
    if (!targets.some((t) => linksTo(t, link))) say(`must link to ${link}`)
  }

  if (!/^\|.*\|\s*$\n^\|\s*:?-{3,}/m.test(content)) say("must include at least one comparison table")

  const faq = content.match(/^##\s+(?:FAQ|FAQs|Frequently Asked Questions)\b[\s\S]*$/im)
  const questions = faq ? (faq[0].match(/^###\s+.+\?\s*$/gm) ?? []).length : 0
  if (questions < 5) say(`FAQ section needs at least 5 question headings ending in "?" (has ${questions})`)

  // Language and honesty
  const text = `${title}\n${description}\n${metaTitle}\n${content}`
  if (EMOJI.test(text)) say("must not contain emojis")
  for (const re of BANNED_TERMS) if (re.test(text)) say(`must not use the term matched by ${re}`)
  if (BBC_ITV_REQUIRES_IPTV.test(text)) say("must not claim BBC or ITV coverage needs IPTV; it is free-to-air in the UK")
  const us = text.match(US_SPELLINGS)
  if (us) say(`use UK spelling, found "${us[0]}"`)
  const count = text.match(CUSTOMER_COUNT)
  if (count) say(`must not state a customer or subscriber count ("${count[0]}")`)
  for (const re of STOCK_PHRASES) {
    const m = text.match(re)
    if (m) say(`reads machine-written, remove "${m[0]}"`)
  }

  return { applies: true, violations: v }
}
