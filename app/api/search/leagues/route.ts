import { NextResponse } from "next/server"
import { theSportsDB } from "@/lib/api/the-sports-db"

export async function GET(request: Request) {
  let timer: any
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""
    if (!q || q.length < 2 || q.length > 64) return NextResponse.json([])
    
    const controller = new AbortController()
    timer = setTimeout(() => controller.abort(), 8000)
    
    const leagues = await theSportsDB.searchLeagues(q)
    return NextResponse.json(
      leagues.map((l) => ({ 
        id: l.idLeague, 
        name: l.strLeague, 
        sport: l.strSport, 
        country: l.strCountry || null 
      })),
    )
  } catch (e) {
    console.warn("[API] GET /api/search/leagues failed:", e)
    return NextResponse.json([]) // Return empty array instead of error
  } finally {
    if (timer) clearTimeout(timer)
  }
}


