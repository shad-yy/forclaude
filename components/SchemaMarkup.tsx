"use client"

import React from "react"

interface SchemaMarkupProps {
    schema: Record<string, unknown>
}

export function SchemaMarkup({ schema }: SchemaMarkupProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}
