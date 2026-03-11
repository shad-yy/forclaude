import { NextResponse } from "next/server"
import { getLatestSportsNews } from "@/lib/api/news"

export async function GET(request: Request) {
  try {
    const articles = await getLatestSportsNews()
    return NextResponse.json({ status: "success", articles, totalResults: articles.length })
  } catch (error) {
    return NextResponse.json({ status: "error", articles: [], totalResults: 0 }, { status: 500 })
  }
}
