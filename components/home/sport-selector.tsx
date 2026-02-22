"use client"

import { useSportTheme, type Sport } from "@/components/sport-theme-provider"
import { cn } from "@/lib/utils"
import { Trophy, Activity, Target, Dumbbell, Medal } from "lucide-react"
import { motion } from "framer-motion"

const sports = [
    { id: "football", name: "Football", icon: Trophy, color: "text-green-500" },
    { id: "ufc", name: "UFC", icon: Dumbbell, color: "text-red-500" },
    { id: "basketball", name: "Basketball", icon: Activity, color: "text-orange-500" },
    { id: "tennis", name: "Tennis", icon: Target, color: "text-yellow-400" },
    { id: "boxing", name: "Boxing", icon: Medal, color: "text-blue-500" },
] as const

export function SportSelector() {
    const { sport, setSport } = useSportTheme()

    return (
        <div className="w-full py-8 bg-background/50 backdrop-blur-sm border-y border-border/50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center space-y-6">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Select Your Sport
                    </h2>

                    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                        {sports.map((item) => {
                            const Icon = item.icon
                            const isActive = sport === item.id

                            return (
                                <motion.button
                                    key={item.id}
                                    onClick={() => setSport(item.id as Sport)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        "group relative flex flex-col items-center justify-center p-4 rounded-2xl w-24 h-24 transition-all duration-300",
                                        isActive
                                            ? "bg-primary/10 ring-2 ring-primary shadow-lg shadow-primary/20"
                                            : "bg-card hover:bg-accent/50 border border-border/50 hover:border-primary/50"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "w-8 h-8 mb-2 transition-colors duration-300",
                                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            "text-xs font-medium transition-colors duration-300",
                                            isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                        )}
                                    >
                                        {item.name}
                                    </span>

                                    {isActive && (
                                        <motion.div
                                            layoutId="activeSport"
                                            className="absolute inset-0 rounded-2xl bg-primary/5 -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </motion.button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
