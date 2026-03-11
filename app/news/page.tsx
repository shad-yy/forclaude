import type { Metadata } from "next"
import { getLatestSportsNews } from "@/lib/api/news"
import { ExternalLink, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Sports News - Smart Live TV",
  description: "Latest sports news, breaking stories, and updates from around the world. Stay informed with comprehensive sports coverage.",
  keywords: ["sports news", "football news", "soccer news", "UFC news"],
}

export default async function NewsPage() {
  const articles = await getLatestSportsNews()

  return (
    <div className="container mx-auto px-4 py-8 pt-20" style={{ paddingTop: '80px' }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Sports News</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <a key={article.article_id} href={article.link} target="_blank" rel="noopener noreferrer" className="block group">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors h-full flex flex-col">
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '200px', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                  📰 Sports News
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2 text-xs">
                  {article.source_icon && (
                    <img src={article.source_icon} alt={article.source_name || ''} className="w-4 h-4 rounded-full" />
                  )}
                  <span className="text-blue-400 font-medium">{article.source_name || "News"}</span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(article.pubDate).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">{article.title}</h2>
                <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">{article.description}</p>
                <div className="flex items-center gap-2 text-sm text-blue-400 mt-auto pt-2">
                  <span>Read more</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
