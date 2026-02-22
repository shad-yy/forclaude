import { NextResponse } from "next/server"
import { newsAPI } from "@/lib/api/news"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || "sports"
    const resp = await newsAPI.searchNews({ q, pageSize: 5 })
    return NextResponse.json(resp.articles)
  } catch (e) {
    console.warn("[API] GET /api/search/news failed:", e)
    return NextResponse.json([]) // Return empty array instead of error
  }
}


