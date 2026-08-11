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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://smartlivetv.co.uk"
    const startIso = date ? (date.includes('T') ? date : `${date}T20:00:00+00:00`) : new Date().toISOString()
    const endDateObj = new Date(startIso)
    endDateObj.setHours(endDateObj.getHours() + 2)
    const endIso = endDateObj.toISOString()

    return {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name: name,
        description: `Watch ${name} live stream in HD and 4K UHD. ${league} fixture.`,
        startDate: startIso,
        endDate: endIso,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
            "@type": "Place",
            name: `${homeTeam} Stadium`,
            address: {
                "@type": "PostalAddress",
                addressCountry: "GB",
            },
        },
        homeTeam: {
            "@type": "SportsTeam",
            name: homeTeam,
        },
        awayTeam: {
            "@type": "SportsTeam",
            name: awayTeam,
        },
        performer: [
            { "@type": "SportsTeam", name: homeTeam },
            { "@type": "SportsTeam", name: awayTeam },
        ],
        sport: "Soccer",
        organizer: {
            "@type": "Organization",
            name: league,
            url: baseUrl,
        },
        superEvent: {
            "@type": "EventSeries",
            name: league,
            url: `${baseUrl}/watch/premier-league`,
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://smartlivetv.co.uk"
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

export function generateSpeakableSchema(url: string, cssSelectors: string[] = ["h1", ".summary", ".score-display"]) {
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        url: url,
        speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: cssSelectors,
        },
    }
}
