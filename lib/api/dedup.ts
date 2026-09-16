// X-04 cleanup: one place for the news `nuclearDedup` logic.
// Previously copy-pasted in three files (`lib/api/news.ts:186`,
// `app/api/news/route.ts:12`, `app/api/search/news/route.ts:5`) with
// small semantic differences. Consolidated here as one function with
// per-call options so each caller keeps its original behaviour
// without importing a bespoke copy.

// Article shapes vary widely across the three upstream providers
// this helper is called from (NewsData raw, mapped SharedNewsArticle,
// custom scraper rows). Rather than force every caller into a strict
// interface we duck-type just the fields we touch, and let the
// generic parameter T carry through anything else so we return the
// same shape we received.
export interface DedupOptions {
  /** Title normalised to lowercase alphanumerics; dedup key uses first N chars. Default 60. */
  titleMaxChars?: number
  /** Minimum normalised title length before it counts as a dedup key. Default 15. */
  titleMinChars?: number
  /** If true, articles with no title are filtered out. Default true. */
  requireTitle?: boolean
  /** If true, image URL (sans query) also participates in dedup. Default true. */
  dedupOnImage?: boolean
  /** Minimum image-URL length before it counts. Default 20. */
  imageMinChars?: number
  /** If true, description prefix also participates in dedup. Default false. */
  dedupOnDescription?: boolean
  /** Description prefix length. Default 60. */
  descriptionMaxChars?: number
  /** Minimum description prefix length before it counts. Default 20. */
  descriptionMinChars?: number
}

const DEFAULTS: Required<DedupOptions> = {
  titleMaxChars: 60,
  titleMinChars: 15,
  requireTitle: true,
  dedupOnImage: true,
  imageMinChars: 20,
  dedupOnDescription: false,
  descriptionMaxChars: 60,
  descriptionMinChars: 20,
}

/**
 * Nuclear dedup — filter duplicates by exact URL, normalised title
 * prefix, image URL (sans query), and optionally description prefix.
 *
 * Never mutates input. Preserves input order (keeps first occurrence).
 */
export function nuclearDedup<T = any>(articles: T[] | null | undefined, opts: DedupOptions = {}): T[] {
  if (!articles?.length) return []
  const cfg = { ...DEFAULTS, ...opts }

  const seenUrls = new Set<string>()
  const seenTitleKeys = new Set<string>()
  const seenImages = new Set<string>()
  const seenDescriptions = new Set<string>()

  return articles.filter(article => {
    if (!article) return false
    const a = article as Record<string, unknown>
    if (cfg.requireTitle && !a.title) return false

    const url = String(a.link ?? a.url ?? "").trim()
    if (url && seenUrls.has(url)) return false

    const titleKey = String(a.title ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, cfg.titleMaxChars)
    if (titleKey.length >= cfg.titleMinChars && seenTitleKeys.has(titleKey)) {
      return false
    }

    let img = ""
    if (cfg.dedupOnImage) {
      img = String(a.image_url ?? a.urlToImage ?? "")
        .split("?")[0]
        .trim()
      if (img && img.length >= cfg.imageMinChars && seenImages.has(img)) {
        return false
      }
    }

    let descKey = ""
    if (cfg.dedupOnDescription) {
      descKey = String(a.description ?? a.content ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, cfg.descriptionMaxChars)
      if (descKey.length >= cfg.descriptionMinChars && seenDescriptions.has(descKey)) {
        return false
      }
    }

    if (url) seenUrls.add(url)
    if (titleKey.length >= cfg.titleMinChars) seenTitleKeys.add(titleKey)
    if (img && img.length >= cfg.imageMinChars) seenImages.add(img)
    if (descKey && descKey.length >= cfg.descriptionMinChars) seenDescriptions.add(descKey)

    return true
  })
}
