import { NextResponse } from "next/server"
import { getLatestSportsNews } from "@/lib/api/news"

/**
 * Nuclear dedup — catches duplicates by URL, normalized title,
 * image URL (sans query-string), and description content hash.
 * If ANY single key matches a previously-seen article, it's a duplicate.
 */
function nuclearDedup(articles: any[]): any[] {
  if (!articles?.length) return []

  const seen = new Map<string, boolean>()

  return articles.filter(article => {
    if (!article) return false

    // Key 1: exact URL
    const url = (article.link || article.url || '').trim()

    // Key 2: title normalized to 40 chars
    const title = (article.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 40)

    // Key 3: image URL (remove query params for CDN variants)
    const img = (article.image_url || article.urlToImage || '')
      .split('?')[0]
      .trim()

    // Key 4: first 60 chars of description
    const desc = (article.description || article.content || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 60)

    // Any of these keys being a repeat = duplicate
    const keys = [
      url && `url:${url}`,
      title && title.length > 10 && `title:${title}`,
      img && `img:${img}`,
      desc && desc.length > 20 && `desc:${desc}`,
    ].filter(Boolean) as string[]

    // Check if ANY key has been seen before
    const isDuplicate = keys.some(k => seen.has(k))
    if (isDuplicate) return false

    // Mark all keys as seen
    keys.forEach(k => seen.set(k, true))
    return true
  })
}

export async function GET(request: Request) {
  try {
    const rawArticles = await getLatestSportsNews()
    const deduped = nuclearDedup(rawArticles)

    return NextResponse.json({
      status: "success",
      articles: deduped.slice(0, 10),
      totalResults: deduped.length,
    })
  } catch (error) {
    return NextResponse.json(
      { status: "error", articles: [], totalResults: 0 },
      { status: 500 }
    )
  }
}
