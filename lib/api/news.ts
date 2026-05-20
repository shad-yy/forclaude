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
    title: 'How to Watch Premier League Live Without Sky Sports',
    description: 'Complete guide to streaming every Premier League match in 2026.',
    image_url: null,
    link: `${process.env.NEXT_PUBLIC_APP_URL || 'https://smartlivetv.co.uk'}/blog/sky-sports-vs-iptv-honest-comparison`,
    source_name: 'Smart Live TV',
    pubDate: new Date().toISOString(),
    category: ['football'],
    source_icon: null,
    language: 'en',
    country: ['gb'],
    creator: null,
  },
  {
    article_id: 'fallback-2',
    title: 'Champions League 2025-26: How to Watch Every Match',
    description: 'Stream every UEFA Champions League match live in 4K.',
    image_url: null,
    link: `${process.env.NEXT_PUBLIC_APP_URL || 'https://smartlivetv.co.uk'}/watch/champions-league`,
    source_name: 'Smart Live TV',
    pubDate: new Date().toISOString(),
    category: ['football'],
    source_icon: null,
    language: 'en',
    country: ['gb'],
    creator: null,
  },
  {
    article_id: 'fallback-3',
    title: 'Is IPTV Legal in the UK? What You Need to Know in 2026',
    description: 'The definitive guide to IPTV legality in the UK.',
    image_url: null,
    link: `${process.env.NEXT_PUBLIC_APP_URL || 'https://smartlivetv.co.uk'}/blog/is-iptv-legal-uk`,
    source_name: 'Smart Live TV',
    pubDate: new Date().toISOString(),
    category: ['guides'],
    source_icon: null,
    language: 'en',
    country: ['gb'],
    creator: null,
  },
  {
    article_id: 'fallback-4',
    title: 'World Cup 2026: How to Watch Every Match Live',
    description: 'Complete guide to streaming all 104 World Cup 2026 matches.',
    image_url: null,
    link: `${process.env.NEXT_PUBLIC_APP_URL || 'https://smartlivetv.co.uk'}/watch/world-cup-2026`,
    source_name: 'Smart Live TV',
    pubDate: new Date().toISOString(),
    category: ['football'],
    source_icon: null,
    language: 'en',
    country: ['gb'],
    creator: null,
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

  const domainFilter = 'skysports.com,bbc.com,goal.com,espn.com,theguardian.com,bbc.co.uk,telegraph.co.uk'
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