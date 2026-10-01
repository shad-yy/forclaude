// B-02 — server-side proxy for `newsAPI.getTrendingSportsNews`.
// Companion to `/api/news/search`; see that route for the S-01 fix
// context. Response is the raw `SharedNewsArticle[]` shape the
// client already expected, so the migration in `NewsClientPage.tsx`
// is a one-liner: replace the direct call with
// `fetch("/api/news/trending").then(r => r.json())`.

import { NextResponse } from "next/server"
import { newsAPI } from "@/lib/api/news"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const trending = await newsAPI.getTrendingSportsNews()
    return NextResponse.json(
      { articles: trending },
      {
        headers: {
          // Trending changes slowly; a 5-min edge cache is fine.
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    )
  } catch (error) {
    console.warn("[API] GET /api/news/trending fault:", error)
    return NextResponse.json(
      { error: "Trending news temporarily unavailable — we could not check just now." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}
