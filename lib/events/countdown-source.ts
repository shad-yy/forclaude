/**
 * Event sources for the homepage countdown.
 *
 * Kept out of the component so the selection rules can be tested without
 * rendering React. See tests/event-countdown-source.test.ts.
 */

export interface CountdownEvent {
  name: string
  date: Date
  href: string
  sport: string
  badge: string
}

/** The countdown only shows an event this many days ahead or nearer. */
export const COUNTDOWN_WINDOW_DAYS = 14

export function withinCountdownWindow(date: Date, now: number): boolean {
  const daysAway = (date.getTime() - now) / (1000 * 60 * 60 * 24)
  return daysAway > 0 && daysAway <= COUNTDOWN_WINDOW_DAYS
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null
}

/** `status.type.completed === true` on an ESPN event or competition. */
function isCompleted(node: Record<string, unknown> | null): boolean {
  const type = asRecord(asRecord(node?.status)?.type)
  return type?.completed === true
}

function parseDate(value: unknown): Date | null {
  const raw = asString(value)
  if (!raw) return null
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Pick the next UFC card from ESPN's MMA scoreboard.
 *
 * A UFC event is a single card, so the event's own date and status are the
 * right fields to read here.
 */
export function pickNextUfcEvent(scoreboard: unknown, now: number): CountdownEvent | null {
  for (const raw of asArray(asRecord(scoreboard)?.events)) {
    const event = asRecord(raw)
    if (!event || isCompleted(event)) continue
    const date = parseDate(event.date)
    if (!date || !withinCountdownWindow(date, now)) continue
    return {
      name: asString(event.name) ?? asString(event.shortName) ?? "UFC Event",
      date,
      href: "/ufc",
      sport: "UFC",
      badge: "/leagues/ufc.png",
    }
  }
  return null
}

/**
 * Pick the next F1 race from ESPN's racing scoreboard.
 *
 * ESPN models a race weekend as one event whose top-level `date` is first
 * practice and whose status flips to completed once practice and the sprint
 * are done. Reading those two fields hides Sunday's race from Friday morning
 * onwards — the bug that left the homepage countdown with nothing to show.
 * The race itself is a competition inside the event, carrying its own start
 * time and status, so select that instead.
 */
export function pickNextF1Race(scoreboard: unknown, now: number): CountdownEvent | null {
  let best: CountdownEvent | null = null

  for (const rawEvent of asArray(asRecord(scoreboard)?.events)) {
    const event = asRecord(rawEvent)
    if (!event) continue

    for (const rawCompetition of asArray(event.competitions)) {
      const competition = asRecord(rawCompetition)
      if (!competition) continue
      // "Race" is the grand prix itself; FP1/SS/SR/Qual are support sessions.
      if (asRecord(competition.type)?.abbreviation !== "Race") continue
      if (isCompleted(competition)) continue

      const date = parseDate(competition.date) ?? parseDate(competition.startDate)
      if (!date || !withinCountdownWindow(date, now)) continue

      const candidate: CountdownEvent = {
        name: asString(event.shortName) ?? asString(event.name) ?? "F1 Race",
        date,
        href: "/watch/formula-1",
        sport: "F1",
        badge: "/leagues/formula-1.png",
      }
      if (!best || candidate.date.getTime() < best.date.getTime()) best = candidate
    }
  }

  return best
}

/** The soonest of whatever the callers managed to find. */
export function soonest(...candidates: (CountdownEvent | null)[]): CountdownEvent | null {
  return candidates
    .filter((e): e is CountdownEvent => e !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0] ?? null
}
