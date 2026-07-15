import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { EventDetailsTabs } from "@/components/events/event-details-tabs"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"
import type { SportsDbEvent } from "@/lib/types"

interface EventPageProps {
  params: {
    id: string
  }
}

async function getEventData(id: string) {
  try {
    const unifiedEvent = await unifiedSportsAPI.getFixture(id)
    return { unifiedEvent, sportsDbEvent: null as SportsDbEvent | null }
  } catch (error) {
    console.error("Error fetching event data:", error)
    return null
  }
}

function EventLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs skeleton */}
        <div className="space-y-4">
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}

export default async function EventPage({ params }: EventPageProps) {
  const eventData = await getEventData(params.id)

  if (!eventData?.unifiedEvent) {
    notFound()
  }

  const { unifiedEvent, sportsDbEvent } = eventData

  const getStatusBadgeVariant = (status: string) => {
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes('finished') || lowerStatus.includes('ft')) {
      return 'secondary'
    }
    if (lowerStatus.includes('live') || lowerStatus.includes('1h') || lowerStatus.includes('2h')) {
      return 'destructive'
    }
    if (lowerStatus.includes('scheduled') || lowerStatus.includes('ns')) {
      return 'outline'
    }
    return 'default'
  }

  const formatDateTime = (date: string, time: string) => {
    try {
      const eventDate = new Date(`${date}T${time}`)
      return {
        date: eventDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: eventDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    } catch (error) {
      return {
        date: date,
        time: time
      }
    }
  }

  const { date: formattedDate, time: formattedTime } = formatDateTime(unifiedEvent.date, unifiedEvent.time)

  return (
    <div className="container mx-auto px-4 pt-24 md:pt-28 pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Event Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {unifiedEvent.homeTeam} vs {unifiedEvent.awayTeam}
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  {unifiedEvent.league} • {formattedDate} at {formattedTime}
                </p>
              </div>
              <Badge variant={getStatusBadgeVariant(unifiedEvent.status)}>
                {unifiedEvent.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {/* Home Team */}
              <div className="flex items-center gap-4 flex-1">
                {unifiedEvent.homeLogo && (
                  <OptimizedImage
                    src={unifiedEvent.homeLogo}
                    alt={`${unifiedEvent.homeTeam} logo`}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{unifiedEvent.homeTeam}</h3>
                  <p className="text-sm text-muted-foreground">Home</p>
                </div>
              </div>

              {/* Score */}
              <div className="text-center px-8">
                <div className="text-3xl font-bold">
                  {unifiedEvent.homeScore !== null && unifiedEvent.awayScore !== null ? (
                    <>
                      {unifiedEvent.homeScore} - {unifiedEvent.awayScore}
                    </>
                  ) : (
                    <span className="text-muted-foreground text-lg">vs</span>
                  )}
                </div>
                {unifiedEvent.isLive && (
                  <Badge variant="destructive" className="mt-2">
                    LIVE
                  </Badge>
                )}
              </div>

              {/* Away Team */}
              <div className="flex items-center gap-4 flex-1 justify-end">
                <div className="text-right">
                  <h3 className="font-semibold text-lg">{unifiedEvent.awayTeam}</h3>
                  <p className="text-sm text-muted-foreground">Away</p>
                </div>
                {unifiedEvent.awayLogo && (
                  <OptimizedImage
                    src={unifiedEvent.awayLogo}
                    alt={`${unifiedEvent.awayTeam} logo`}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                )}
              </div>
            </div>

            {/* Venue */}
            {unifiedEvent.venue && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Venue:</span> {unifiedEvent.venue}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Details Tabs */}
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <EventDetailsTabs
            event={{
              id: params.id,
              homeTeam: unifiedEvent.homeTeam,
              awayTeam: unifiedEvent.awayTeam,
              homeLogo: unifiedEvent.homeLogo ?? undefined,
              awayLogo: unifiedEvent.awayLogo ?? undefined
            }}
            additionalInfo={sportsDbEvent}
          />
        </Suspense>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: EventPageProps) {
  const eventData = await getEventData(params.id)
  
  if (!eventData?.unifiedEvent) {
    return {
      title: 'Event Not Found - Smart Live TV',
      description: 'The requested event could not be found.'
    }
  }

  const { unifiedEvent } = eventData

  return {
    title: `${unifiedEvent.homeTeam} vs ${unifiedEvent.awayTeam} - Smart Live TV`,
    description: `Live coverage and details for ${unifiedEvent.homeTeam} vs ${unifiedEvent.awayTeam} in ${unifiedEvent.league}`,
    openGraph: {
      title: `${unifiedEvent.homeTeam} vs ${unifiedEvent.awayTeam}`,
      description: `${unifiedEvent.league} match details and live coverage`,
      images: unifiedEvent.homeLogo ? [unifiedEvent.homeLogo] : undefined,
    }
  }
}
