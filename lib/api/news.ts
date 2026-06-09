const NEWS_BASE_URL = 'https://newsdata.io/api/1/latest'
const NEWS_DOMAIN_FILTER = 'skysports.com,bbc.com,goal.com,espn.com,theguardian.com'
const NEWS_DOMAIN_FALLBACK = 'skysports.com'

// Module-level cache — survives between requests in dev
const newsCache = new Map<string, { data: NewsArticle[]; expires: number }>()

export interface NewsArticle {
  article_id: string
  title: string
  link: string
  description: string | null
  pubDate: string
  source_name: string | null
  source_icon: string | null
  image_url: string | null
  category: string[] | null
  language: string | null
  country: string[] | null
  creator: string[] | null
}

const FALLBACK_ARTICLES: NewsArticle[] = [
  {
    article_id: 'fallback-1',
    title: 'Premier League 2025-26: Latest Transfer News and Rumours',
    description: 'All the latest Premier League transfer news, rumours and done deals from the top flight.',
    image_url: 'https://e0.365dm.com/25/01/2048x1152/skysports-premier-league-football_6780000.jpg',
    link: 'https://www.skysports.com/premier-league-transfers',
    source_name: 'Sky Sports',
    pubDate: new Date().toISOString(),
    category: ['football'],
    source_icon: 'https://www.skysports.com/favicon.ico',
    language: 'en',
    country: ['gb'],
    creator: ['Sky Sports'],
  },
  {
    article_id: 'fallback-2',
    title: 'Champions League: Fixtures, Results and Tables',
    description: 'Keep up with all the UEFA Champions League action — fixtures, results, standings and highlights.',
    image_url: 'https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/18225/production/_132280918_ucl.jpg',
    link: 'https://www.bbc.co.uk/sport/football/champions-league',
    source_name: 'BBC Sport',
    pubDate: new Date().toISOString(),
    category: ['football'],
    source_icon: 'https://www.bbc.co.uk/favicon.ico',
    language: 'en',
    country: ['gb'],
    creator: ['BBC Sport'],
  },
  {
    article_id: 'fallback-3',
    title: 'UFC Fight Night: Latest Results, Highlights and Analysis',
    description: 'Catch up on all the action from the latest UFC events with results, highlights and expert analysis.',
    image_url: 'https://a.espncdn.com/photo/2024/0101/r1273264_1296x729_16-9.jpg',
    link: 'https://www.espn.com/mma/',
    source_name: 'ESPN',
    pubDate: new Date().toISOString(),
    category: ['mma'],
    source_icon: 'https://www.espn.com/favicon.ico',
    language: 'en',
    country: ['us'],
    creator: ['ESPN'],
  },
  {
    article_id: 'fallback-4',
    title: 'Formula 1: Race Calendar, Standings and Latest News',
    description: 'Follow every Grand Prix of the 2026 F1 season — race calendar, driver standings and breaking news.',
    image_url: 'https://i.guim.co.uk/img/media/f1-car-hero/2000x1200.jpg?width=1200&quality=85',
    link: 'https://www.theguardian.com/sport/formulaone',
    source_name: 'The Guardian',
    pubDate: new Date().toISOString(),
    category: ['motorsport'],
    source_icon: 'https://www.theguardian.com/favicon.ico',
    language: 'en',
    country: ['gb'],
    creator: ['The Guardian'],
  },
]

import { ENV } from "@/lib/config/env"

export async function getLatestSportsNews(
  query = 'football OR soccer OR "premier league" OR UFC OR "champions league"',
  size = 10
): Promise<NewsArticle[]> {
  const apiKey = ENV.NEWS_API_KEY

  if (!apiKey) {
    console.warn('[NewsAPI] NEWS_API_KEY missing in env')
    return FALLBACK_ARTICLES
  }

  // Free plan: size must be 1-10
  const safeSize = Math.min(Math.max(1, size), 10)
  const cacheKey = `news:sports:v3:${safeSize}`

  // Check module-level cache first (6 hour TTL)
  const cached = newsCache.get(cacheKey)
  if (cached && Date.now() < cached.expires) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[NewsAPI] Cache hit — returning cached articles')
    }
    return cached.data
  }

  const params = new URLSearchParams({
    apikey: ENV.NEWS_API_KEY || '',
    language: 'en',
    size: '10',
    q: query,
  })

  const domainFilter = 'skysports.com,bbc.com,espn.com,theguardian.com'
  const url = `https://newsdata.io/api/1/news?${params.toString()}&domainurl=${domainFilter}`

  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[NewsAPI DEBUG] fetching:', url.replace(apiKey, 'REDACTED'))
    }
    let response = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    })

    // Some plans reject multiple domains and return 422; retry with one domain.
    if (response.status === 422) {
      const fallbackUrl = `https://newsdata.io/api/1/news?${params.toString()}&domainurl=${NEWS_DOMAIN_FALLBACK}`
      console.warn('[NewsAPI] Domain filter rejected, retrying with fallback domain')
      if (process.env.NODE_ENV !== 'production') {
        console.log('[NewsAPI DEBUG] retrying:', fallbackUrl.replace(apiKey || '', 'REDACTED'))
      }
      response = await fetch(fallbackUrl, {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (response.status === 401 || response.status === 403) {
      console.error('[NewsAPI] Unauthorized — check NEWS_API_KEY in .env.local')
      return FALLBACK_ARTICLES
    }

    if (response.status === 429) {
      console.error('[NewsAPI] Rate limit hit — using mock data')
      return FALLBACK_ARTICLES
    }

    if (!response.ok) {
      console.error(`[NewsAPI] Request failed with status ${response.status} — using mock data`)
      return FALLBACK_ARTICLES
    }

    const data = await response.json()

    if (data.status !== 'success' || !Array.isArray(data.results) || data.results.length === 0) {
      console.warn('[NewsAPI] Empty or error response — using mock data')
      return FALLBACK_ARTICLES
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[NewsAPI] Success — got ${data.results.length} articles`)
    }

    // Store in module-level cache for 6 hours
    newsCache.set(cacheKey, {
      data: data.results as NewsArticle[],
      expires: Date.now() + 3600 * 1000, // 1 hour in-process cache (no-store bypasses Vercel cache)
    })

    return data.results as NewsArticle[]

  } catch (error) {
    console.error('[NewsAPI] Network error:', error)
    return FALLBACK_ARTICLES
  }
}

import { NewsArticle as SharedNewsArticle, NewsResponse } from "@/lib/api/types"

/**
 * Nuclear dedup — catches duplicates by URL, normalized title,
 * image URL (sans query-string), and description content hash.
 */
function nuclearDedup(articles: any[]): any[] {
  if (!articles?.length) return []
  const seen = new Map<string, boolean>()
  return articles.filter(article => {
    if (!article) return false
    const url = (article.link || article.url || '').trim()
    const title = (article.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40)
    const img = (article.image_url || article.urlToImage || '').split('?')[0].trim()
    const desc = (article.description || article.content || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60)
    const keys = [
      url && `url:${url}`,
      title && title.length > 10 && `title:${title}`,
      img && `img:${img}`,
      desc && desc.length > 20 && `desc:${desc}`,
    ].filter(Boolean) as string[]
    const isDuplicate = keys.some(k => seen.has(k))
    if (isDuplicate) return false
    keys.forEach(k => seen.set(k, true))
    return true
  })
}

export const newsAPI = {
  searchNews: async (params: any = {}): Promise<NewsResponse> => {
    const raw = await getLatestSportsNews(params.q, params.pageSize);
    const deduped = nuclearDedup(raw);
    return {
      totalResults: deduped.length,
      articles: deduped.map(a => ({
        id: a.article_id,
        title: a.title || "",
        url: a.link,
        urlToImage: a.image_url || null,
        description: a.description || "",
        content: a.description || "",
        source: { id: null, name: a.source_name || "Unknown" },
        publishedAt: a.pubDate,
        author: a.creator ? a.creator.join(', ') : null,
        category: a.category ? a.category[0] : undefined
      })) as SharedNewsArticle[]
    };
  },
  getTrendingSportsNews: async (): Promise<SharedNewsArticle[]> => {
    const raw = await getLatestSportsNews();
    const deduped = nuclearDedup(raw);
    return deduped.map(a => ({
      id: a.article_id,
      title: a.title || "",
      url: a.link,
      urlToImage: a.image_url || null,
      description: a.description || "",
      content: a.description || "",
      source: { id: null, name: a.source_name || "Unknown" },
      publishedAt: a.pubDate,
      author: a.creator ? a.creator.join(', ') : null,
      category: a.category ? a.category[0] : undefined
    })) as SharedNewsArticle[];
  }
};