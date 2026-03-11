import Link from "next/link"
import { Check, Shield, MonitorSmartphone, Zap, Ban } from "lucide-react"

const features = [
    {
        title: "No More Blackouts",
        description: "Watch every single 3pm Saturday game, local restrictions bypassed automatically.",
        icon: <Ban className="w-8 h-8 text-green-500" />,
    },
    {
        title: "Works On Every Device",
        description: "Stream anywhere on Firestick, Smart TVs, Apple TV, iPhone, Android, and PC.",
        icon: <MonitorSmartphone className="w-8 h-8 text-green-500" />,
    },
    {
        title: "Crystal Clear HD Quality",
        description: "Smooth 60FPS streams in 1080p and 4K. Anti-freeze technology ensures zero buffering.",
        icon: <Zap className="w-8 h-8 text-green-500" />,
    },
    {
        title: "Cancel Anytime",
        description: "No long-term contracts. No hidden fees. Complete control over your subscription.",
        icon: <Shield className="w-8 h-8 text-green-500" />,
    },
]

export function WhyIPTV() {
    return (
        <section className="py-20 md:py-32 bg-gray-900 border-y border-gray-800">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why Switch To Smart Live TV?</h2>
                    <p className="text-lg text-gray-400">
                        Stop paying hundreds for missing channels and blackout restrictions. Get the ultimate sports passing experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} className="bg-gray-950 p-8 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors flex flex-col items-start gap-4">
                            <div className="p-3 bg-gray-900 rounded-xl border border-gray-800">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mt-2">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link
                        href="/pricing"
                        className="inline-flex items-center justify-center px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg text-lg transition-transform transform hover:-translate-y-1 shadow-lg"
                    >
                        Try Free For 24 Hours — No Card Required
                    </Link>
                </div>
            </div>
        </section>
    )
}
