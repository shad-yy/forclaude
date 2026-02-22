import { Suspense } from "react"
import type { Metadata } from "next"
import { newsAPI } from "@/lib/api/news"
import NewsClientPage from "./NewsClientPage"
import { Skeleton } from "@/components/ui/skeleton"
import { NewsCollectionSchema } from "@/components/news/news-seo-schema"

export const metadata: Metadata = {
  title: "Sports News - Smart Live TV",
  description: "Latest sports news, breaking stories, and updates from around the world. Stay informed with comprehensive sports coverage.",
  keywords: ["sports news", "football news", "soccer news", "UFC news", "sports updates", "breaking sports news"],
  openGraph: {
    title: "Sports News - Smart Live TV",
    description: "Latest sports news, breaking stories, and updates from around the world.",
    type: "website",
    url: "https://smart-live-tv.vercel.app/news",
  },
}

interface NewsPageProps {
  searchParams: {
    q?: string
    category?: string
    source?: string
    page?: string
  }
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  try {
    // Fetch initial data on the server
    const [initialNews, trendingKeywords, sources] = await Promise.all([
      newsAPI.getNews({
        q: searchParams.q,
        category: searchParams.category,
        source: searchParams.source,
        page: searchParams.page || "1",
      }),
      newsAPI.getTrendingKeywords(),
      newsAPI.getSources(),
    ])

    return (
      <>
        <NewsCollectionSchema articles={initialNews.articles || []} />
        <Suspense fallback={<NewsPageSkeleton />}>
          <NewsClientPage
            initialNews={initialNews}
            trendingKeywords={trendingKeywords}
            sources={sources}
            searchParams={searchParams}
          />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error("Error loading news page:", error)
    
    // Return with fallback data
    return (
      <NewsClientPage
        initialNews={{ articles: [], totalResults: 0 }}
        trendingKeywords={[]}
        sources={[]}
        searchParams={searchParams}
      />
    )
  }
}

function NewsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <main className="lg:col-span-3 space-y-6">
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </main>
        <aside className="space-y-8">
          <Skeleton className="h-64 w-full" />
        </aside>
      </div>
    </div>
  )
}
