// The homepage countdown went blank because its live F1 lookup could not
// see Sunday's race.
//
// ESPN models a grand prix weekend as ONE event whose top-level `date` is
// first practice and whose `status.type.completed` turns true once practice
// and the sprint have run. From Friday morning the old code therefore
// skipped the weekend entirely (completed, and the date is in the past) and
// fell through to a hardcoded list — whose last entry was 2026-10-11, after
// which the component rendered nothing at all.
//
// The payload below is trimmed from the live response of
// https://smartlivetv.co.uk/api/espn/racing/f1/scoreboard on 2026-10-10:
// the Singapore GP, with practice and sprint qualifying already final and
// the race scheduled for 2026-10-11T12:00Z.

import { describe, it, expect } from "vitest"
import {
  pickNextF1Race,
  pickNextUfcEvent,
  soonest,
  withinCountdownWindow,
} from "@/lib/events/countdown-source"

const FINAL = { type: { name: "STATUS_FINAL", completed: true } }
const SCHEDULED = { type: { name: "STATUS_SCHEDULED", completed: false } }

const SINGAPORE_SCOREBOARD = {
  events: [
    {
      id: "600057445",
      date: "2026-10-09T08:30Z",
      name: "Singapore Airlines Singapore Grand Prix",
      shortName: "Singapore Airlines Singapore GP",
      // The weekend as a whole already reads as finished.
      status: FINAL,
      competitions: [
        { type: { abbreviation: "FP1" }, date: "2026-10-09T08:30Z", status: FINAL },
        { type: { abbreviation: "SS" }, date: "2026-10-09T12:30Z", status: FINAL },
        { type: { abbreviation: "SR" }, date: "2026-10-10T09:00Z", status: SCHEDULED },
        { type: { abbreviation: "Qual" }, date: "2026-10-10T13:00Z", status: SCHEDULED },
        { type: { abbreviation: "Race" }, date: "2026-10-11T12:00Z", status: SCHEDULED },
      ],
    },
  ],
}

// Saturday 2026-10-10, 02:00 UTC — practice done, race still to come.
const SATURDAY = new Date("2026-10-10T02:00:00Z").getTime()

describe("pickNextF1Race", () => {
  it("finds Sunday's race even though the weekend reads as completed", () => {
    const race = pickNextF1Race(SINGAPORE_SCOREBOARD, SATURDAY)
    expect(race, "the race session must be found inside a 'completed' weekend").not.toBeNull()
    expect(race?.date.toISOString()).toBe("2026-10-11T12:00:00.000Z")
    expect(race?.name).toBe("Singapore Airlines Singapore GP")
    expect(race?.href).toBe("/watch/formula-1")
  })

  it("ignores practice, sprint and qualifying sessions", () => {
    // Qualifying (13:00Z Saturday) is sooner than the race but must not win.
    const race = pickNextF1Race(SINGAPORE_SCOREBOARD, SATURDAY)
    expect(race?.date.toISOString()).not.toBe("2026-10-10T13:00:00.000Z")
  })

  it("returns null once the race itself is final", () => {
    const after = {
      events: [
        {
          ...SINGAPORE_SCOREBOARD.events[0],
          competitions: SINGAPORE_SCOREBOARD.events[0].competitions.map((c) =>
            c.type.abbreviation === "Race" ? { ...c, status: FINAL } : c,
          ),
        },
      ],
    }
    expect(pickNextF1Race(after, SATURDAY)).toBeNull()
  })

  it("survives a malformed or empty payload instead of throwing", () => {
    for (const bad of [null, undefined, {}, { events: null }, { events: [{}] }, "nope"]) {
      expect(pickNextF1Race(bad, SATURDAY)).toBeNull()
    }
  })
})

describe("pickNextUfcEvent", () => {
  it("reads the card's own date and status", () => {
    const card = pickNextUfcEvent(
      { events: [{ name: "UFC Fight Night", date: "2026-10-17T02:00:00Z", status: SCHEDULED }] },
      SATURDAY,
    )
    expect(card?.name).toBe("UFC Fight Night")
    expect(card?.sport).toBe("UFC")
  })

  it("skips a finished card", () => {
    const card = pickNextUfcEvent(
      { events: [{ name: "Old card", date: "2026-10-17T02:00:00Z", status: FINAL }] },
      SATURDAY,
    )
    expect(card).toBeNull()
  })
})

describe("window and ordering", () => {
  it("only accepts events in the next 14 days", () => {
    expect(withinCountdownWindow(new Date("2026-10-11T12:00:00Z"), SATURDAY)).toBe(true)
    expect(withinCountdownWindow(new Date("2026-10-09T12:00:00Z"), SATURDAY)).toBe(false)
    expect(withinCountdownWindow(new Date("2026-11-30T12:00:00Z"), SATURDAY)).toBe(false)
  })

  it("soonest() picks the nearest and tolerates nulls", () => {
    const race = pickNextF1Race(SINGAPORE_SCOREBOARD, SATURDAY)
    const later = pickNextUfcEvent(
      { events: [{ name: "Later card", date: "2026-10-18T02:00:00Z", status: SCHEDULED }] },
      SATURDAY,
    )
    expect(soonest(null, later, race)?.sport).toBe("F1")
    expect(soonest(null, null)).toBeNull()
  })
})
