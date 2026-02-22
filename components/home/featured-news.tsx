"use client"

import { OptimizedImage } from "@/components/ui/optimized-image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Mock data for initial render / fallback
const MOCK_NEWS = [
    {
        id: "1",
        title: "Championship Finals: The Ultimate Showdown Begins Tonight",
        description: "Two titans clash in what promises to be the most electric final in recent history. Here's everything you need to know before kickoff.",
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop",
        category: "Football",
        time: "2 hours ago",
        author: "James Wilson"
    },
    {
        id: "2",
        title: "UFC 300: Main Event Predictions and Analysis",
        description: "Expert breakdown of the stacked card coming this weekend.",
        image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1000&auto=format&fit=crop",
        category: "UFC",
        time: "4 hours ago",
        author: "Sarah Connor"
    },
    {
        id: "3",
        title: "NBA Trade Deadline: Winners and Losers",
        description: "A comprehensive look at how the landscape has shifted.",
        image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000&auto=format&fit=crop",
        category: "Basketball",
        time: "5 hours ago",
        author: "Mike Ross"
    },
    {
        id: "4",
        title: "Rising Star Breaks All-Time Rookie Record",
        description: "History was made last night in a stunning performance.",
        image: "https://images.unsplash.com/photo-1519766304800-c36444224b79?q=80&w=1000&auto=format&fit=crop",
        category: "Tennis",
        time: "8 hours ago",
        author: "Jessica Pearson"
    }
]

export function FeaturedNews() {
    return (
        <section className="py-16 md:py-24 container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">Trending Now</h2>
                    <p className="text-muted-foreground">Top stories from the world of sports</p>
                </div>
                <Link href="/news" className="hidden md:flex items-center text-primary hover:text-primary/80 transition-colors font-medium">
                    View All News <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
                {/* Main Feature - Spans 8 cols */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="md:col-span-8 relative group cursor-pointer overflow-hidden rounded-3xl h-[400px] md:h-full"
                >
                    <Link href={`/news/${MOCK_NEWS[0].id}`} className="block h-full w-full">
                        <div className="absolute inset-0">
                            <OptimizedImage
                                src={MOCK_NEWS[0].image}
                                alt={MOCK_NEWS[0].title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        </div>

                        <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                            <Badge className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90 border-none px-3 py-1 text-sm">
                                {MOCK_NEWS[0].category}
                            </Badge>
                            <h3 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight group-hover:text-primary/90 transition-colors">
                                {MOCK_NEWS[0].title}
                            </h3>
                            <p className="text-gray-300 text-lg line-clamp-2 mb-4 max-w-2xl">
                                {MOCK_NEWS[0].description}
                            </p>
                            <div className="flex items-center text-gray-400 text-sm space-x-4">
                                <span className="font-medium text-white">{MOCK_NEWS[0].author}</span>
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {MOCK_NEWS[0].time}</span>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* Side Column - Spans 4 cols */}
                <div className="md:col-span-4 flex flex-col gap-6 h-full">
                    {MOCK_NEWS.slice(1).map((news, index) => (
                        <motion.div
                            key={news.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex-1 relative group cursor-pointer overflow-hidden rounded-2xl min-h-[180px]"
                        >
                            <Link href={`/news/${news.id}`} className="block h-full w-full">
                                <div className="absolute inset-0">
                                    <OptimizedImage
                                        src={news.image}
                                        alt={news.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                </div>

                                <div className="absolute bottom-0 left-0 p-5 w-full">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border-none text-xs">
                                            {news.category}
                                        </Badge>
                                        <span className="text-xs text-gray-400 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" /> {news.time}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-bold text-white leading-snug group-hover:text-primary/90 transition-colors line-clamp-2">
                                        {news.title}
                                    </h4>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="mt-8 text-center md:hidden">
                <Button variant="outline" className="w-full rounded-full" asChild>
                    <Link href="/news">View All News</Link>
                </Button>
            </div>
        </section>
    )
}
