import { NextResponse } from "next/server"
import { getLatestSportsNews } from "@/lib/api/news"

function deduplicateArticles(articles: any[]): any[] {
  const seenUrls = new Set<string>()
  const seenTitles = new Set<string>()
  const seenImages = new Set<string>()
  
  return articles.filter(article => {
    // URL dedup
    const url = article.link || article.url || ''
    if (url && seenUrls.has(url)) return false
    
    // Title dedup (normalize aggressively)
    const titleKey = (article.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 50)
    if (titleKey && seenTitles.has(titleKey)) return false
    
    // Image dedup (same image = same story from different source)
    const img = article.image_url || article.urlToImage || ''
    if (img && seenImages.has(img)) return false
    
    // Add to seen
    if (url) seenUrls.add(url)
    if (titleKey) seenTitles.add(titleKey)
    if (img) seenImages.add(img)
    
    return true
  })
}

export async function GET(request: Request) {
  try {
    const articles = await getLatestSportsNews()
    const uniqueArticles = deduplicateArticles(articles)

    return NextResponse.json({ status: "success", articles: uniqueArticles, totalResults: uniqueArticles.length })
  } catch (error) {
    return NextResponse.json({ status: "error", articles: [], totalResults: 0 }, { status: 500 })
  }
}
