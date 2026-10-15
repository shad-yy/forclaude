// C-03 — Zod schema for football-data.org API v4's `/competitions/
// {id}/matches` response, per `contract-tests-recorded-captures`.
// Field names and the wrapper shape ({matches: [...]}) match
// football-data.org's public documentation
// (football-data.org/documentation/api) and the pre-existing FDMatch
// interface in `lib/api/football-data.ts`, which this schema
// formalises into a runtime check.
//
// Scope: only the `matches` endpoint — the only one this app
// actually calls (`getUEFAMatches` / `getUEFAResults`). `FDStanding`
// exists in football-data.ts but has no live caller, so it is not
// given a schema here (would be encoding a guess about an endpoint
// nothing in the app exercises).

import { z } from "zod"

const FDTeamSchema = z
  .object({
    id: z.number(),
    name: z.string().min(1),
    crest: z.string(),
  })
  .passthrough()

export const FDMatchSchema = z
  .object({
    id: z.number(),
    utcDate: z.string().min(1),
    status: z.string().min(1),
    stage: z.string(),
    homeTeam: FDTeamSchema,
    awayTeam: FDTeamSchema,
    score: z
      .object({
        fullTime: z.object({
          home: z.number().nullable(),
          away: z.number().nullable(),
        }),
      })
      .passthrough(),
    venue: z.string().optional(),
  })
  .passthrough()

export type FDMatch = z.infer<typeof FDMatchSchema>

export const FDMatchesResponseSchema = z
  .object({
    matches: z.array(FDMatchSchema),
  })
  .passthrough()
