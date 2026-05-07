import Link from "next/link"

import { StaggerChildren } from "@/components/ui/stagger-children"

const features = [
    {
        title: "Replaces Every Streaming Service",
        description: "Netflix, Disney+, Amazon Prime, Hulu, Apple TV+, Paramount+, Shahid — all included. Cancel every other subscription.",
        emoji: '📺',
    },
    {
        title: "All Live Sports Included",
        description: "Sky Sports, TNT Sports, beIN Sports, Premier Sports, Eurosport — every Premier League, Champions League, UFC, and F1 match live in 4K.",
        emoji: '⚽',
    },
    {
        title: "Works on Every Device",
        description: "Firestick, Smart TV, Android, iPhone, iPad, PC and Mac. Watch on up to 2 screens simultaneously.",
        emoji: '📱',
    },
    {
        title: "Save £100+ Every Month",
        description: "Sky Sports alone costs £43/month. Netflix is £18. Disney+ is £5. We include everything from £12/month total.",
        emoji: '💰',
    },
]

export function WhyIPTV() {
    return (
        <section className="py-20 md:py-32 bg-gray-900 border-y border-gray-800">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Cancel Every Subscription You Have</h2>
                    <p className="text-lg text-gray-400">
                        Sky Sports, Netflix, Disney+, Amazon Prime, Shahid — all replaced by one subscription at a fraction of the cost.
                    </p>
                </div>

                <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.12}>
                    {features.map((feature, i) => (
                        <div key={i} className="bg-gray-950 p-8 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors flex flex-col items-start gap-4">
                            <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 text-3xl">
                                {feature.emoji}
                            </div>
                            <h3 className="text-xl font-bold text-white mt-2">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </StaggerChildren>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
                    {[
                        { 
                        value: "£372", 
                        label: "Average annual saving vs Sky Sports",
                        sub: "Based on Sky's 2026 pricing"
                        },
                        { 
                        value: "5 min", 
                        label: "Average setup time",
                        sub: "Firestick, Smart TV, Android, iPhone"
                        },
                        { 
                        value: "230K+", 
                        label: "Live channels included",
                        sub: "Every plan, no extras"
                        },
                        { 
                        value: "99.9%", 
                        label: "Service uptime target",
                        sub: "Anti-buffer technology"
                        },
                    ].map(stat => (
                        <div key={stat.value} 
                        className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5 text-center">
                        <div className="text-2xl font-extrabold text-[#00e676] mb-1">
                            {stat.value}
                        </div>
                        <div className="text-white font-bold text-xs mb-1">
                            {stat.label}
                        </div>
                        <div className="text-gray-600 text-[10px]">{stat.sub}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link
                        href="/free-trial"
                        className="inline-flex items-center justify-center px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg text-lg transition-transform transform hover:-translate-y-1 shadow-lg"
                    >
                        Try Free For 24 Hours — No Card Required
                    </Link>
                </div>
            </div>
        </section>
    )
}
