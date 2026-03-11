import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Calendar, MapPin, Clock, Users, Trophy, Star, Zap } from "lucide-react"
import Link from "next/link"
import { getApiBaseUrl } from "@/lib/utils/url"

async function fetchUfcEvent(id: string) {
  const res = await fetch(`${getApiBaseUrl()}/api/ufc/events/${id}`, { cache: "no-store" })
  const json = await res.json()
  return json?.data ?? null
}

interface UFCEventPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: UFCEventPageProps): Promise<Metadata> {
  const { id } = params
  const event = await fetchUfcEvent(id)

  if (!event) {
    return {
      title: "Event Not Found | UFC",
      description: "The requested UFC event could not be found.",
    }
  }

  return {
    title: `${event.name} | UFC Event`,
    description: `${event.name} taking place on ${new Date(event.date).toLocaleDateString()} at ${event.location}. ${event.mainEvent ? `Main Event: ${event.mainEvent}` : ''}`,
    keywords: [`UFC`, `MMA`, event.name, `UFC Event`, event.location, event.mainEvent].filter((k): k is string => typeof k === 'string'),
    openGraph: {
      title: event.name,
      description: `UFC Event at ${event.location}`,
      images: [{ url: event.image || '/ufc-default.jpg' }],
      type: "article",
    },
  }
}

export default async function UFCEventPage({ params }: UFCEventPageProps) {
  const { id } = params
  const event = await fetchUfcEvent(id)

  if (!event) {
    notFound()
  }

  const eventDate = new Date(event.date)
  const isUpcoming = eventDate > new Date()
  const isLive = event.status === "Live"

  // Mock fight card data (in real implementation, this would come from the API)
  const mockFightCard = [
    {
      segment: "Main Card",
      fights: [
        {
          id: "main-event",
          fighter1: "Alex Pereira",
          fighter2: "Jamahal Hill",
          weightClass: "Light Heavyweight Championship",
          isMainEvent: true,
          result: isUpcoming ? null : "Pereira wins by KO (Round 1, 2:47)"
        },
        {
          id: "co-main",
          fighter1: "Zhang Weili",
          fighter2: "Yan Xiaonan",
          weightClass: "Women's Strawweight",
          isMainEvent: false,
          result: isUpcoming ? null : "Zhang wins by Decision"
        },
        {
          id: "main-3",
          fighter1: "Max Holloway",
          fighter2: "Justin Gaethje",
          weightClass: "Lightweight",
          isMainEvent: false,
          result: isUpcoming ? null : "Holloway wins by KO (Round 5, 4:48)"
        }
      ]
    },
    {
      segment: "Preliminary Card",
      fights: [
        {
          id: "prelim-1",
          fighter1: "Jiri Prochazka",
          fighter2: "Aleksandar Rakic",
          weightClass: "Light Heavyweight",
          isMainEvent: false,
          result: isUpcoming ? null : "Prochazka wins by TKO (Round 2, 1:32)"
        },
        {
          id: "prelim-2",
          fighter1: "Kayla Harrison",
          fighter2: "Holly Holm",
          weightClass: "Women's Bantamweight",
          isMainEvent: false,
          result: isUpcoming ? null : "Harrison wins by Submission (Round 2, 3:15)"
        }
      ]
    },
    {
      segment: "Early Preliminary Card",
      fights: [
        {
          id: "early-1",
          fighter1: "Bobby Green",
          fighter2: "Jim Miller",
          weightClass: "Lightweight",
          isMainEvent: false,
          result: isUpcoming ? null : "Green wins by Decision"
        },
        {
          id: "early-2",
          fighter1: "Cody Garbrandt",
          fighter2: "Deiveson Figueiredo",
          weightClass: "Bantamweight",
          isMainEvent: false,
          result: isUpcoming ? null : "Figueiredo wins by Submission (Round 1, 4:12)"
        }
      ]
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 bg-gray-950 min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-400">
        <Link href="/ufc" className="hover:text-white transition-colors">UFC</Link>
        <span>/</span>
        <Link href="/ufc" className="hover:text-white transition-colors">Events</Link>
        <span>/</span>
        <span className="text-white">{event.name}</span>
      </nav>

      {/* Event Header */}
      <div className="relative">
        <Card className="bg-gradient-to-r from-red-900/20 via-gray-900/50 to-red-900/20 border-red-500/30 overflow-hidden">
          <div className="absolute inset-0">
            <OptimizedImage
              src={event.image || '/ufc-default.jpg'}
              alt={event.name}
              width={1200}
              height={400}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
          </div>
          
          <CardContent className="relative p-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge 
                    className={
                      isLive 
                        ? "bg-red-500 text-white animate-pulse" 
                        : isUpcoming 
                        ? "bg-blue-500 text-white" 
                        : "bg-green-500 text-white"
                    }
                  >
                    {isLive ? "🔴 LIVE" : event.status}
                  </Badge>
                  {event.mainEvent && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                      <Star className="w-3 h-3 mr-1" />
                      Main Event
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {event.name}
                </h1>

                {event.mainEvent && (
                  <p className="text-xl text-red-400 mb-6 font-semibold">
                    {event.mainEvent}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-semibold">{eventDate.toLocaleDateString()}</div>
                      <div className="text-sm text-gray-400">Event Date</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-semibold">{event.location}</div>
                      <div className="text-sm text-gray-400">Venue</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-semibold">
                        {isUpcoming ? "Upcoming" : isLive ? "Live Now" : "Completed"}
                      </div>
                      <div className="text-sm text-gray-400">Status</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Poster */}
              <div className="flex-shrink-0">
                <OptimizedImage
                  src={event.image || '/ufc-default.jpg'}
                  alt={event.name}
                  width={300}
                  height={400}
                  className="w-64 h-80 object-cover rounded-lg border-2 border-red-500/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fight Card */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-red-500" />
          <h2 className="text-3xl font-bold text-white">Fight Card</h2>
        </div>

        {mockFightCard.map((segment) => (
          <Card key={segment.segment} className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {segment.segment === "Main Card" && <Trophy className="w-5 h-5 text-yellow-500" />}
                {segment.segment === "Preliminary Card" && <Zap className="w-5 h-5 text-blue-500" />}
                {segment.segment === "Early Preliminary Card" && <Clock className="w-5 h-5 text-gray-500" />}
                {segment.segment}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {segment.fights.map((fight) => (
                  <div 
                    key={fight.id} 
                    className={`p-4 rounded-lg border transition-all ${
                      fight.isMainEvent 
                        ? "border-red-500/50 bg-red-900/10" 
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {fight.isMainEvent && (
                            <Badge className="bg-red-500 text-white">
                              <Star className="w-3 h-3 mr-1" />
                              Main Event
                            </Badge>
                          )}
                          <Badge variant="outline" className="border-gray-600">
                            {fight.weightClass}
                          </Badge>
                        </div>
                        
                        <div className="text-lg font-semibold text-white mb-1">
                          {fight.fighter1} vs {fight.fighter2}
                        </div>
                        
                        {fight.result && (
                          <div className="text-green-400 font-medium">
                            {fight.result}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isLive && !fight.result && (
                          <Badge className="bg-red-500 text-white animate-pulse">
                            LIVE
                          </Badge>
                        )}
                        {isUpcoming && (
                          <Badge className="bg-blue-500 text-white">
                            Scheduled
                          </Badge>
                        )}
                        {fight.result && (
                          <Badge className="bg-green-500 text-white">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/ufc" 
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg transition-colors"
            >
              Back to UFC
            </Link>
            <Link 
              href="/ufc#events" 
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition-colors"
            >
              View All Events
            </Link>
            {isUpcoming && (
              <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg transition-colors">
                Set Reminder
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
