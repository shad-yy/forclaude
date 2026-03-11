import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"
import Link from "next/link"

interface LeaguePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: LeaguePageProps): Promise<Metadata> {
  try {
    const leagues = await unifiedSportsAPI.getLeagues()
    const league = leagues.find((l) => l.id === params.id)

    if (!league) {
      return {
        title: "League Not Found - Smart Live TV",
        description: "The requested league could not be found.",
      }
    }

    return {
      title: `${league.name} - Smart Live TV`,
      description: `Get the latest information about ${league.name}, including standings, fixtures, and team information.`,
    }
  } catch (error) {
    return {
      title: "League - Smart Live TV",
      description: "League information and statistics.",
    }
  }
}

async function LeagueContent({ leagueId }: { leagueId: string }) {
  try {
    const [leagues, teams, standings, fixtures] = await Promise.all([
      unifiedSportsAPI.getLeagues(),
      unifiedSportsAPI.getTeams(leagueId),
      unifiedSportsAPI.getStandings(leagueId),
      unifiedSportsAPI.getFixtures({ leagueId, next: 10 }),
    ])

    const league = leagues.find((l) => l.id === leagueId)

    if (!league) {
      notFound()
    }

    return (
      <div className="space-y-8">
        {/* League Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white/20">
                {league.logo ? (
                  <OptimizedImage src={league.logo} alt={league.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                    {league.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{league.name}</h1>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {league.country}
                  </Badge>
                  <Badge variant="outline" className="border-white/40 text-white">
                    {league.sport}
                  </Badge>
                  <span className="text-white/80">{league.type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="standings" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="standings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>League Standings</CardTitle>
              </CardHeader>
              <CardContent>
                {standings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Pos</th>
                          <th className="text-left p-2">Team</th>
                          <th className="text-center p-2">P</th>
                          <th className="text-center p-2">W</th>
                          <th className="text-center p-2">D</th>
                          <th className="text-center p-2">L</th>
                          <th className="text-center p-2">GF</th>
                          <th className="text-center p-2">GA</th>
                          <th className="text-center p-2">GD</th>
                          <th className="text-center p-2">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((team) => (
                          <tr key={team.teamId} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-medium">{team.position}</td>
                            <td className="p-2">
                              <Link
                                href={`/teams/${team.teamId}`}
                                className="flex items-center space-x-2 hover:underline"
                              >
                                <div className="relative w-6 h-6">
                                  <OptimizedImage src={team.teamLogo} alt={team.team} fill className="object-cover" />
                                </div>
                                <span>{team.team}</span>
                              </Link>
                            </td>
                            <td className="text-center p-2">{team.played}</td>
                            <td className="text-center p-2">{team.won}</td>
                            <td className="text-center p-2">{team.drawn}</td>
                            <td className="text-center p-2">{team.lost}</td>
                            <td className="text-center p-2">{team.goalsFor}</td>
                            <td className="text-center p-2">{team.goalsAgainst}</td>
                            <td className="text-center p-2">{team.goalDifference}</td>
                            <td className="text-center p-2 font-bold">{team.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No standings data available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fixtures" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Fixtures</CardTitle>
              </CardHeader>
              <CardContent>
                {fixtures.length > 0 ? (
                  <div className="space-y-4">
                    {fixtures.map((fixture) => (
                      <Link key={fixture.id} href={`/events/${fixture.id}`}>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                {fixture.homeLogo && (
                                  <div className="relative w-6 h-6">
                                    <OptimizedImage
                                      src={fixture.homeLogo}
                                      alt={fixture.homeTeam}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <span className="font-medium">{fixture.homeTeam}</span>
                              </div>
                              <span className="text-muted-foreground">vs</span>
                              <div className="flex items-center space-x-2">
                                {fixture.awayLogo && (
                                  <div className="relative w-6 h-6">
                                    <OptimizedImage
                                      src={fixture.awayLogo}
                                      alt={fixture.awayTeam}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <span className="font-medium">{fixture.awayTeam}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">
                                {fixture.date} at {fixture.time}
                              </div>
                              <Badge variant={fixture.isLive ? "destructive" : "secondary"}>{fixture.status}</Badge>
                            </div>
                          </div>
                          {fixture.venue && <p className="text-sm text-muted-foreground mt-2">{fixture.venue}</p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No fixtures data available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Teams</CardTitle>
              </CardHeader>
              <CardContent>
                {teams.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {teams.map((team) => (
                      <Link key={team.id} href={`/teams/${team.id}`}>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                              {team.logo ? (
                                <OptimizedImage src={team.logo} alt={team.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                                  {team.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold">{team.name}</h3>
                              <p className="text-sm text-muted-foreground">{team.country}</p>
                              {team.founded && <p className="text-xs text-muted-foreground">Founded: {team.founded}</p>}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No teams data available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>League Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span>{league.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Country</span>
                  <span>{league.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sport</span>
                  <span>{league.sport}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{league.type}</span>
                </div>

                {league.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{league.description}</p>
                  </div>
                )}
                {league.formedYear && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Founded</span>
                    <span>{league.formedYear}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error("Error loading league:", error)
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load league information. Please try again later.</p>
      </div>
    )
  }
}

function LeagueLoading() {
  return (
    <div className="space-y-8">
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}

export default function LeaguePage({ params }: LeaguePageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LeagueLoading />}>
        <LeagueContent leagueId={params.id} />
      </Suspense>
    </div>
  )
}
