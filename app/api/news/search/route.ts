// B-02 — server-side proxy for `newsAPI.searchNews`. Retires the
// last remaining PATTERNS.md non-negotiable violation (S-01):
// `app/news/NewsClientPage.tsx` was `"use client"` and imported
// `@/lib/api/news` directly, shipping the news scraper and its
// dependencies into the browser bundle.
//
// Response shape matches the client's `NewsResponse` type so the
// migration in NewsClientPage is a one-liner: replace
// `newsAPI.searchNews(params)` with
// `fetch("/api/news/search?...").then(r => r.json())`.

import { NextResponse } from "next/server"
import { z } from "zod"
import { newsAPI } from "@/lib/api/news"

const querySchema = z.object({
  q: z.string().trim().min(1).max(200).default("sports"),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
})

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const parsed = querySchema.safeParse({
      q: url.searchParams.get("q") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    })
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      )
    }

    const response = await newsAPI.searchNews({
      q: parsed.data.q,
      pageSize: parsed.data.pageSize,
    })

    return NextResponse.json(response, {
      headers: {
        // Short SWR — the underlying scraper does its own caching too,
        // so this is a thin edge cache for burst identical queries.
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    // Fault, not absence (api-fault-vs-absence): 503 + no-store so the
    // client shows "temporarily unavailable" instead of silently
    // rendering an empty state that looks like "no results found".
    console.warn("[API] GET /api/news/search fault:", error)
    return NextResponse.json(
      { error: "News search temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}
