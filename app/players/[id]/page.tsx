import type { Metadata } from "next"
import { PlayerPageClient } from "./PlayerPageClient"
import { unifiedSportsAPI } from "@/lib/api/unified-sports-api"

interface PlayerPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  try {
    const player = await unifiedSportsAPI.getPlayer(params.id)
    if (!player) {
      return {
        title: "Player Not Found - Smart Live TV",
        description: "The requested player could not be found.",
      }
    }

    return {
      title: `${player.name} - Smart Live TV`,
      description: `Get the latest information about ${player.name}, including stats, team information, and career highlights.`,
    }
  } catch (error) {
    return {
      title: "Player - Smart Live TV",
      description: "Player information and statistics.",
    }
  }
}

export default function PlayerPage({ params }: PlayerPageProps) {
  return <PlayerPageClient playerId={params.id} />
}
