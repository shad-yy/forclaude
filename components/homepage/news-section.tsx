import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getLatestSportsNews } from "@/lib/api/news"
import { Clock, TrendingUp, Newspaper, ArrowRight } from "lucide-react"
import Link from "next/link"
import { NewsImage } from "./news-image"

interface NewsSectionProps {
  maxArticles?: number
}

const CATEGORY_COLORS: Record<string, string> = {
  'Premier League': 'bg-blue-600 text-white',
  'Transfers': 'bg-purple-600 text-white',
  'Champions League': 'bg-indigo-600 text-white',
  'La Liga': 'bg-red-600 text-white',
  'Serie A': 'bg-green-700 text-white',
  'Bundesliga': 'bg-red-500 text-white',
  'Ligue 1': 'bg-yellow-500 text-black',
  'UFC': 'bg-red-700 text-white',
  'default': 'bg-accent-primary text-black'
}

/** Normalise "champions league" → "Champions League" for colour lookup */
function toTitleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

function getCategoryBadge(categoryName: string): string {
  const normalised = toTitleCase(categoryName)
  return CATEGORY_COLORS[normalised] || CATEGORY_COLORS['default']
}

export async function NewsSection({ maxArticles = 6 }: NewsSectionProps) {
  const allArticles = await getLatestSportsNews(undefined, maxArticles);

  let rawArticles = allArticles;
  const seen = new Set<string>()
  const seenUrls = new Set<string>()
  let uniqueArticles = rawArticles.filter(article => {
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

  let articles = uniqueArticles.slice(0, maxArticles);
  while (articles.length > 0 && articles.length < maxArticles) {
    articles = [...articles, ...articles].slice(0, maxArticles);
  }

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-xl border border-accent-primary/20">
            <TrendingUp className="w-6 h-6 text-accent-primary" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">Trending Sports News</h2>
            <p className="text-sm md:text-base text-text-secondary mt-1">Stay updated with the latest stories</p>
          </div>
        </div>
        <Button asChild variant="outline" className="hidden sm:flex bg-transparent border-border hover:bg-surface-elevated hover:text-accent-primary transition-colors">
          <Link href="/news" className="flex items-center gap-2 font-semibold">
            View All News
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article, index) => {
          const categoryName = article.category?.[0] || article.source_name || "News";
          const badgeClass = getCategoryBadge(categoryName);

          return (
            <div
              key={article.article_id || `${article.link}-${index}`}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
            >
              <a href={article.link} target="_blank" rel="noopener noreferrer" className="block h-[450px] group">
                <Card className="bg-surface border-border hover:border-accent-primary transition-all duration-300 h-full flex flex-col overflow-hidden shadow-lg group-hover:shadow-[0_0_20px_rgba(0,230,118,0.15)]">
                  {/* Top 50%: Image */}
                  <div className="h-1/2 w-full overflow-hidden bg-surface-elevated relative">
                    {article.image_url ? (
                      <NewsImage
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface to-surface-elevated text-text-muted">
                        <Newspaper className="w-12 h-12 mb-2 opacity-30" />
                      </div>
                    )}
                    {/* Category Badge over image */}
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className={`px-2.5 py-1 text-xs font-bold border-none ${badgeClass}`}>
                        {categoryName}
                      </Badge>
                    </div>
                  </div>

                  {/* Bottom 50%: Content */}
                  <CardContent className="h-1/2 p-6 flex flex-col bg-surface relative z-10">
                    <div className="flex items-center gap-1 text-xs text-text-muted mb-3 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{article.pubDate ? new Date(article.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
                    </div>

                    <h3 className="font-bold text-text-primary text-lg leading-tight mb-2 line-clamp-2 group-hover:text-accent-primary transition-colors">
                      {article.title}
                    </h3>

                    {article.description && (
                      <p className="text-sm text-text-secondary line-clamp-3 mb-4 flex-1">
                        {article.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm font-bold text-accent-primary mt-auto pt-2 transition-colors">
                      <span>Stream This Match</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            </div>
          )
        })}
      </div>

      <Button asChild variant="outline" className="w-full sm:hidden bg-transparent border-border hover:bg-surface-elevated hover:text-accent-primary transition-colors mt-4">
        <Link href="/news" className="flex items-center justify-center gap-2 font-semibold">
          View All News
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  )
}
