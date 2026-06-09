import Link from "next/link"
import { BLOG_POSTS } from "@/lib/blog/posts"

export function RecentPosts() {
  // Get 3 newest posts based on publishedAt
  const recentPosts = [...BLOG_POSTS]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3)

  // Map category to readable format and color
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "comparison":
        return { label: "Comparison", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
      case "guides":
        return { label: "Setup Guide", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
      case "how-to":
        return { label: "How To", bg: "bg-blue-500/10 text-blue-400 border-blue-500/20" }
      default:
        return { label: "Article", bg: "bg-purple-500/10 text-purple-400 border-purple-500/20" }
    }
  }

  return (
    <section className="py-16 md:py-24 bg-[#050508] border-t border-[#1a1a24] relative overflow-hidden">
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-500 font-semibold tracking-wider uppercase text-sm">Latest Updates</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2 mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            From The Sports Blog
          </h2>
          <p className="text-gray-400 text-lg">
            Stay informed with our streaming guides, money-saving tips, and tournament analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recentPosts.map((post) => {
            const badge = getCategoryBadge(post.category)
            const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })

            return (
              <article 
                key={post.slug}
                className="group relative bg-[#0d0d14]/80 border border-[#1f1f2e] rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-1 flex flex-col justify-between h-[360px] overflow-hidden"
              >
                {/* Glow effect on hover */}
                <div className="absolute -inset-px bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-gray-500">{post.readTime} min read</span>
                  </div>

                  <Link href={`/blog/${post.slug}`} className="block">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {post.description}
                  </p>
                </div>

                <div className="mt-auto pt-6 border-t border-[#1a1a26]/60 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{formattedDate}</span>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors"
                  >
                    Read More 
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-3 border border-[#2a2a3a] hover:border-blue-500/40 rounded-xl text-sm font-semibold text-gray-300 hover:text-white bg-[#0a0a0f] hover:bg-[#12121a] transition-all duration-300 shadow-lg"
          >
            Browse All Articles
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
