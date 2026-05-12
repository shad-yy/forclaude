import { Card, CardContent } from "@/components/ui/card"
import { getLatestSportsNews } from "@/lib/api/news"
import { Newspaper } from "lucide-react"
import { NewsCarousel } from "./news-carousel"

interface NewsSectionProps {
  maxArticles?: number
}



export async function NewsSection({ maxArticles = 6 }: NewsSectionProps) {
  const allArticles = await getLatestSportsNews(undefined, maxArticles);

  // Nuclear dedup at component level — final safety net
  const seen = new Set<string>()
  const uniqueArticles = (allArticles || []).filter((a: any) => {
    const key = (a.title || '').toLowerCase()
      .replace(/[^a-z0-9]/g, '').slice(0, 40)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

  const articles = uniqueArticles.slice(0, maxArticles);

  if (!articles || articles.length === 0) {
    return (
      <Card className="bg-surface border-border">
        <CardContent className="p-8 text-center">
          <Newspaper className="w-12 h-12 mx-auto mb-4 text-text-muted" />
          <p className="text-text-secondary">No news available at the moment</p>
        </CardContent>
      </Card>
    )
  }

  return <NewsCarousel articles={articles} />
}
