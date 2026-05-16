import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SchemaMarkup } from "@/components/SchemaMarkup"
import { BLOG_POSTS } from "@/lib/blog/posts"
import { ENV } from "@/lib/config/env"
import { BlogPostLayout } from "@/components/blog/BlogPostLayout"

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
    title: `${post.title} | Smart Live TV Blog`,
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
      "@type": "Organization",
      name: "Smart Live TV",
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${ENV.BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${ENV.BASE_URL}/blog/${post.slug}` },
    ],
  }

  // Derive tags from category for sidebar display
  const categoryTagMap: Record<string, string[]> = {
    'how-to': ['Streaming Guide', 'Sports TV', 'IPTV'],
    'guides': ['IPTV Guide', 'Sports Streaming', 'Setup'],
    'news': ['Sports News', 'Streaming', 'UK TV'],
    'comparison': ['Price Comparison', 'IPTV vs Sky', 'Streaming Value'],
  }

  return (
    <>
      <SchemaMarkup schema={articleSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />

      <BlogPostLayout
        title={post.title}
        description={post.description}
        author="Smart Live TV"
        authorTitle="Sports Streaming Expert"
        date={post.publishedAt}
        lastModified={dateModified.slice(0, 10)}
        readingTime={`${post.readTime} min read`}
        category={post.category}
        tags={categoryTagMap[post.category] ?? []}
      >
        {/* Article HTML rendered inside prose-blog styles from the layout */}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </BlogPostLayout>
    </>
  )
}
