"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { newsAPI, type NewsArticle } from "@/lib/api/news"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Clock, ExternalLink, TrendingUp } from 'lucide-react'
import Link from "next/link"

interface TrendingNewsProps {
  keywords: string[]
}

export function TrendingNews({ keywords }: TrendingNewsProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const safeKeywords = Array.isArray(keywords) ? keywords : []

  useEffect(() => {
    const fetchTrendingNews = async () => {
      try {
        setLoading(true)
        setError(null)
        const trendingArticles = await newsAPI.getTrendingSportsNews()
        setArticles(Array.isArray(trendingArticles) ? trendingArticles : [])
      } catch (err) {
        console.error("Failed to fetch trending news:", err)
        setError(err instanceof Error ? err.message : "Failed to load trending news")
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingNews()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <CardTitle>Trending Sports News</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <CardTitle>Trending Sports News</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load trending news. Please try again later.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <CardTitle>Trending Sports News</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {articles.length > 0 ? (
            articles.slice(0, 5).map((article, index) => (
              <article key={article.id || `${article.url}-${index}`} className="group">
                <div className="flex gap-4">
                  {article.urlToImage && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <OptimizedImage
                        src={article.urlToImage}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                      <Link href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-1">
                        {article.title}
                        <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{article.source?.name || 'Unknown Source'}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    {(() => {
                      const categories = Array.isArray(article.category)
                        ? article.category
                        : typeof article.category === 'string'
                        ? [article.category]
                        : []

                      return categories.length > 0 ? (
                        <div className="flex gap-1 mt-2">
                          {categories.slice(0, 2).map((cat: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs px-2 py-0">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
                {index < articles.length - 1 && <hr className="mt-6 border-gray-800" />}
              </article>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No trending news available at the moment.</p>
          )}
        </CardContent>
      </Card>

      {/* Trending Keywords */}
      {safeKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {safeKeywords.slice(0, 8).map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {safeKeywords.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No trending topics available at the moment.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
