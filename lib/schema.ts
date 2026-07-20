interface SportsEventParams {
    name: string
    homeTeam: string
    awayTeam: string
    date: string
    league: string
}

interface FAQParams {
    question: string
    answer: string
}

export function generateSportsEventSchema({ name, homeTeam, awayTeam, date, league }: SportsEventParams) {
    return {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name: name,
        startDate: date,
        homeTeam: {
            "@type": "SportsTeam",
            name: homeTeam,
        },
        awayTeam: {
            "@type": "SportsTeam",
            name: awayTeam,
        },
        sport: "Soccer",
        competitor: [
            {
                "@type": "SportsTeam",
                name: homeTeam,
            },
            {
                "@type": "SportsTeam",
                name: awayTeam,
            },
        ],
        // The event is part of a larger league/tournament
        superEvent: {
            "@type": "SportsEvent",
            name: league,
        },
    }
}

export function generateFAQSchema(faqs: FAQParams[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    }
}

export function generateOrganizationSchema() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://smart-live-tv.vercel.app"
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "SmartLiveTV",
        url: baseUrl,
        logo: `${baseUrl}/icon.png`,
        sameAs: [
            "https://www.trustpilot.com/review/smartlivetv.co.uk",
            "https://twitter.com/SmartLiveTV",
            "https://facebook.com/SmartLiveTV",
            "https://www.instagram.com/smartlivetv",
        ],
    }
}

export function generateWebPageSchema(title: string, description: string, url: string) {
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description: description,
        url: url,
    }
}
