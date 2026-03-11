"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScoreFilters } from "@/components/scores/score-filters"
import { ScoreCard } from "@/components/scores/score-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Calendar } from "lucide-react"
import type { UnifiedFixture } from "@/lib/api/unified-sports-api"

function TodayMatchesSection() {
  const [fixtures, setFixtures] = useState<UnifiedFixture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    fetch("/api/scores/today")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) {
          setFixtures(Array.isArray(json.data) ? json.data : [])
          setError(!!json.error)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFixtures([])
          setError(true)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  if (error || fixtures.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {error ? "Failed to load today's matches" : "No matches scheduled for today"}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="space-y-4">
      {fixtures.map((fixture) => (
        <ScoreCard key={fixture.id} fixture={fixture} />
      ))}
    </div>
  )
}

function RecentResultsSection() {
  const [fixtures, setFixtures] = useState<UnifiedFixture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    fetch("/api/scores/recent")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) {
          setFixtures(Array.isArray(json.data) ? json.data : [])
          setError(!!json.error)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFixtures([])
          setError(true)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  if (error || fixtures.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {error ? "Failed to load recent results" : "No recent results available"}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="space-y-4">
      {fixtures.map((fixture) => (
        <ScoreCard key={fixture.id} fixture={fixture} />
      ))}
    </div>
  )
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
    <div className="container mx-auto px-4 py-8 pt-20" style={{ paddingTop: '80px' }}>
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
          <TodayMatchesSection />
        </TabsContent>

        <TabsContent value="results">
          <RecentResultsSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
