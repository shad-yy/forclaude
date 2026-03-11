"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock } from "lucide-react"

interface MatchData {
    idEvent: string
    strEvent: string
    strHomeTeam: string
    strAwayTeam: string
    strHomeTeamBadge: string
    strAwayTeamBadge: string
    intHomeScore: string | null
    intAwayScore: string | null
    strTime: string
    strDate: string
    strLeague: string
    strStatus: string
}

const LEAGUE_COLORS: Record<string, string> = {
    'Premier League': 'border-l-[#3d195b]',
    'La Liga': 'border-l-[#ff4b44]',
    'Bundesliga': 'border-l-[#d20515]',
    'Serie A': 'border-l-[#1a56a0]',
    'Ligue 1': 'border-l-[#091c3e]',
    'Champions League': 'border-l-[#1a3a6b]',
}

export function MatchCard() {
    const [matches, setMatches] = useState<MatchData[]>([])
    const [loading, setLoading] = useState(true)
    const [dayLabel, setDayLabel] = useState<string>("today")

    useEffect(() => {
        async function fetchFixtures() {
            try {
                const res = await fetch("/api/fixtures/today")
                if (res.ok) {
                    const json = await res.json()
                    setMatches(json.events || [])
                    setDayLabel(json.label || "today")
                }
            } catch (error) {
                console.error("Failed to load matches", error)
            } finally {
                setLoading(false)
            }
        }
        fetchFixtures()
    }, [])

    const getHeader = () => {
        if (dayLabel === "today") return "Tonight's Matches — Watch Live"
        if (dayLabel === "tomorrow") return "Tomorrow's Matches — Watch Live"
        return "Upcoming Matches — Watch Live"
    }

    const getLeagueColor = (leagueName: string) => {
        for (const [key, val] of Object.entries(LEAGUE_COLORS)) {
            if (leagueName.includes(key)) return val;
        }
        return 'border-l-accent-primary';
    }

    const getTeamInitials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()
    const getBgColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
        return `hsl(${Math.abs(hash) % 360}, 60%, 20%)`;
    }

    return (
        <section id="fixtures" className="py-20 bg-background relative border-t border-border">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                        {getHeader()}
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-[120px] w-full rounded-xl bg-surface-elevated border border-border" />
                        ))}
                    </div>
                ) : matches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matches.map((match) => {
                            const isLive = match.strStatus === "Live" || match.strStatus === "HT" || match.strStatus === "1H" || match.strStatus === "2H" || match.strStatus === "IN PLAY" || match.strStatus === "In Progress"
                            const isFinished = match.strStatus === "Match Finished" || match.strStatus === "FT"
                            const formattedTime = match.strTime ? match.strTime.substring(0, 5) : ""
                            const dateObj = match.strDate ? new Date(match.strDate) : null;
                            const formattedDate = dateObj ? dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : '';
                            const borderClass = getLeagueColor(match.strLeague);

                            return (
                                <div key={match.idEvent} className={`bg-surface border-y border-r border-border rounded-lg flex flex-col hover:bg-surface-elevated transition-colors group relative overflow-hidden h-auto min-h-[120px] shadow-sm border-l-[4px] ${borderClass}`}>
                                    {/* Header Row */}
                                    <div className="flex justify-between items-center px-4 py-2 border-b border-border/50 bg-background/50">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] sm:text-xs font-bold text-text-secondary uppercase tracking-wider truncate max-w-[150px] sm:max-w-[250px]">
                                                {match.strLeague}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-text-muted shrink-0">
                                            {formattedDate} {formattedTime}
                                        </div>
                                    </div>

                                    {/* Teams and Score Row */}
                                    <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 flex-1 gap-4 sm:gap-2">

                                        {/* Score / Teams container */}
                                        <div className="flex items-center justify-between w-full sm:w-auto sm:flex-1 gap-2">
                                            {/* Home Team */}
                                            <div className="flex items-center gap-2 flex-1 justify-end">
                                                <span className="text-sm sm:text-base font-semibold text-text-primary truncate text-right">{match.strHomeTeam}</span>
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border border-border bg-surface-elevated overflow-hidden" style={{ backgroundColor: !match.strHomeTeamBadge ? getBgColor(match.strHomeTeam) : '' }}>
                                                    <img
                                                        src={match.strHomeTeamBadge ? `${match.strHomeTeamBadge}/tiny` : 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}
                                                        alt={match.strHomeTeam}
                                                        className="max-h-6 max-w-6 sm:max-h-8 sm:max-w-8 object-contain"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            if (target.parentElement) {
                                                                target.parentElement.innerHTML = `<span class="text-[8px] font-bold text-white">${getTeamInitials(match.strHomeTeam)}</span>`;
                                                                target.parentElement.style.backgroundColor = getBgColor(match.strHomeTeam);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Score / Status Center */}
                                            <div className="flex flex-col items-center justify-center px-2 min-w-[60px] shrink-0">
                                                {(isFinished || isLive || (match.intHomeScore !== null && match.intAwayScore !== null)) ? (
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <span className="text-lg sm:text-xl font-black text-text-primary">{match.intHomeScore ?? '-'}</span>
                                                        <span className="text-text-muted font-bold">-</span>
                                                        <span className="text-lg sm:text-xl font-black text-text-primary">{match.intAwayScore ?? '-'}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-8">
                                                        <span className="text-text-muted font-bold text-sm">v</span>
                                                    </div>
                                                )}

                                                {isLive && (
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <div className="w-1.5 h-1.5 bg-live-red rounded-full animate-pulse shadow-[0_0_8px_#ff1744]" />
                                                        <span className="text-[9px] uppercase font-bold text-live-red">Live</span>
                                                    </div>
                                                )}
                                                {isFinished && <span className="text-[9px] uppercase font-bold text-text-muted mt-0.5">FT</span>}
                                                {!isLive && !isFinished && <Clock className="w-3 h-3 text-accent-primary mt-1" />}
                                            </div>

                                            {/* Away Team */}
                                            <div className="flex items-center gap-2 flex-1 justify-start">
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border border-border bg-surface-elevated overflow-hidden" style={{ backgroundColor: !match.strAwayTeamBadge ? getBgColor(match.strAwayTeam) : '' }}>
                                                    <img
                                                        src={match.strAwayTeamBadge ? `${match.strAwayTeamBadge}/tiny` : 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}
                                                        alt={match.strAwayTeam}
                                                        className="max-h-6 max-w-6 sm:max-h-8 sm:max-w-8 object-contain"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            if (target.parentElement) {
                                                                target.parentElement.innerHTML = `<span class="text-[8px] font-bold text-white">${getTeamInitials(match.strAwayTeam)}</span>`;
                                                                target.parentElement.style.backgroundColor = getBgColor(match.strAwayTeam);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm sm:text-base font-semibold text-text-primary truncate text-left">{match.strAwayTeam}</span>
                                            </div>
                                        </div>

                                        {/* Watch Button */}
                                        <Link
                                            href="/pricing"
                                            className="w-full sm:w-auto shrink-0 bg-accent-primary/10 hover:bg-accent-primary text-accent-primary hover:text-black font-bold text-xs px-4 py-2 rounded-md transition-colors border border-accent-primary/20 hover:border-accent-primary flex items-center justify-center whitespace-nowrap"
                                        >
                                            Watch Live →
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-surface rounded-2xl border border-border">
                        <p className="text-text-secondary text-lg">No matches found.</p>
                    </div>
                )}
            </div>
        </section>
    )
}
