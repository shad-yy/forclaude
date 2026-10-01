// C-03 — Zod schemas for TheSportsDB API v1 responses.
//
// Purpose per `contract-tests-recorded-captures`: pin the exact shape
// this app expects from the upstream so a silent field rename or
// missing-required-field silently corrupts nothing — parse fails
// loudly at the seam and the contract test flags it before the
// integration downstream does.
//
// Pragmatic looseness: TheSportsDB is chatty and inconsistent —
// numbers sometimes arrive as strings, optional fields can be `null`
// or the string `"null"`, and payload rows may add new fields we
// don't reference. So:
//   - Required fields (the ones resolvers actually read) → required.
//   - Optional fields → `.optional().nullable()` where the upstream
//     is known to omit or null them.
//   - Unknown extra fields → passed through (`.passthrough()`) so a
//     new field doesn't fail the parse; a resolver that references
//     the new field would just get `unknown`, no data loss.

import { z } from "zod"

// A field that could be a real string, missing (undefined), or `null`.
const optionalNullableString = z.string().nullable().optional()
const optionalNullableNumberish = z.union([z.string(), z.number()]).nullable().optional()

// ─── /lookupleague.php?id=... — one League row per row ───────────

export const SportsDbLeagueSchema = z
  .object({
    idLeague: z.string().min(1),
    strLeague: z.string().min(1),
    strSport: z.string().min(1),

    strLeagueAlternate: optionalNullableString,
    strCountry: optionalNullableString,
    strDescriptionEN: optionalNullableString,
    intFormedYear: optionalNullableNumberish,
    strBadge: optionalNullableString,
    strLogo: optionalNullableString,
    strFanart1: optionalNullableString,
    strFanart2: optionalNullableString,
    strFanart3: optionalNullableString,
    strFanart4: optionalNullableString,
    strBanner: optionalNullableString,
    strNaming: optionalNullableString,
    strLocked: optionalNullableString,
  })
  .passthrough()

export type SportsDbLeague = z.infer<typeof SportsDbLeagueSchema>

// TheSportsDB always wraps rows in `{ leagues: [...] }` (or the top-
// level key is `null` when there are zero results — hence nullable).
export const LookupLeagueResponseSchema = z
  .object({
    leagues: z.array(SportsDbLeagueSchema).nullable(),
  })
  .passthrough()

// ─── /eventsday.php?d=YYYY-MM-DD — array of Event rows ───────────

export const SportsDbEventSchema = z
  .object({
    idEvent: z.string().min(1),
    strEvent: z.string().min(1),
    strSport: z.string().min(1),
    idLeague: z.string().min(1),
    strLeague: z.string().min(1),
    strSeason: z.string(),
    strHomeTeam: z.string(),
    strAwayTeam: z.string(),
    idHomeTeam: z.string(),
    idAwayTeam: z.string(),
    dateEvent: z.string(),

    // The rest is a soup of optional/nullable fields — the resolvers
    // consult them but a missing value never breaks a caller.
    strEventAlternate: optionalNullableString,
    strFilename: optionalNullableString,
    strDescriptionEN: optionalNullableString,
    intHomeScore: optionalNullableNumberish,
    intAwayScore: optionalNullableNumberish,
    intRound: optionalNullableNumberish,
    strOfficial: optionalNullableString,
    strTimestamp: optionalNullableString,
    strDate: optionalNullableString,
    strTime: optionalNullableString,
    strTimeLocal: optionalNullableString,
    strTVStation: optionalNullableString,
    strHomeTeamBadge: optionalNullableString,
    strAwayTeamBadge: optionalNullableString,
    strResult: optionalNullableString,
    strVenue: optionalNullableString,
    strCountry: optionalNullableString,
    strCity: optionalNullableString,
    strPoster: optionalNullableString,
    strSquare: optionalNullableString,
    strFanart: optionalNullableString,
    strThumb: optionalNullableString,
    strBanner: optionalNullableString,
    strMap: optionalNullableString,
    strTweet1: optionalNullableString,
    strTweet2: optionalNullableString,
    strTweet3: optionalNullableString,
    strVideo: optionalNullableString,
    strStatus: optionalNullableString,
    strPostponed: optionalNullableString,
    strLocked: optionalNullableString,
    dateEventLocal: optionalNullableString,
    strCapacity: optionalNullableString,
    intSpectators: optionalNullableNumberish,
  })
  .passthrough()

export type SportsDbEvent = z.infer<typeof SportsDbEventSchema>

export const EventsDayResponseSchema = z
  .object({
    events: z.array(SportsDbEventSchema).nullable(),
  })
  .passthrough()
