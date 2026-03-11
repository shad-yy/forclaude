"use client"

import { Suspense, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Globe, Users, Calendar, Star, TrendingUp, Loader2 } from "lucide-react"
import Link from "next/link"
import { unifiedSportsAPI, type UnifiedLeague } from "@/lib/api/unified-sports-api"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { LeagueModal } from "@/components/leagues/league-modal"
import { LeagueCard } from "@/components/leagues/league-card"
import { getSportThemeClasses } from "@/lib/utils/sport-themes"

function LeaguesContentClient() {
  const [selectedLeague, setSelectedLeague] = useState<UnifiedLeague | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <Suspense fallback={<LeaguesLoadingSkeleton />}>
      <LeaguesContent
        onLeagueClick={(league) => {
          setSelectedLeague(league)
          setIsModalOpen(true)
        }}
      />
      <LeagueModal
        league={selectedLeague}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </Suspense>
  )
}

async function LeaguesContent({ onLeagueClick }: { onLeagueClick: (league: UnifiedLeague) => void }) {
  try {
    // Fetch leagues from TheSportsDB (now returns top 5)
    const topLeagues = await unifiedSportsAPI.getLeagues()

    // Group leagues by sport
    const leaguesBySport = new Map<string, typeof topLeagues>()
    for (const league of topLeagues) {
      const sport = league.sport || "Unknown"
      if (!leaguesBySport.has(sport)) {
        leaguesBySport.set(sport, [])
      }
      leaguesBySport.get(sport)!.push(league)
    }

    return (
      <div className="container mx-auto px-4 py-8 pt-20" style={{ paddingTop: '80px' }}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Football Leagues
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Explore the world's top football leagues, from Europe's elite competitions to emerging leagues worldwide
          </p>
        </div>

        {/* Featured Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-700/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white mb-1">{topLeagues.length}</div>
              <div className="text-blue-200 text-sm">Leagues Covered</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-green-700/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <Globe className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white mb-1">{leaguesBySport.size}</div>
              <div className="text-green-200 text-sm">Sports Categories</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-700/20 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-white mb-1">1000+</div>
              <div className="text-purple-200 text-sm">Teams</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/20 to-orange-700/20 border-orange-500/30">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-white mb-1">Today</div>
              <div className="text-orange-200 text-sm">Today's Data</div>
            </CardContent>
          </Card>
        </div>

        {/* Top Leagues */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-3xl font-bold">Top Leagues</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topLeagues.map((league) => {
              const themeClasses = getSportThemeClasses(league.sport)
              return (
                <Card
                  key={league.id}
                  onClick={() => onLeagueClick(league)}
                  className={`${themeClasses.card} hover:scale-105 transition-all duration-300 cursor-pointer group h-full`}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      {league.logo ? (
                        <OptimizedImage
                          src={`${league.logo}/small`}
                          alt={`${league.name} logo`}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-full">
                          <span className="text-xl font-bold text-muted-foreground">{league.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl group-hover:text-blue-400 transition-colors">
                      {league.name}
                    </CardTitle>
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Globe className="w-4 h-4" />
                      <span>{league.country}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Top League
                      </Badge>
                      <Badge variant="outline" className="border-gray-600">
                        {league.sport}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Leagues by Sport */}
        {Array.from(leaguesBySport.entries()).map(([sport, leagues]) => (
          <section key={sport} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <h2 className="text-3xl font-bold">{sport} Leagues</h2>
              <Badge variant="secondary" className="text-xs">
                {leagues.length} {leagues.length === 1 ? "league" : "leagues"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leagues.slice(0, 12).map((league) => {
                const themeClasses = getSportThemeClasses(league.sport)
                return (
                  <LeagueCard
                    key={league.id}
                    league={league}
                    onClick={() => onLeagueClick(league)}
                    themeClasses={themeClasses}
                    isTop={false}
                  />
                )
              })}
            </div>

            {leagues.length > 12 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" className="bg-transparent">
                  View All {sport} Leagues ({leagues.length})
                </Button>
              </div>
            )}
          </section>
        ))}

        {/* Browse More */}
        <div className="text-center mt-12">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Explore More Football</h3>
              <p className="text-gray-400 mb-6">
                Discover teams, players, and live scores from leagues around the world
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild variant="outline" className="bg-transparent">
                  <Link href="/teams">
                    <Users className="w-4 h-4 mr-2" />
                    Browse Teams
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent">
                  <Link href="/players">
                    <Users className="w-4 h-4 mr-2" />
                    View Players
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent">
                  <Link href="/scores">
                    <Trophy className="w-4 h-4 mr-2" />
                    Live Scores
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent">
                  <Link href="/events">
                    <Calendar className="w-4 h-4 mr-2" />
                    Match Events
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching leagues:", error)
    return (
      <div className="container mx-auto px-4 py-8 pt-20">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-8 text-center">
            <div className="text-red-400 mb-4">Failed to load leagues</div>
            <p className="text-gray-400 mb-4">
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}

function LeaguesLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <Skeleton className="h-12 w-64 mx-auto mb-12" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  )
}

export default function LeaguesPage() {
  return <LeaguesContentClient />
}
