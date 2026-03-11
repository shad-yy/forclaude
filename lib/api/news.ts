const NEWS_BASE_URL = 'https://newsdata.io/api/1/latest'

// Module-level cache — survives between requests in dev
const newsCache = new Map<string, { data: NewsArticle[]; expires: number }>()

// Try multiple possible env var name spellings
const getApiKey = (): string | null =>
  process.env.NEWS_API_KEY ||
  process.env.NEWSDATA_API_KEY ||
  null

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
    image_url: null,
    category: ['sports'],
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
    image_url: null,
    category: ['sports'],
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
    image_url: null,
    category: ['sports'],
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
    image_url: null,
    category: ['sports'],
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
    image_url: null,
    category: ['sports'],
    language: 'english',
    country: ['italy'],
    creator: null,
  },
]

export async function getLatestSportsNews(
  query = 'football OR soccer OR "premier league"',
  size = 10
): Promise<NewsArticle[]> {
  const apiKey = getApiKey()

  if (!apiKey) {
    console.warn('[NewsAPI] NEWS_API_KEY not configured — using mock data')
    return MOCK_NEWS
  }

  // Free plan: size must be 1-10
  const safeSize = Math.min(Math.max(1, size), 10)
  const cacheKey = `news:sports:${safeSize}`

  // Check module-level cache first (15 min TTL)
  const cached = newsCache.get(cacheKey)
  if (cached && Date.now() < cached.expires) {
    console.log('[NewsAPI] Cache hit — returning cached articles')
    return cached.data
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    q: query,
    language: 'en',
    category: 'sports',
    size: String(safeSize),
    removeduplicate: '1',
    prioritydomain: 'top',
    image: '1',
  })

  const url = `${NEWS_BASE_URL}?${params.toString()}`

  try {
    console.log('[NewsAPI] Fetching from newsdata.io...')
    const response = await fetch(url, {
      next: { revalidate: 900 }, // Next.js cache: 15 min
    })

    if (response.status === 401 || response.status === 403) {
      console.error('[NewsAPI] Unauthorized — check NEWS_API_KEY in .env.local')
      return MOCK_NEWS
    }

    if (response.status === 429) {
      console.error('[NewsAPI] Rate limit hit — using mock data')
      return MOCK_NEWS
    }

    if (!response.ok) {
      console.error(`[NewsAPI] HTTP ${response.status} — using mock data`)
      return MOCK_NEWS
    }

    const data = await response.json()

    if (data.status !== 'success' || !Array.isArray(data.results) || data.results.length === 0) {
      console.warn('[NewsAPI] Empty or error response — using mock data')
      return MOCK_NEWS
    }

    console.log(`[NewsAPI] Success — got ${data.results.length} articles`)

    // Store in module-level cache for 15 minutes
    newsCache.set(cacheKey, {
      data: data.results as NewsArticle[],
      expires: Date.now() + 15 * 60 * 1000,
    })

    return data.results as NewsArticle[]

  } catch (error) {
    console.error('[NewsAPI] Network error:', error)
    return MOCK_NEWS
  }
}

import { NewsArticle as SharedNewsArticle, NewsResponse } from "@/lib/api/types"

export const newsAPI = {
  searchNews: async (params: any = {}): Promise<NewsResponse> => {
    const raw = await getLatestSportsNews(params.q, params.pageSize);
    return {
      totalResults: raw.length,
      articles: raw.map(a => ({
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
    return raw.map(a => ({
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