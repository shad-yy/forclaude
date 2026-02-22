"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, TrendingUp, Clock, AlertCircle, X } from "lucide-react"
import { NewsCard } from "./news-card"
import { useAdmin } from "@/lib/auth/admin"
import { newsAPI, type NewsArticle } from "@/lib/api/news"

interface SearchResult {
  id: string
  title: string
  description?: string
  url: string
  image?: string
  published: string
  source: string
  sourceIcon?: string
  category: string[]
}

export function NewsSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useAdmin()

  const transformNewsToSearchResult = (article: NewsArticle): SearchResult => ({
    id: article.id,
    title: article.title,
    description: article.description,
    url: article.url,
    image: article.urlToImage || undefined,
    published: article.publishedAt,
    source: article.source.name,
    sourceIcon: "/news-source-icon.png",
    category: [article.category || "sports"],
  })

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await newsAPI.searchNews({
        q: searchQuery,
        category: "sports",
        pageSize: 12,
      })

      const searchResults = response.articles.map(transformNewsToSearchResult)
      setResults([
        {
          id: "1",
          title: `${searchQuery} - Latest Sports News Update`,
          description: `Breaking news about ${searchQuery} with comprehensive coverage and analysis from our sports team.`,
          url: "https://example.com/news/1",
          image: "/sports-news-generic.png",
          published: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          source: "Sports Central",
          sourceIcon: "/news-source-icon.png",
          category: ["Sports", "Breaking"],
        },
        ...searchResults,
      ])
    } catch (err) {
      console.error("News search error:", err)
      setError("Failed to search news. Please try again.")
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestApi = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-news-api")
      const data = await response.json()

      if (data.success) {
        setError(null)
        console.log("News API test successful:", data)
      } else {
        setError(`API Test Failed: ${data.message}`)
      }
    } catch (err) {
      setError("Failed to test News API connection")
    } finally {
      setIsLoading(false)
    }
  }

  const popularSearches = [
    "NFL",
    "NBA",
    "Premier League",
    "Champions League",
    "Olympics",
    "World Cup",
    "Tennis",
    "Golf",
  ]

  const clearSearch = () => {
    setQuery("")
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-400" />
            Search Sports News
            {isAdmin && (
              <Button
                onClick={handleTestApi}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="ml-auto bg-transparent border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-2" />
                )}
                Test API
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch()
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for sports news, teams, players..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button type="submit" disabled={isLoading || !query.trim()} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </form>

          {/* Popular Searches */}
          {!hasSearched && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search) => (
                  <Button
                    key={search}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(search)
                      handleSearch(search)
                    }}
                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {isLoading && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-gray-400">Searching for news...</p>
          </CardContent>
        </Card>
      )}

      {hasSearched && !isLoading && results.length === 0 && !error && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-gray-400">Try searching with different keywords or check your spelling.</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-400" />
              Search Results
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                {results.length} found
              </Badge>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    {result.image && (
                      <div className="aspect-video mb-3 overflow-hidden rounded">
                        <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h3 className="font-semibold mb-2 line-clamp-2">{result.title}</h3>
                    {result.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{result.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{result.source}</span>
                      <span>•</span>
                      <span>{new Date(result.published).toLocaleDateString()}</span>
                    </div>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
