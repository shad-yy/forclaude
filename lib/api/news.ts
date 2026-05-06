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

const MOCK_NEWS: NewsArticle[] = [
  {
    article_id: 'mock-1',
    title: 'Champions League Quarter-Finals: Draw Revealed',
    link: '#',
    description: "Europe's elite clubs discover their path to the final as the Champions League knockout stage heats up.",
    pubDate: new Date().toISOString(),
    source_name: 'BBC Sport',
    source_icon: null,
    image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
    category: ['champions league'],
    language: 'english',
    country: ['united kingdom'],
    creator: null,
  },
  {
    article_id: 'mock-2',
    title: 'Premier League Title Race: Top Four Separated by Points',
    link: '#',
    description: 'With eight games remaining the title race is tighter than ever as four clubs battle for glory.',
    pubDate: new Date().toISOString(),
    source_name: 'Sky Sports',
    source_icon: null,
    image_url: 'https://images.unsplash.com/photo-1508098682722-e99c643e7485?w=800&q=80',
    category: ['premier league'],
    language: 'english',
    country: ['united kingdom'],
    creator: null,
  },
  {
    article_id: 'mock-3',
    title: 'Transfer Window: Summer Moves Already Taking Shape',
    link: '#',
    description: 'Clubs are lining up targets ahead of the summer window with several big names linked to moves.',
    pubDate: new Date().toISOString(),
    source_name: 'ESPN',
    source_icon: null,
    image_url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80',
    category: ['transfers'],
    language: 'english',
    country: ['united states of america'],
    creator: null,
  },
  {
    article_id: 'mock-4',
    title: 'Bundesliga: Bayern Lead Challenged by Surprising Contenders',
    link: '#',
    description: 'German football is more competitive than ever with several clubs pushing for the title.',
    pubDate: new Date().toISOString(),
    source_name: 'Goal.com',
    source_icon: null,
    image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    category: ['bundesliga'],
    language: 'english',
    country: ['germany'],
    creator: null,
  },
  {
    article_id: 'mock-5',
    title: 'Serie A Weekend Roundup: Drama at Both Ends',
    link: '#',
    description: 'Italian football delivered drama throughout as title contenders and relegation battlers clashed.',
    pubDate: new Date().toISOString(),
    source_name: 'The Guardian',
    source_icon: null,
    image_url: 'https://images.unsplash.com/photo-1551958219-acbc4bbdf75c?w=800&q=80',
    category: ['serie a'],
    language: 'english',
    country: ['italy'],
    creator: null,
  },
  {
    article_id: 'mock-6',
    title: 'La Liga: El Clásico Preview — Form, Stats & Predictions',
    link: '#',
    description: 'The biggest match in club football returns as Madrid and Barça meet in a crucial title showdown.',
    pubDate: new Date(Date.now() - 3600000).toISOString(),
    source_name: 'Marca',
    source_icon: null,
    image_url: 'https://images.unsplash.com/photo-1560271888-f93a0c3acd37?w=800&q=80',
    category: ['la liga'],
    language: 'english',
    country: ['spain'],
    creator: null,
  },
  {
    article_id: 'mock-7',
    title: 'Ligue 1: PSG on Track for Another Title Defence',
    link: '#',
    description: 'Paris Saint-Germain maintain their grip on the French league as rivals struggle to keep pace.',
    pubDate: new Date(Date.now() - 7200000).toISOString(),
    source_name: 'L\'Équipe',
    source_icon: null,
    image_url: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80',
    category: ['ligue 1'],
    language: 'english',
    country: ['france'],
    creator: null,
  },
  {
    article_id: 'mock-8',
    title: 'UEFA Nations League: Semi-Final Berths Confirmed',
    link: '#',
    description: 'International football heats up as several nations clinch their places in the knockout rounds.',
    pubDate: new Date(Date.now() - 10800000).toISOString(),
    source_name: 'UEFA.com',
    source_icon: null,
    image_url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    category: ['international'],
    language: 'english',
    country: ['europe'],
    creator: null,
  },
  {
    article_id: 'mock-9',
    title: 'Champions League: Shock Result Sends Giant Home',
    link: '#',
    description: 'In a night of stunning football, a heavyweight European side crash out at the Round of 16.',
    pubDate: new Date(Date.now() - 14400000).toISOString(),
    source_name: 'Mirror Sport',
    source_icon: null,
    image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80',
    category: ['champions league'],
    language: 'english',
    country: ['united kingdom'],
    creator: null,
  },
  {
    article_id: 'mock-10',
    title: 'Premier League: Injury Crisis Deepens Ahead of Derby',
    link: '#',
    description: 'A top-six club faces crisis as multiple first-team players are ruled out for the crucial city derby.',
    pubDate: new Date(Date.now() - 18000000).toISOString(),
    source_name: 'Sky Sports',
    source_icon: null,
    image_url: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80',
    category: ['premier league'],
    language: 'english',
    country: ['united kingdom'],
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
    return MOCK_NEWS
  }

  // Free plan: size must be 1-10
  const safeSize = Math.min(Math.max(1, size), 10)
  const cacheKey = `news:sports:v2:${safeSize}`

  // Check module-level cache first (6 hour TTL)
  const cached = newsCache.get(cacheKey)
  if (cached && Date.now() < cached.expires) {
    console.log('[NewsAPI] Cache hit — returning cached articles')
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
    console.log('[NewsAPI DEBUG] fetching:', url.replace(apiKey, 'REDACTED'))
    let response = await fetch(url, {
      next: { revalidate: 21600 }, // Next.js cache: 6 hours
    })

    // Some plans reject multiple domains and return 422; retry with one domain.
    if (response.status === 422) {
      const fallbackUrl = `https://newsdata.io/api/1/news?${params.toString()}&domainurl=${NEWS_DOMAIN_FALLBACK}`
      console.warn('[NewsAPI] Domain filter rejected, retrying with fallback domain')
      console.log('[NewsAPI DEBUG] retrying:', fallbackUrl.replace(apiKey || '', 'REDACTED'))
      response = await fetch(fallbackUrl, {
        next: { revalidate: 21600 },
      })
    }

    if (response.status === 401 || response.status === 403) {
      console.error('[NewsAPI] Unauthorized — check NEWS_API_KEY in .env.local')
      return MOCK_NEWS
    }

    if (response.status === 429) {
      console.error('[NewsAPI] Rate limit hit — using mock data')
      return MOCK_NEWS
    }

    if (!response.ok) {
      console.error(`[NewsAPI] Request failed with status ${response.status} — using mock data`)
      return MOCK_NEWS
    }

    const data = await response.json()

    if (data.status !== 'success' || !Array.isArray(data.results) || data.results.length === 0) {
      console.warn('[NewsAPI] Empty or error response — using mock data')
      return MOCK_NEWS
    }

    console.log(`[NewsAPI] Success — got ${data.results.length} articles`)

    // Store in module-level cache for 6 hours
    newsCache.set(cacheKey, {
      data: data.results as NewsArticle[],
      expires: Date.now() + 21600 * 1000,
    })

    return data.results as NewsArticle[]

  } catch (error) {
    console.error('[NewsAPI] Network error:', error)
    return MOCK_NEWS
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