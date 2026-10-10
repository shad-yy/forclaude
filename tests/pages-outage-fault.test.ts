// O-26 step D — pages tell the truth during a TheSportsDB outage.
//
// Once resolvers pass faults on (step B), pages must not:
//   - turn an outage into a 404 (events/[id], match/[id] did: catch → null → notFound());
//   - print the raw error to visitors (events, leagues, players, teams list pages
//     rendered `err.message`, which would now read "UpstreamFaultError: … → 503");
//   - hide a whole landing page because one section failed (watch/[slug] used
//     Promise.all with no catch), or claim "No upcoming fixtures" when the
//     fixtures could not be loaded.
//
// Red-first: the page cases failed before step D.

import { describe, it, expect, beforeEach, vi } from "vitest"
import { readFileSync } from "node:fs"
import type { ReactNode } from "react"
import { UpstreamFaultError, isUpstreamFault, dataErrorMessage } from "@/lib/api/errors"

const fault = () => new UpstreamFaultError("eventsnextleague.php?id=4328", 503)
/** notFound()'s marker: "NEXT_NOT_FOUND" on Next 14, "NEXT_HTTP_ERROR_FALLBACK;404" on Next 15. */
function isNotFound(e: unknown): boolean {
  const digest = (e as { digest?: string })?.digest ?? ""
  return digest === "NEXT_NOT_FOUND" || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;404")
}

const getFixture = vi.fn()
const getFixtures = vi.fn()
const getStandings = vi.fn()
const lookupEvent = vi.fn()

vi.mock("@/lib/api/unified-sports-api", () => ({
  unifiedSportsAPI: {
    getFixture: (...a: unknown[]) => getFixture(...a),
    getFixtures: (...a: unknown[]) => getFixtures(...a),
    getStandings: (...a: unknown[]) => getStandings(...a),
    getSeasonString: () => "2026-2027",
  },
}))
vi.mock("@/lib/api/the-sports-db", () => ({
  theSportsDB: { lookupEvent: (...a: unknown[]) => lookupEvent(...a) },
}))

/** Collect every string reachable through props.children of a React element tree. */
function texts(node: unknown): string[] {
  if (node == null || typeof node === "boolean") return []
  if (typeof node === "string" || typeof node === "number") return [String(node)]
  if (Array.isArray(node)) return node.flatMap(texts)
  if (typeof node === "object" && "props" in (node as object)) {
    const props = (node as { props: Record<string, unknown> }).props
    return Object.values(props).flatMap((v) => (typeof v === "object" || typeof v === "string" ? texts(v) : []))
  }
  return []
}

async function reason(p: Promise<unknown>): Promise<unknown> {
  try { await p; return "resolved" } catch (e) { return e }
}

describe("O-26 step D: dataErrorMessage", () => {
  it("outage and rate limit → friendly text, never the raw message", () => {
    const rl = Object.assign(new Error("Rate limit exceeded for x"), { name: "RateLimitError" })
    expect(dataErrorMessage(fault(), "Failed to load events")).toBe("Data temporarily unavailable. Please try again shortly.")
    expect(dataErrorMessage(rl, "Failed to load events")).toBe("Data temporarily unavailable. Please try again shortly.")
    expect(dataErrorMessage(new Error("TypeError: x is undefined"), "Failed to load events")).toBe("Failed to load events")
  })

  it("no page renders a raw err.message as its error text", () => {
    for (const f of ["app/events/page.tsx", "app/leagues/page.tsx", "app/players/page.tsx", "app/teams/page.tsx"]) {
      expect(readFileSync(f, "utf8"), `${f} must not show err.message to visitors`).not.toMatch(/error = err instanceof Error \? err\.message/)
    }
  })
})

describe("O-26 step D: detail pages", () => {
  beforeEach(() => { vi.resetModules(); getFixture.mockReset(); lookupEvent.mockReset() })

  it("events/[id]: an outage is an error, not a 404", async () => {
    getFixture.mockRejectedValue(fault())
    const { default: EventPage } = await import("@/app/events/[id]/page")
    const e = await reason(EventPage({ params: { id: "123" } }))
    expect(isNotFound(e), "outage must not become notFound()").toBe(false)
    expect(isUpstreamFault(e)).toBe(true)
  })

  it("events/[id]: an event that does not exist is still a 404", async () => {
    getFixture.mockResolvedValue(null)
    const { default: EventPage } = await import("@/app/events/[id]/page")
    const e = await reason(EventPage({ params: { id: "123" } }))
    expect(isNotFound(e)).toBe(true)
  })

  it("match/[id]: an outage is an error, not a 404", async () => {
    lookupEvent.mockRejectedValue(fault())
    const { default: MatchPage } = await import("@/app/match/[id]/page")
    const e = await reason(MatchPage({ params: { id: "123" } }))
    expect(isNotFound(e)).toBe(false)
    expect(isUpstreamFault(e)).toBe(true)
  })

  it("match/[id]: a match that does not exist is still a 404", async () => {
    lookupEvent.mockResolvedValue(null)
    const { default: MatchPage } = await import("@/app/match/[id]/page")
    const e = await reason(MatchPage({ params: { id: "123" } }))
    expect(isNotFound(e)).toBe(true)
  })
})

describe("O-26 step D: watch/[slug] keeps rendering during an outage", () => {
  beforeEach(() => { vi.resetModules(); getFixtures.mockReset(); getStandings.mockReset() })

  it("fixtures fault → the page renders and says fixtures are unavailable (not 'No upcoming fixtures')", async () => {
    getFixtures.mockRejectedValue(fault())
    getStandings.mockResolvedValue([])
    const { default: WatchLeaguePage } = await import("@/app/watch/[slug]/page")
    const tree = (await WatchLeaguePage({ params: { slug: "premier-league" } })) as ReactNode
    const all = texts(tree).join(" ")
    expect(all).toMatch(/temporarily unavailable/i)
    expect(all).not.toContain("No upcoming fixtures scheduled right now.")
  })
})
