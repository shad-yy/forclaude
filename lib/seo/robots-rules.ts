/**
 * Which of `agents` a robots.txt blocks from the whole site.
 *
 * A crawler obeys exactly one group of rules (RFC 9309 §2.2.1, which Google
 * follows): every group whose User-agent line names it, merged; only if no
 * group names it, the `*` group. So "Disallow: /" under GPTBot says nothing
 * about Googlebot, and a check that fails on any "Disallow: /" line cannot
 * tell blocking an AI-training crawler from blocking Google.
 *
 * "Whole site" means the root path is disallowed and not re-allowed: for
 * rules of equal length, the allow wins (RFC 9309 §2.2.2).
 */
export function agentsBlockedFromSite(robotsTxt: string, agents: string[]): string[] {
  const groups = parseGroups(robotsTxt)

  return agents.filter((agent) => {
    const name = agent.toLowerCase()
    const named = groups.filter((g) => g.agents.includes(name))
    const applying = named.length > 0 ? named : groups.filter((g) => g.agents.includes("*"))
    const rules = applying.flatMap((g) => g.rules)

    const rootDisallowed = rules.some((r) => r.type === "disallow" && WHOLE_SITE.has(r.path))
    const rootAllowed = rules.some((r) => r.type === "allow" && WHOLE_SITE.has(r.path))
    return rootDisallowed && !rootAllowed
  })
}

const WHOLE_SITE = new Set(["/", "/*"])

type Rule = { type: "allow" | "disallow"; path: string }
type Group = { agents: string[]; rules: Rule[] }

/** Consecutive User-agent lines share the rules that follow them. */
function parseGroups(robotsTxt: string): Group[] {
  const groups: Group[] = []
  let current: Group | undefined

  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim()
    const colon = line.indexOf(":")
    if (colon === -1) continue

    const field = line.slice(0, colon).trim().toLowerCase()
    const value = line.slice(colon + 1).trim()

    if (field === "user-agent") {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] }
        groups.push(current)
      }
      current.agents.push(value.toLowerCase())
    } else if ((field === "allow" || field === "disallow") && current && value !== "") {
      current.rules.push({ type: field, path: value })
    }
  }

  return groups
}
