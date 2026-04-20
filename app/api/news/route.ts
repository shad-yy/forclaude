import { NextResponse } from "next/server"
import { getLatestSportsNews } from "@/lib/api/news"

export async function GET(request: Request) {
  try {
    const articles = await getLatestSportsNews()
    
    const seen = new Set<string>()
    const seenUrls = new Set<string>()
    const uniqueArticles = articles.filter(article => {
      const url = article.link || (article as any).url
      if (url && seenUrls.has(url)) return false
      if (url) seenUrls.add(url)
      
      const key = (article.title || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 60)
      
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })

    return NextResponse.json({ status: "success", articles: uniqueArticles, totalResults: uniqueArticles.length })
  } catch (error) {
    return NextResponse.json({ status: "error", articles: [], totalResults: 0 }, { status: 500 })
  }
}
