// The production monitor's "robots.txt must NOT block Googlebot" check failed
// every run from 2026-10-15 (issue #23) on a robots.txt that did not block
// Googlebot. Commit 2359e46 added a group that disallows "/" for AI-training
// crawlers only:
//
//   User-Agent: GPTBot
//   ...
//   Disallow: /
//
// and the check failed on any bare "Disallow: /" line, whoever it applied to.
// It now asks the question it is named for, through agentsBlockedFromSite().
//
// This file also renders app/robots.ts on every PR, so a robots.txt that
// really blocks a search engine is caught before it deploys — the monitor
// only sees it after it is live.
//
// Red-first: the "old check" test below documents that the previous regex
// flags today's file; the real-block fixtures fail against a parser that
// ignores groups.

import { describe, it, expect } from "vitest"
import { resolveRobots } from "next/dist/build/webpack/loaders/metadata/resolve-route-data"
import robots from "@/app/robots"
import { agentsBlockedFromSite } from "@/lib/seo/robots-rules"

const SEARCH_ENGINES = ["Googlebot", "Bingbot"]

describe("live robots.txt (rendered from app/robots.ts)", () => {
  const txt = resolveRobots(robots())

  it("does not block Google or Bing from the site", () => {
    expect(agentsBlockedFromSite(txt, SEARCH_ENGINES)).toEqual([])
  })

  it("still blocks the AI-training crawlers the owner chose to block", () => {
    expect(agentsBlockedFromSite(txt, ["GPTBot", "ClaudeBot", "CCBot"])).toEqual([
      "GPTBot",
      "ClaudeBot",
      "CCBot",
    ])
  })

  it("old check: a bare 'Disallow: /' anywhere flags this file, though Google is allowed", () => {
    expect(txt).toMatch(/^Disallow:\s*\/\s*$/m)
  })
})

describe("agentsBlockedFromSite", () => {
  it("flags a site-wide block under *", () => {
    expect(agentsBlockedFromSite("User-agent: *\nDisallow: /\n", SEARCH_ENGINES)).toEqual(SEARCH_ENGINES)
  })

  it("flags a block aimed at Googlebot by name, even when * allows everything", () => {
    const txt = "User-agent: Googlebot\nDisallow: /\n\nUser-agent: *\nAllow: /\n"
    expect(agentsBlockedFromSite(txt, SEARCH_ENGINES)).toEqual(["Googlebot"])
  })

  it("matches the user-agent case-insensitively", () => {
    expect(agentsBlockedFromSite("user-agent: GOOGLEBOT\ndisallow: /", ["Googlebot"])).toEqual(["Googlebot"])
  })

  it("applies a group's rules to every user-agent line above them", () => {
    const txt = "User-agent: GPTBot\nUser-agent: Googlebot\nDisallow: /\n"
    expect(agentsBlockedFromSite(txt, SEARCH_ENGINES)).toEqual(["Googlebot"])
  })

  it("does not apply * when a named group exists for the crawler", () => {
    const txt = "User-agent: Googlebot\nDisallow: /admin/\n\nUser-agent: *\nDisallow: /\n"
    expect(agentsBlockedFromSite(txt, ["Googlebot"])).toEqual([])
  })

  it("treats path-only disallows and empty Disallow as not blocking the site", () => {
    expect(agentsBlockedFromSite("User-agent: *\nDisallow: /api/\nDisallow:\n", SEARCH_ENGINES)).toEqual([])
  })

  it("lets an equal-length Allow: / win over Disallow: /", () => {
    expect(agentsBlockedFromSite("User-agent: *\nDisallow: /\nAllow: /\n", SEARCH_ENGINES)).toEqual([])
  })

  it("treats Disallow: /* as a site-wide block and ignores comments", () => {
    expect(agentsBlockedFromSite("User-agent: * # all\nDisallow: /* # everything\n", ["Googlebot"])).toEqual(["Googlebot"])
  })
})
