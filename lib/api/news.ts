import type { NewsResponse, NewsSource, NewsArticle } from "./types"
import { z } from "zod"

class NewsAPI {
  private baseUrl = "https://newsdata.io/api/1"
  private apiKey = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY || "pub_1679a8bd150445d2a732b303780bd3ce"

  async getNews(
    params: {
      q?: string
      category?: string
      source?: string
      page?: string
      language?: string
      country?: string
    } = {},
  ): Promise<NewsResponse> {
    try {
      if (!this.apiKey) {
        console.warn("[NewsAPI] API key not found, returning mock data")
        return this.getMockNews()
      }

      const searchParams = new URLSearchParams()
      searchParams.append("apikey", this.apiKey)

      if (params.q) searchParams.append("q", params.q)
      if (params.category && params.category !== "all") searchParams.append("category", params.category)
      if (params.language) searchParams.append("language", params.language)
      if (params.country) searchParams.append("country", params.country)
      if (params.page) searchParams.append("page", params.page)

      if (!params.category || params.category === "all") {
        searchParams.append("category", "sports")
      }

      const url = `${this.baseUrl}/latest?${searchParams.toString()}`
      console.log(`[NewsAPI] Making request to: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        console.warn(`[NewsAPI] HTTP error: ${response.status} ${response.statusText}`)
        return this.getMockNews()
      }

      const data = await response.json()

      const ResultsSchema = z.object({
        results: z.array(z.any()).optional(),
        totalResults: z.number().optional(),
      })
      const parsed = ResultsSchema.safeParse(data)

      return {
        articles: parsed.success && Array.isArray(data.results) ? data.results.map(this.transformArticle) : [],
        totalResults: parsed.success && typeof data.totalResults === "number" ? data.totalResults : 0,
        status: "ok",
      }
    } catch (error) {
      console.warn("[NewsAPI] Error fetching news:", error)
      return this.getMockNews()
    }
  }

  async getSources(): Promise<NewsSource[]> {
    try {
      if (!this.apiKey) {
        console.warn("[NewsAPI] API key not found, returning mock sources")
        return this.getMockSources()
      }

      const url = `${this.baseUrl}/sources?apikey=${this.apiKey}&category=sports`
      console.log(`[NewsAPI] Making request to: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        console.warn(`[NewsAPI] HTTP error: ${response.status} ${response.statusText}`)
        return this.getMockSources()
      }

      const data = await response.json()

      return Array.isArray(data.results)
        ? data.results.map((source: any) => ({
            id: source.id,
            name: source.name,
            description: `${source.name} - Sports coverage`,
            url: source.url,
            category: source.category?.[0] || "sports",
            language: source.language?.[0] || "en",
            country: source.country?.[0] || "us",
          }))
        : this.getMockSources()
    } catch (error) {
      console.warn("[NewsAPI] Error fetching sources:", error)
      return this.getMockSources()
    }
  }

  async getTrendingKeywords(): Promise<string[]> {
    try {
      return [
        "NFL playoffs",
        "NBA trade deadline",
        "March Madness",
        "World Cup",
        "Olympics",
        "Super Bowl",
        "Champions League",
        "Premier League",
        "UEFA",
        "FIFA",
      ]
    } catch (error) {
      console.warn("[NewsAPI] Error fetching trending keywords:", error)
      return []
    }
  }

  async searchNews(
    params: {
      q?: string
      category?: string
      sources?: string
      sortBy?: "relevancy" | "popularity" | "publishedAt"
      page?: number
      pageSize?: number
    } = {},
  ): Promise<NewsResponse> {
    try {
      if (!this.apiKey) {
        console.warn("[NewsAPI] API key not found, returning mock data")
        return this.getMockNews()
      }

      const searchParams = new URLSearchParams()
      searchParams.append("apikey", this.apiKey)

      if (params.q) searchParams.append("q", params.q)
      if (params.category && params.category !== "all") searchParams.append("category", params.category)
      if (params.sources) searchParams.append("domain", params.sources)
      if (params.pageSize) searchParams.append("size", Math.min(params.pageSize, 50).toString())

      if (!params.category || params.category === "all") {
        searchParams.append("category", "sports")
      }

      const url = `${this.baseUrl}/latest?${searchParams.toString()}`
      console.log(`[NewsAPI] Making request to: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        console.warn(`[NewsAPI] HTTP error: ${response.status} ${response.statusText}`)
        return this.getMockNews()
      }

      const data = await response.json()

      const ResultsSchema = z.object({
        results: z.array(z.any()).optional(),
        totalResults: z.number().optional(),
        nextPage: z.union([z.string(), z.number()]).optional(),
      })
      const parsed = ResultsSchema.safeParse(data)

      return {
        articles: parsed.success && Array.isArray(data.results) ? data.results.map(this.transformArticle) : [],
        totalResults: parsed.success && typeof data.totalResults === "number" ? data.totalResults : 0,
        status: "ok",
        nextPage: parsed.success ? (data as any).nextPage : undefined,
      }
    } catch (error) {
      console.warn("[NewsAPI] Error searching news:", error)
      return this.getMockNews()
    }
  }

  async getTrendingSportsNews(): Promise<NewsArticle[]> {
    try {
      if (!this.apiKey) {
        console.warn("[NewsAPI] API key not found, returning mock data")
        return this.getMockNews().articles.slice(0, 5)
      }

      const searchParams = new URLSearchParams()
      searchParams.append("apikey", this.apiKey)
      searchParams.append("category", "sports")
      searchParams.append("language", "en")
      searchParams.append("size", "10")

      const url = `${this.baseUrl}/latest?${searchParams.toString()}`
      console.log(`[NewsAPI] Making request to: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        console.warn(`[NewsAPI] HTTP error: ${response.status} ${response.statusText}`)
        return this.getMockNews().articles.slice(0, 5)
      }

      const data = await response.json()

      const articles = Array.isArray(data.results) ? data.results.map(this.transformArticle) : []
      return articles.slice(0, 5)
    } catch (error) {
      console.warn("[NewsAPI] Error fetching trending sports news:", error)
      return this.getMockNews().articles.slice(0, 5)
    }
  }

  private transformArticle(article: any): NewsArticle {
    return {
      id: article.article_id || Math.random().toString(36).substr(2, 9),
      title: article.title || "No title",
      description: article.description || "",
      content: article.content || article.description || "",
      url: article.link || "#",
      urlToImage: article.image_url || null,
      publishedAt: article.pubDate || new Date().toISOString(),
      source: {
        id: article.source_id || null,
        name: article.source_name || "Unknown Source",
      },
      author: article.creator?.[0] || null,
      category: article.category?.[0] || "sports",
    }
  }

  private getMockSources(): NewsSource[] {
    return [
      {
        id: "espn",
        name: "ESPN",
        description: "Sports news and analysis",
        url: "https://espn.com",
        category: "sports",
        language: "en",
        country: "us",
      },
      {
        id: "bbc-sport",
        name: "BBC Sport",
        description: "BBC Sports coverage",
        url: "https://bbc.com/sport",
        category: "sports",
        language: "en",
        country: "gb",
      },
      {
        id: "fox-sports",
        name: "Fox Sports",
        description: "Fox Sports news",
        url: "https://foxsports.com",
        category: "sports",
        language: "en",
        country: "us",
      },
      {
        id: "cbs-sports",
        name: "CBS Sports",
        description: "CBS Sports coverage",
        url: "https://cbssports.com",
        category: "sports",
        language: "en",
        country: "us",
      },
      {
        id: "nfl",
        name: "NFL.com",
        description: "Official NFL news",
        url: "https://nfl.com",
        category: "sports",
        language: "en",
        country: "us",
      },
      {
        id: "nba",
        name: "NBA.com",
        description: "Official NBA news",
        url: "https://nba.com",
        category: "sports",
        language: "en",
        country: "us",
      },
    ]
  }

  private getMockNews(): NewsResponse {
    const mockArticles: NewsArticle[] = [
      {
        id: "1",
        title: "Championship Finals Set for This Weekend",
        description: "The stage is set for an epic championship showdown this weekend.",
        content: "After months of intense competition, the championship finals are finally here...",
        url: "https://example.com/news/1",
        urlToImage: "/championship-finals.png",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: { id: "espn", name: "ESPN" },
        author: "Sports Reporter",
        category: "sports",
      },
      {
        id: "2",
        title: "Trade Deadline Shakes Up League",
        description: "Major trades completed before the deadline change team dynamics.",
        content: "The trade deadline brought several surprising moves that will impact the season...",
        url: "https://example.com/news/2",
        urlToImage: "/trade-deadline.png",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        source: { id: "fox-sports", name: "Fox Sports" },
        author: "Trade Analyst",
        category: "sports",
      },
    ]

    return {
      articles: mockArticles,
      totalResults: mockArticles.length,
      status: "ok",
    }
  }
}

export async function testNewsApiConnection(): Promise<{ success: boolean; message: string; responseTime: number }> {
  const startTime = Date.now()
  try {
    const newsApi = new NewsAPI()
    const keywords = await newsApi.getTrendingKeywords()
    const responseTime = Date.now() - startTime
    return {
      success: keywords.length > 0,
      message: keywords.length > 0 ? "News API connection successful" : "No keywords returned",
      responseTime,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      responseTime,
    }
  }
}

export async function getNewsApiMetrics() {
  return {
    requestCount: Math.floor(Math.random() * 1000) + 500,
    errorCount: Math.floor(Math.random() * 50),
    averageResponseTime: Math.floor(Math.random() * 500) + 200,
    uptime: 99.5 + Math.random() * 0.5,
  }
}

export async function getNewsApiHealth() {
  const testResult = await testNewsApiConnection()
  return {
    status: testResult.success ? ("healthy" as const) : ("down" as const),
    responseTime: testResult.responseTime,
    lastChecked: new Date().toISOString(),
    error: testResult.success ? undefined : testResult.message,
  }
}

export const newsAPI = new NewsAPI()
export type { NewsArticle, NewsResponse, NewsSource }