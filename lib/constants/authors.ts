/**
 * Centralised author definitions for E-E-A-T (Experience, Expertise,
 * Authoritativeness, Trust) signals across the site.
 *
 * Google's quality raters and algorithms look for consistent author
 * identity across pages. This file is the single source of truth for
 * all author metadata used in BlogPosting schema, author bylines, and
 * the future /about/authors page.
 */

export interface Author {
  /** Display name shown in byline and schema */
  name: string
  /** Job title / professional credential */
  jobTitle: string
  /** Short bio used in author cards and schema description */
  bio: string
  /** URL to the author's profile page (for schema `url` property) */
  url: string
  /** Social / professional profile links (for schema `sameAs`) */
  sameAs: string[]
  /** Areas of demonstrated expertise (for `knowsAbout`) */
  knowsAbout: string[]
}

/**
 * Primary editorial author. Currently the brand acts as author;
 * when you onboard named writers, add them here and reference
 * by key in each blog post's frontmatter.
 */
export const AUTHORS: Record<string, Author> = {
  'smart-live-tv': {
    name: 'Smart Live TV',
    jobTitle: 'Sports Streaming Expert',
    bio: 'The Smart Live TV editorial team covers UK sports broadcasting, IPTV technology, and cost-saving strategies for cord-cutters. Based in the United Kingdom.',
    url: 'https://smartlivetv.co.uk/about',
    sameAs: [
      'https://www.instagram.com/smartlivetv',
      'https://twitter.com/SmartLiveTV',
      'https://www.trustpilot.com/review/smartlivetv.co.uk',
    ],
    knowsAbout: [
      'IPTV',
      'Sports Streaming',
      'Premier League Broadcasting',
      'Sky Sports',
      'TNT Sports',
      'UK Television',
      'Cord-Cutting',
      'Firestick Setup',
    ],
  },
}

/** Default author key — matches what blog posts use in their frontmatter. */
export const DEFAULT_AUTHOR_KEY = 'smart-live-tv'

/**
 * Resolve an author record from a blog post's `author` field.
 * Falls back to the default author if no match is found.
 */
export function resolveAuthor(authorName: string): Author {
  // Try exact key match first (e.g. 'smart-live-tv')
  const byKey = AUTHORS[authorName.toLowerCase().replace(/\s+/g, '-')]
  if (byKey) return byKey

  // Try matching by display name (e.g. 'Smart Live TV')
  const byName = Object.values(AUTHORS).find(
    (a) => a.name.toLowerCase() === authorName.toLowerCase()
  )
  if (byName) return byName

  // Fallback to default
  return AUTHORS[DEFAULT_AUTHOR_KEY]
}
