"use client"

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { unifiedSportsAPI, type UnifiedFixture } from "@/lib/api/unified-sports-api"
import { theSportsDB } from "@/lib/api/the-sports-db"
import { useState, useEffect } from "react"

interface PlayerContentProps {
  playerId: string
}

async function PlayerContent({ playerId }: PlayerContentProps) {
  try {
    const player = await unifiedSportsAPI.getPlayer(playerId)

    if (!player) {
      notFound()
    }

    // Try to get additional player info from TheSportsDB
    let additionalPlayerInfo = null
    try {
      const sportsDbPlayer = await theSportsDB.lookupPlayer(playerId)
      additionalPlayerInfo = sportsDbPlayer
    } catch (error) {
      console.log("Could not fetch additional player info from TheSportsDB")
    }

    let recentMatches: UnifiedFixture[] = []

    try {
      // Get player statistics from unified API
      if (player.team) {
        const teamFixtures = await unifiedSportsAPI.getFixtures({
          teamId: player.team,
          last: 10,
        })
        recentMatches = teamFixtures.slice(0, 5) // Get last 5 matches
      }
    } catch (error) {
      console.log("Could not fetch player statistics and matches")
    }

    return (
      <div className="space-y-8">
        {/* Player Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white/20">
                {player.photo ? (
                  <OptimizedImage src={player.photo} alt={player.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
                    {player.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{player.name}</h1>
                <div className="flex items-center space-x-4">
                  {player.team && (
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {player.team}
                    </Badge>
                  )}
                  {player.position && (
                    <Badge variant="outline" className="border-white/40 text-white">
                      {player.position}
                    </Badge>
                  )}
                  {player.nationality && <span className="text-white/80">{player.nationality}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Player Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Player Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {player.age && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age</span>
                    <span>{player.age}</span>
                  </div>
                )}
                {player.height && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Height</span>
                    <span>{player.height}</span>
                  </div>
                )}
                {player.weight && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight</span>
                    <span>{player.weight}</span>
                  </div>
                )}
                {player.nationality && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nationality</span>
                    <span>{player.nationality}</span>
                  </div>
                )}
                {player.position && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position</span>
                    <span>{player.position}</span>
                  </div>
                )}
                {player.team && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Team</span>
                    <span>{player.team}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info from TheSportsDB */}
            {additionalPlayerInfo && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Career Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {additionalPlayerInfo.strDescriptionEN && (
                    <div>
                      <h4 className="font-medium mb-2">Biography</h4>
                      <p className="text-sm text-muted-foreground line-clamp-6">
                        {additionalPlayerInfo.strDescriptionEN}
                      </p>
                    </div>
                  )}
                  {additionalPlayerInfo.dateBorn && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date of Birth</span>
                      <span>{new Date(additionalPlayerInfo.dateBorn).toLocaleDateString()}</span>
                    </div>
                  )}
                  {additionalPlayerInfo.strBirthLocation && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Birth Place</span>
                      <span>{additionalPlayerInfo.strBirthLocation}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats and Performance */}
          <div className="lg:col-span-2">
            <PlayerStatsClient playerId={playerId} />

            {/* Recent Matches */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Matches</CardTitle>
              </CardHeader>
              <CardContent>
                {recentMatches.length > 0 ? (
                  <div className="space-y-4">
                    {recentMatches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {match.homeLogo && (
                              <OptimizedImage
                                src={match.homeLogo}
                                alt={match.homeTeam}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            )}
                            <span className="font-medium">{match.homeTeam}</span>
                          </div>
                          <div className="text-center px-4">
                            <div className="font-bold">
                              {match.homeScore !== null && match.awayScore !== null
                                ? `${match.homeScore} - ${match.awayScore}`
                                : "vs"}
                            </div>
                            <div className="text-xs text-muted-foreground">{match.status}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{match.awayTeam}</span>
                            {match.awayLogo && (
                              <OptimizedImage
                                src={match.awayLogo}
                                alt={match.awayTeam}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{match.date}</div>
                          <div className="text-xs text-muted-foreground">{match.league}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No recent matches available for this player's team.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading player:", error)
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load player information. Please try again later.</p>
      </div>
    )
  }
}

function PlayerStatsClient({ playerId }: { playerId: string }) {
  const [playerStats, setPlayerStats] = useState<any>(null)

  useEffect(() => {
    // Generate mock player statistics on client side only
    const stats = {
      appearances: Math.floor(Math.random() * 30) + 10,
      goals: Math.floor(Math.random() * 15),
      assists: Math.floor(Math.random() * 10),
      yellowCards: Math.floor(Math.random() * 5),
      redCards: Math.floor(Math.random() * 2),
      minutesPlayed: Math.floor(Math.random() * 2000) + 500,
      passAccuracy: Math.floor(Math.random() * 20) + 75,
      shotsOnTarget: Math.floor(Math.random() * 20) + 10,
    }
    setPlayerStats(stats)
  }, [playerId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {playerStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{playerStats.appearances}</div>
              <div className="text-sm text-muted-foreground">Appearances</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{playerStats.goals}</div>
              <div className="text-sm text-muted-foreground">Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{playerStats.assists}</div>
              <div className="text-sm text-muted-foreground">Assists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{playerStats.minutesPlayed}</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{playerStats.passAccuracy}%</div>
              <div className="text-sm text-muted-foreground">Pass Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{playerStats.shotsOnTarget}</div>
              <div className="text-sm text-muted-foreground">Shots on Target</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{playerStats.yellowCards}</div>
              <div className="text-sm text-muted-foreground">Yellow Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{playerStats.redCards}</div>
              <div className="text-sm text-muted-foreground">Red Cards</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading statistics...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PlayerLoading() {
  return (
    <div className="space-y-8">
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Skeleton className="h-96 w-full" />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  )
}

interface PlayerPageProps {
  playerId: string
}

export function PlayerPageClient({ playerId }: PlayerPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<PlayerLoading />}>
        <PlayerContent playerId={playerId} />
      </Suspense>
    </div>
  )
}
