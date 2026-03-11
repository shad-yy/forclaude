import Link from "next/link"
import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const tiers = [
    {
        name: "Basic",
        price: "£5.99",
        period: "/mo",
        description: "Standard IPTV channels for casual viewers.",
        features: [
            "5,000+ Channels",
            "1 Connection",
            "720p/1080p Quality",
            "Standard Support",
            "VOD Movies Library",
        ],
        popular: false,
    },
    {
        name: "Sports Fan",
        price: "£9.99",
        period: "/mo",
        description: "Everything a die-hard sports fan needs.",
        features: [
            "15,000+ Channels",
            <span key="1"><strong>Premier League</strong> ✓</span>,
            <span key="2"><strong>La Liga</strong> ✓</span>,
            <span key="3"><strong>Champions League</strong> ✓</span>,
            <span key="4"><strong>UFC</strong> ✓</span>,
            <span key="5"><strong>NBA</strong> ✓</span>,
            <span key="6"><strong>NFL</strong> ✓</span>,
            "2 Connections",
            "4K/60FPS Quality",
            "Anti-Freeze Tech",
        ],
        popular: true,
    },
    {
        name: "Premium",
        price: "£14.99",
        period: "/mo",
        description: "The ultimate entertainment package.",
        features: [
            "All Sports Fan Features",
            "20,000+ Channels",
            "4 Connections",
            "Adult Channels (Optional)",
            "Priority 24/7 Support",
            "Massive VOD Library",
        ],
        popular: false,
    },
]

export function PricingPreview() {
    return (
        <section className="py-20 md:py-32 bg-gray-950">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Choose Your Plan</h2>
                    <p className="text-lg text-gray-400">
                        Simple, transparent pricing. 24-hour free trial. Cancel anytime. No contracts.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`relative bg-gray-900 rounded-3xl p-8 flex flex-col h-full border ${tier.popular ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.15)] md:-mt-4 md:mb-4' : 'border-gray-800'}`}
                        >
                            {tier.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <Badge className="bg-green-500 text-black hover:bg-green-400 font-bold px-4 py-1 text-sm border-none uppercase tracking-wide">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                                <p className="text-gray-400 text-sm">{tier.description}</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                                <span className="text-gray-400">{tier.period}</span>
                            </div>

                            <div className="flex-1">
                                <ul className="space-y-4 mb-8">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                            <span className="text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-auto pt-4">
                                <Link
                                    href="/pricing"
                                    className={`flex w-full justify-center px-6 py-4 rounded-xl font-bold text-lg transition-transform transform hover:-translate-y-1 ${tier.popular
                                            ? 'bg-green-500 text-black hover:bg-green-400'
                                            : 'bg-gray-800 text-white hover:bg-gray-700'
                                        }`}
                                >
                                    Start Free Trial
                                </Link>
                                <div className="text-center mt-4">
                                    <span className="text-xs text-gray-500">24-hour free trial • Cancel anytime • No contracts</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
