"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

const FEATURED_LEAGUES = [
    { id: "4328", name: "Premier League" },
    { id: "4335", name: "La Liga" },
    { id: "4331", name: "Bundesliga" },
    { id: "4332", name: "Serie A" },
    { id: "4334", name: "Ligue 1" },
]

export function LeagueTables() {
    const [activeTab, setActiveTab] = useState(FEATURED_LEAGUES[0])
    const [standings, setStandings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStandings() {
            setLoading(true)
            try {
                const res = await fetch(`/api/standings/${activeTab.id}`)
                if (res.ok) {
                    const json = await res.json()
                    setStandings(json.data || [])
                }
            } catch (error) {
                console.error(`Failed to load standings for ${activeTab.name}`, error)
            } finally {
                setLoading(false)
            }
        }

        fetchStandings()
    }, [activeTab.id]) // Re-fetch when tab changes

    const getTeamInitials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()

    // Deterministic color
    const getBgColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
        return `hsl(${Math.abs(hash) % 360}, 60%, 20%)`;
    }

    const renderFormPills = (formStr: string) => {
        if (!formStr) return null;
        return (
            <div className="flex items-center gap-1 justify-center">
                {formStr.split('').slice(0, 5).map((char, idx) => {
                    let bgColor = "bg-gray-600";
                    if (char === 'W') bgColor = "bg-accent-primary";
                    if (char === 'L') bgColor = "bg-live-red";
                    if (char === 'D') bgColor = "bg-gray-500";
                    return (
                        <div key={idx} className={`w-3 h-3 md:w-4 md:h-4 rounded-sm flex items-center justify-center ${bgColor}`}>
                            <span className="text-[8px] md:text-[10px] font-bold text-white leading-none">{char}</span>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <section className="py-20 bg-background border-t border-border relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
                        Live Standings <span className="text-accent-primary">— Stream Every Game</span>
                    </h2>
                    <p className="text-text-secondary">See who's on top and never miss a critical matchup.</p>
                </div>

                {/* Swipeable Tabs */}
                <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-4 border-b border-border">
                    {FEATURED_LEAGUES.map((league) => (
                        <button
                            key={league.id}
                            onClick={() => setActiveTab(league)}
                            className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all ${activeTab.id === league.id
                                    ? 'bg-accent-primary text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                                    : 'bg-surface-elevated text-text-secondary hover:bg-white/10 hover:text-text-primary'
                                }`}
                        >
                            {league.name}
                        </button>
                    ))}
                </div>

                {/* Table Content */}
                <div className="bg-surface rounded-2xl border border-border overflow-hidden mb-8 shadow-xl">
                    <div className="grid grid-cols-12 gap-2 p-4 text-xs font-bold text-text-muted uppercase tracking-wider bg-surface-elevated border-b border-border">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-4 md:col-span-5">Club</div>
                        <div className="col-span-2 text-center">MP</div>
                        <div className="col-span-3 text-center">Form</div>
                        <div className="col-span-2 text-center text-text-primary">Pts</div>
                    </div>

                    {loading ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-10 w-full bg-surface-elevated rounded-lg" />
                            ))}
                        </div>
                    ) : standings.length > 0 ? (
                        <div className="flex flex-col divide-y divide-border">
                            {standings.map((team, index) => (
                                <div key={team.teamId || index} className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-surface-elevated transition-colors text-sm font-medium">
                                    <div className="col-span-1 text-center text-text-secondary">{team.position}</div>
                                    <div className="col-span-4 md:col-span-5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: !team.teamLogo ? getBgColor(team.team) : 'transparent' }}>
                                            {team.teamLogo ? (
                                                <img
                                                    src={team.teamLogo.includes('/small') || team.teamLogo.includes('/tiny') ? team.teamLogo : `${team.teamLogo}/tiny`}
                                                    alt={team.team}
                                                    className="max-h-8 max-w-8 object-contain"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        if (target.parentElement) {
                                                            target.parentElement.innerHTML = `<span class="text-[10px] font-bold text-white">${getTeamInitials(team.team)}</span>`;
                                                            target.parentElement.style.backgroundColor = getBgColor(team.team);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-[10px] font-bold text-white">{getTeamInitials(team.team)}</span>
                                            )}
                                        </div>
                                        <span className="font-bold text-text-primary line-clamp-1">{team.team}</span>
                                    </div>
                                    <div className="col-span-2 text-center text-text-secondary">{team.played}</div>
                                    <div className="col-span-3 text-center">
                                        {renderFormPills(team.form)}
                                    </div>
                                    <div className="col-span-2 text-center font-bold text-accent-primary">{team.points}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-text-secondary">
                            Data temporarily unavailable.
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <Link
                        href={`/watch/${activeTab.name.toLowerCase().replace(/ /g, '-')}`}
                        className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-accent-primary text-accent-primary font-bold rounded-lg transition-all hover:bg-accent-primary hover:text-black"
                    >
                        Watch {activeTab.name} Live →
                    </Link>
                </div>
            </div>
        </section>
    )
}
