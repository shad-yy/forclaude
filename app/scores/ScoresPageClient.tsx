"use client"

import { Suspense, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"
import { ScoreFilters } from "@/components/scores/score-filters"
import { ScoreCard } from "@/components/scores/score-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Clock, Calendar } from "lucide-react"

// REMOVED: LiveScoresSection - Live features are not supported

async function TodayMatchesSection() {
  try {
    const todayFixtures = await unifiedSportsAPI.getTodayFixtures()

    return (
      <div className="space-y-4">
        {todayFixtures.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No matches scheduled for today</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          todayFixtures.map((fixture) => <ScoreCard key={fixture.id} fixture={fixture} />)
        )}
      </div>
    )
  } catch (error) {
    console.error("Error loading today's matches:", error)
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Failed to load today's matches</p>
          </div>
        </CardContent>
      </Card>
    )
  }
}

async function RecentResultsSection() {
  try {
    const recentResults = await unifiedSportsAPI.getRecentResults()

    return (
      <div className="space-y-4">
        {recentResults.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No recent results available</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          recentResults.map((fixture) => <ScoreCard key={fixture.id} fixture={fixture} />)
        )}
      </div>
    )
  } catch (error) {
    console.error("Error loading recent results:", error)
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Failed to load recent results</p>
          </div>
        </CardContent>
      </Card>
    )
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="text-center">
                <Skeleton className="h-6 w-16 mx-auto mb-1" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface FilterState {
  league: string
  timeFilter: string
  status: string
}

export default function ScoresPageClient() {
  const [filters, setFilters] = useState<FilterState>({
    league: "all",
    timeFilter: "today",
    status: "all",
  })

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    // TODO: Apply filters to data fetching
    console.log("Filters changed:", newFilters)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Scores & Results</h1>
        <p className="text-xl text-muted-foreground">Stay updated with today's matches and recent results</p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ScoreFilters onFiltersChange={handleFiltersChange} />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Today's Matches
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Recent Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <Suspense fallback={<LoadingSkeleton />}>
            <TodayMatchesSection />
          </Suspense>
        </TabsContent>

        <TabsContent value="results">
          <Suspense fallback={<LoadingSkeleton />}>
            <RecentResultsSection />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
