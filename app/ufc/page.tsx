import { Suspense } from "react"
import type { Metadata } from "next"
import { ENV } from "@/lib/config/env"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Calendar, MapPin, Trophy, Users, Clock, Star } from "lucide-react"
import Link from "next/link"
import { getUpcomingEvents, getPastEvents, getRankings } from "@/lib/api/ufc"
import { FadeIn } from "@/components/ui/fade-in"
import { StaggerIn } from "@/components/ui/stagger-in"

export const metadata: Metadata = {
  title: "UFC — Live Events, Fighter Rankings & Coverage",
  description:
    "Latest UFC events, fighter rankings, and mixed martial arts coverage. Stay updated with upcoming fights and champion rankings.",
  keywords: ["UFC", "MMA", "Mixed Martial Arts", "Fighter Rankings", "UFC Events", "Combat Sports"],
  alternates: { canonical: `${ENV.BASE_URL}/ufc` },
  openGraph: {
    title: "UFC - Ultimate Fighting Championship",
    description: "Latest UFC events, fighter rankings, and mixed martial arts coverage",
    type: "website",
  },
}

async function UFCEvents() {
  const [upcomingEvents, pastEvents] = await Promise.all([getUpcomingEvents(), getPastEvents()])

  return (
    <div className="space-y-6">
      {/* Upcoming Events */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-red-500" />
          Upcoming Events
        </h3>
        {upcomingEvents.length > 0 ? (
          <StaggerIn className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Link key={event.id} href={`/ufc/events/${event.id}`}>
                <Card className="bg-gray-900/50 border-gray-800 hover:border-red-500/50 transition-all duration-300 cursor-pointer group">
                  <div className="relative overflow-hidden">
                    <OptimizedImage
                      src={event.image || "/placeholder-logo.png"}
                      alt={event.name}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-red-500 text-white">{event.status}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                      {event.name}
                    </h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                      {event.mainEvent && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          {event.mainEvent}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </StaggerIn>
        ) : (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Upcoming Events</h3>
              <p className="text-gray-400">Check back soon for the latest UFC event announcements.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Events */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Recent Events
        </h3>
        {Array.isArray(pastEvents) && pastEvents.length > 0 ? (
          <StaggerIn className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.slice(0, 6).map((event) => (
              <Link key={event.id} href={`/ufc/events/${event.id}`}>
                <Card className="bg-gray-900/50 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer group">
                  <div className="relative overflow-hidden">
                    <OptimizedImage
                      src={event.image || "/placeholder-logo.png"}
                      alt={event.name}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary">{event.status}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                      {event.name}
                    </h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                      {event.mainEvent && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          {event.mainEvent}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </StaggerIn>
        ) : (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Recent Events</h3>
              <p className="text-gray-400">Recent UFC events will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

async function UFCRankings() {
  const rankings = await getRankings()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Current Champions & Top Contenders
        </h3>
      </div>

      {rankings.length > 0 ? (
        <StaggerIn className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rankings.map((fighter) => (
            <Link key={fighter.id} href={`/ufc/fighters/${fighter.id}`}>
              <Card className="bg-gray-900/50 border-gray-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <OptimizedImage
                        src={fighter.photo || "/placeholder-logo.png"}
                        alt={fighter.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-700 group-hover:border-blue-500 transition-colors"
                      />
                      {fighter.ranking === "Champion" && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Trophy className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                          {fighter.name}
                        </h4>
                        {fighter.nickname && <span className="text-sm text-gray-400 italic">"{fighter.nickname}"</span>}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Division:</span>
                          <span className="text-white">{fighter.weightClass}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Ranking:</span>
                          <Badge
                            className={
                              fighter.ranking === "Champion" ? "bg-yellow-500 text-black" : "bg-blue-500 text-white"
                            }
                          >
                            {fighter.ranking}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Record:</span>
                          <span className="text-white font-mono">{fighter.record}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Country:</span>
                          <span className="text-white">{fighter.country}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </StaggerIn>
      ) : (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Rankings Available</h3>
            <p className="text-gray-400">Fighter rankings will be displayed here when available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function UFCPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', 
        item: `${ENV.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'UFC', 
        item: `${ENV.BASE_URL}/ufc` },
    ],
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl pt-28 md:pt-36 pb-16 md:pb-20 space-y-8 bg-gray-950 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Header */}
      <FadeIn>
      <div className="text-center mb-12 pt-8">
        <div className="flex items-center justify-center mb-6">
          <img
            src="/leagues/ufc.png"
            alt="UFC"
            width={72}
            height={72}
            className="object-contain"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          UFC — Fight Night Coverage
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          Every UFC event live in 4K. Prelims, main card, and PPV — 
          all included with your subscription. No extra charges.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/free-trial"
            className="bg-[#00e676] text-black font-bold px-8 py-3.5 
              rounded-xl text-sm hover:bg-[#00ff87] transition-all
              touch-manipulation"
          >
            Start Watching Now →
          </Link>
          <Link
            href="/free-trial"
            className="border border-[#2a2a3a] hover:border-[#00e676]/40 
              text-gray-300 font-bold px-8 py-3.5 rounded-xl text-sm
              transition-all"
          >
            Try Free for 24H
          </Link>
        </div>
      </div>
      </FadeIn>

      {/* Main Content */}
      <FadeIn direction="up">
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-8">
          <TabsTrigger value="events" className="data-[state=active]:bg-red-500">
            Events
          </TabsTrigger>
          <TabsTrigger value="rankings" className="data-[state=active]:bg-blue-500">
            Rankings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Suspense
            fallback={
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="bg-gray-900/50 border-gray-800">
                      <div className="w-full h-48 bg-gray-800 animate-pulse" />
                      <CardContent className="p-4 space-y-3">
                        <div className="h-4 bg-gray-800 rounded animate-pulse" />
                        <div className="h-3 bg-gray-800 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-gray-800 rounded animate-pulse w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            }
          >
            <UFCEvents />
          </Suspense>
        </TabsContent>

        <TabsContent value="rankings">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-gray-800 rounded-full animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-800 rounded animate-pulse" />
                          <div className="h-3 bg-gray-800 rounded animate-pulse w-3/4" />
                          <div className="h-3 bg-gray-800 rounded animate-pulse w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            <UFCRankings />
          </Suspense>
        </TabsContent>
      </Tabs>
      </FadeIn>
    </div>
  )
}
