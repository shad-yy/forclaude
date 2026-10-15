// C-03 — Zod schema for NewsData.io's `/api/1/news` response, per
// `contract-tests-recorded-captures`. Field names and the wrapper
// shape ({status, totalResults, results}) match NewsData.io's public
// documentation (newsdata.io/documentation) and the pre-existing
// `NewsArticle` interface in `lib/api/news.ts`, which this schema
// formalises into a runtime check.
//
// Same pragmatic-looseness posture as the TheSportsDB schemas:
// required fields the app actually reads are required; fields
// NewsData.io is known to return as `null` are `.nullable()`;
// unknown extra fields pass through.

import { z } from "zod"

export const NewsDataArticleSchema = z
  .object({
    article_id: z.string().min(1),
    title: z.string().min(1),
    link: z.string().min(1),
    pubDate: z.string().min(1),

    description: z.string().nullable(),
    source_name: z.string().nullable(),
    source_icon: z.string().nullable(),
    image_url: z.string().nullable(),
    category: z.array(z.string()).nullable(),
    language: z.string().nullable(),
    country: z.array(z.string()).nullable(),
    creator: z.array(z.string()).nullable(),
  })
  .passthrough()

export type NewsDataArticle = z.infer<typeof NewsDataArticleSchema>

// NewsData.io wraps results as {status, totalResults, results}. A
// non-"success" status (e.g. "error") is a real API-reported failure,
// not merely an absence — `lib/api/news.ts` already checks
// `data.status !== 'success'` and treats it as a fault (falls back to
// FALLBACK_ARTICLES). The schema only validates the success shape;
// callers still branch on `status` themselves.
export const NewsDataResponseSchema = z
  .object({
    status: z.string(),
    totalResults: z.number(),
    results: z.array(NewsDataArticleSchema).nullable(),
  })
  .passthrough()
