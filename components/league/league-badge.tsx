"use client"

export function LeagueBadge({
  src,
  alt,
  size = 64,
  className = "object-contain rounded-sm",
}: {
  src: string
  alt: string
  size?: number
  className?: string
}) {
  if (!src) return null
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = "none"
      }}
    />
  )
}

