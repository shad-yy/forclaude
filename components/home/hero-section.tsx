"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, PlayCircle } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function HeroSection() {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    return (
        <div ref={ref} className="relative h-[80vh] min-h-[600px] w-full overflow-hidden flex items-center justify-center">
            {/* Animated Background */}
            <motion.div
                style={{ y, opacity }}
                className="absolute inset-0 z-0"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40" />

                {/* Animated Particles/Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 mix-blend-overlay animate-pulse-slow" />
            </motion.div>

            {/* Content */}
            <div className="relative z-20 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Experience Sports <br />
                        <span className="text-primary">Like Never Before</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                        Live scores, breaking news, and immersive stats for the modern fan.
                        Welcome to the future of sports coverage.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
                            Get Started <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg backdrop-blur-sm bg-background/10 border-white/10 hover:bg-background/20">
                            Watch Demo <PlayCircle className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse" />
            </motion.div>
        </div>
    )
}
