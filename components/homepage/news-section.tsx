"use client"
import { useState, useEffect } from "react"
import { NewsCarousel } from "./news-carousel"

interface NewsArticle {
  title: string
  description?: string
  image_url?: string
  link?: string
  source_id?: string
  pubDate?: string
  category?: string[]
}

interface NewsSectionProps {
  maxArticles?: number
}

export function NewsSection({ maxArticles = 12 }: NewsSectionProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        const items = data?.articles || data?.results || []
        
        // Deduplicate
        const seen = new Set<string>()
        const unique = items.filter((a: NewsArticle) => {
          const key = (a.title || '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .slice(0, 40)
          if (!key || seen.has(key)) return false
          seen.add(key)
          return true
        })
        
        setArticles(unique.slice(0, maxArticles))
      })
      .catch(() => {
        // Keep empty — no fallback blogs
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    
    return () => { cancelled = true }
  }, [maxArticles])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              Trending Sports News
            </h2>
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1,2,3].map(i => (
            <div key={i}
              className="flex-none w-[280px] sm:w-[320px] 
                bg-[#12121a] border border-[#2a2a3a] 
                rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!articles.length) return null

  return <NewsCarousel articles={articles} />
}
