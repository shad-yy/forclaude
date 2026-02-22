import { Suspense } from "react"
import { AnimatedHero } from "@/components/homepage/animated-hero"
import { StandingsWidget } from "@/components/homepage/standings-widget"
import { EventsList } from "@/components/homepage/events-list"
import { NewsSection } from "@/components/homepage/news-section"
import { Skeleton } from "@/components/ui/skeleton"
import { MotionWrapper } from "@/components/ui/motion-wrapper"

function WidgetSkeleton() {
  return <Skeleton className="h-96 w-full rounded-3xl" />
}

export default function HomePage() {
  const today = new Date().toISOString().split("T")[0]
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated Hero Section */}
      <div className="container mx-auto px-4 py-6 md:py-12">
        <AnimatedHero />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-24 space-y-24 md:space-y-32">
        {/* News Section - Prominently Featured */}
        <MotionWrapper>
          <Suspense fallback={<WidgetSkeleton />}>
            <NewsSection maxArticles={6} />
          </Suspense>
        </MotionWrapper>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column - Standings */}
          <div className="lg:col-span-4">
            <MotionWrapper delay={0.1}>
              <Suspense fallback={<WidgetSkeleton />}>
                <StandingsWidget leagueId="4328" leagueName="English Premier League" season={2024} maxResults={10} />
              </Suspense>
            </MotionWrapper>
          </div>

          {/* Right Column - Events */}
          <div className="lg:col-span-8 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <MotionWrapper delay={0.2}>
                <Suspense fallback={<WidgetSkeleton />}>
                  <EventsList
                    title="Today's Matches"
                    leagueId="4328"
                    maxResults={5}
                    showUpcoming={true}
                    date={today}
                    sport="Soccer"
                  />
                </Suspense>
              </MotionWrapper>

              <MotionWrapper delay={0.3}>
                <Suspense fallback={<WidgetSkeleton />}>
                  <EventsList
                    title="Recent Results"
                    leagueId="4328"
                    maxResults={5}
                    showUpcoming={false}
                  />
                </Suspense>
              </MotionWrapper>
            </div>
          </div>
        </div>

        {/* Additional Leagues - Premier League, La Liga, Serie A */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          <MotionWrapper delay={0.1}>
            <Suspense fallback={<WidgetSkeleton />}>
              <StandingsWidget leagueId="4335" leagueName="Spanish La Liga" season={2024} maxResults={8} />
            </Suspense>
          </MotionWrapper>

          <MotionWrapper delay={0.2}>
            <Suspense fallback={<WidgetSkeleton />}>
              <StandingsWidget leagueId="4332" leagueName="Italian Serie A" season={2024} maxResults={8} />
            </Suspense>
          </MotionWrapper>

          <MotionWrapper delay={0.3}>
            <Suspense fallback={<WidgetSkeleton />}>
              <StandingsWidget leagueId="4331" leagueName="German Bundesliga" season={2024} maxResults={8} />
            </Suspense>
          </MotionWrapper>
        </div>
      </div>
    </div>
  )
}
