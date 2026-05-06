import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Favourites',
  description: 'Save your favourite sports and leagues.',
  robots: { index: false, follow: false },
}

export default function FavouritesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col 
      items-center justify-center px-4 pt-28 pb-20">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-[#00e676]/10 
          border border-[#00e676]/20 flex items-center 
          justify-center mx-auto mb-6">
          <Heart className="w-7 h-7 text-[#00e676]" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-3">
          Your Favourites
        </h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          The Favourites feature lets you save your top leagues, 
          teams, and upcoming matches for quick access. 
          This feature is coming soon — currently in development.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          In the meantime, explore our live sports pages:
        </p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { name: 'Premier League', href: '/watch/premier-league' },
            { name: 'Champions League', href: '/watch/champions-league' },
            { name: 'World Cup 2026', href: '/watch/world-cup-2026' },
            { name: 'UFC', href: '/ufc' },
          ].map(l => (
            <Link key={l.name} href={l.href}
              className="bg-[#12121a] border border-[#2a2a3a] 
                hover:border-[#00e676]/30 rounded-xl p-3 
                text-sm font-semibold text-gray-300 
                hover:text-white transition-all text-center">
              {l.name}
            </Link>
          ))}
        </div>
        <Link href="/free-trial"
          className="inline-flex items-center gap-2 
            bg-[#00e676] text-black font-bold px-8 py-3.5 
            rounded-xl text-sm hover:bg-[#00ff87] transition-all">
          Get Free Trial →
        </Link>
      </div>
    </div>
  )
}
