import type { Metadata } from "next"
import SubscribeClient from "./subscribe-client"
import { ENV } from '@/lib/config/env'

export const metadata: Metadata = {
  title: "Subscribe",
  description: "Get premium sports coverage, live scores, and real-time updates.",
  alternates: { canonical: `${ENV.BASE_URL}/subscribe` },
}

export default function SubscribePage() {
  return <SubscribeClient />
}
