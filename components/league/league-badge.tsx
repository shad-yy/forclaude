"use client"

interface LeagueBadgeProps {
  src?: string
  localSrc?: string
  alt: string
  size?: number
  className?: string
}

export function LeagueBadge({
  src,
  localSrc,
  alt,
  size = 64,
  className = "object-contain rounded-sm",
}: LeagueBadgeProps) {
  // Use local file if available, fall back to remote
  const primarySrc = localSrc || src || '/leagues/placeholder.svg'

  if (!primarySrc) return null

  return (
    <img
      src={primarySrc}
      alt={alt}
      width={size}
      height={size}
      className={className}
      onError={(e) => {
        const img = e.target as HTMLImageElement
        // Try remote fallback if local fails
        if (src && img.src !== src) {
          img.src = src
        } else {
          // Final fallback: placeholder
          img.src = '/leagues/placeholder.svg'
        }
      }}
    />
  )
}
