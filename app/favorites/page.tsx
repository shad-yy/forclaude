"use client"

import { useFavorites, type FavoriteItem } from "@/lib/hooks/use-favorites"
import { Heart, Trash2, Tv, Trophy, Calendar, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const TYPE_ICONS: Record<FavoriteItem["type"], React.ElementType> = {
  channel: Tv,
  team: Star,
  league: Trophy,
  event: Calendar,
}

export default function FavoritesPage() {
  const { favorites, mounted, removeFavorite, getFavoritesByType } = useFavorites()

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-surface rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const types: FavoriteItem["type"][] = ["channel", "team", "league", "event"]

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Favorites</h1>
          <p className="text-text-secondary mt-1">
            {favorites.length === 0
              ? "You haven't saved any favorites yet."
              : `${favorites.length} item${favorites.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart className="w-16 h-16 text-text-muted/30 mb-6" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">No favorites yet</h2>
          <p className="text-text-secondary max-w-md mb-6">
            Tap the heart icon on any channel, team, league, or event to save it here for quick access.
          </p>
          <Link
            href="/channels"
            className="px-6 py-3 bg-accent-primary hover:brightness-110 text-black font-bold rounded-lg transition-all"
          >
            Browse Channels
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {types.map((type) => {
            const items = getFavoritesByType(type)
            if (items.length === 0) return null
            const Icon = TYPE_ICONS[type]

            return (
              <section key={type}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-5 h-5 text-accent-primary" />
                  <h2 className="text-lg font-bold text-text-primary capitalize">{type}s</h2>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {items.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:border-accent-primary/30 transition-colors group"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-contain rounded-lg bg-surface-elevated p-1"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center">
                          <Icon className="w-5 h-5 text-text-muted" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary truncate">{item.name}</p>
                        <p className="text-xs text-text-muted capitalize">{item.type}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all w-8 h-8"
                        onClick={() => removeFavorite(item.id, item.type)}
                        aria-label={`Remove ${item.name} from favorites`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
