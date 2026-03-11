import { NextRequest, NextResponse } from "next/server"
import { API_CONFIG } from "@/lib/config"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
    try {
        const pathBytes = params.path.join('/')
        const url = new URL(request.url)

        // Construct the private authenticated URL
        const apiKey = API_CONFIG.thesportsdb.apiKey || "123"
        const targetUrl = `https://www.thesportsdb.com/api/v1/json/${apiKey}/${pathBytes}${url.search}`

        const res = await fetch(targetUrl, {
            headers: {
                'Accept': 'application/json'
            },
            next: { revalidate: 60 } // Default cache
        })

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to proxy request" }, { status: res.status })
        }

        // TheSportsDB often returns content-type text/html even for JSON, so we just read as text then parse to avoid errors
        const textData = await res.text()
        let data;
        try {
            data = JSON.parse(textData)
        } catch {
            return NextResponse.json({ error: "Invalid JSON from proxy" }, { status: 500 })
        }

        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
            }
        })
    } catch (error) {
        console.warn("[Proxy API] Error proxying to TheSportsDB:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
