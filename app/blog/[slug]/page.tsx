import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { BLOG_POSTS } from "@/lib/blog/posts"
import { ENV } from "@/lib/config/env"
import { FadeIn } from "@/components/ui/fade-in"
import { ShimmerButton } from "@/components/ui/shimmer-button"

type BlogPostPageProps = {
  params: { slug: string }
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = BLOG_POSTS.find((item) => item.slug === params.slug)

  if (!post) {
    return {
      title: "Article Not Found | Blog",
      description: "The requested article could not be found.",
    }
  }

  return {
    title: `${post.title} | Blog`,
    description: post.description,
    alternates: {
      canonical: `${ENV.BASE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Smart Live TV' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: ['/og-default.png'],
    },
  }
}

const categoryClasses: Record<string, string> = {
  "how-to": "bg-green-500/20 text-green-300 border border-green-500/30",
  guides: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  news: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  comparison: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
}


export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = BLOG_POSTS.find((item) => item.slug === params.slug)
  if (!post) notFound()

  const dateModified = new Date().toISOString()

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified,
    author: {
      "@type": "Person",
      name: "James Harper",
      jobTitle: "Sports Streaming Journalist",
    },
    publisher: {
      "@type": "Organization",
      name: "Smart Live TV",
      url: ENV.BASE_URL,
    },
    url: `${ENV.BASE_URL}/blog/${post.slug}`,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', 
        item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', 
        item: `${ENV.BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, 
        item: `${ENV.BASE_URL}/blog/${post.slug}` },
    ],
  }

  const lastUpdated = new Date(dateModified).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <main className="min-h-screen bg-background pt-28 md:pt-36 pb-16 md:pb-20">
      <SchemaMarkup schema={articleSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />

      <FadeIn>
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <nav className="text-sm text-gray-400">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            <span className="mx-2">→</span>
            <Link href="/blog" className="hover:text-white">
              Blog
            </Link>{" "}
            <span className="mx-2">→</span>
            <span className="text-gray-200">{post.title}</span>
          </nav>
        </div>
      </section>
      </FadeIn>

      <FadeIn direction="up">
      <section className="pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <header className="max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${categoryClasses[post.category]}`}
              >
                {post.category}
              </span>
              <span>{post.readTime} min read</span>
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight text-white">{post.title}</h1>
            <p className="text-xl text-gray-400">{post.description}</p>
            {/* Last updated badge — required by spec */}
            <p className="text-sm text-gray-400 mb-4">Last updated: {lastUpdated}</p>
            <div className="h-px w-full bg-white/10" />
          </header>
        </div>
      </section>
      </FadeIn>

      <FadeIn direction="up">
      <section className="pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl">
            <article
              className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-a:text-green-400 prose-table:text-sm"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>
      </section>
      </FadeIn>

      <FadeIn direction="up">
      <section className="py-16 md:py-20 border-t border-[#2a2a3a]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl bg-[#12121a] border border-green-500/30 rounded-2xl p-8 text-center">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Ready to watch? Start your free 24-hour trial</h2>
              <ShimmerButton
                href="/pricing"
                className="px-8 py-4 font-bold rounded-xl text-lg text-black bg-green-500 mx-auto"
              >
                View Pricing
              </ShimmerButton>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>
    </main>
  )
}
