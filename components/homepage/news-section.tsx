"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { newsAPI, type NewsArticle } from "@/lib/api/news"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Clock, ExternalLink, TrendingUp, Newspaper, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface NewsSectionProps {
  maxArticles?: number
}

export function NewsSection({ maxArticles = 6 }: NewsSectionProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        setError(null)
        const newsData = await newsAPI.getNews({ category: "sports", page: "1" })
        setArticles(Array.isArray(newsData.articles) ? newsData.articles.slice(0, maxArticles) : [])
      } catch (err) {
        console.error("Failed to fetch news:", err)
        setError(err instanceof Error ? err.message : "Failed to load news")
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [maxArticles])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (error || articles.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-8 text-center">
          <Newspaper className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No news available at the moment</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Trending Sports News</h2>
            <p className="text-sm text-gray-400">Stay updated with the latest stories</p>
          </div>
        </div>
        <Button asChild variant="outline" className="bg-transparent">
          <Link href="/news" className="flex items-center gap-2">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <motion.div
            key={article.id || `${article.url}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={article.url} target="_blank" rel="noopener noreferrer">
              <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 group h-full flex flex-col">
                {article.urlToImage && (
                  <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                    <OptimizedImage
                      src={article.urlToImage}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {article.source.name}
                    </Badge>
                    {article.publishedAt && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>
                  {article.description && (
                    <p className="text-sm text-gray-400 line-clamp-3 flex-1 mb-4">
                      {article.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-blue-400 mt-auto">
                    <span>Read more</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

