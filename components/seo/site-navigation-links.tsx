import Link from 'next/link'

const SECTIONS = [
  {
    title: 'Watch live sports',
    links: [
      { href: '/watch/premier-league', label: 'Premier League' },
      { href: '/watch/champions-league', label: 'Champions League' },
      { href: '/watch/europa-league', label: 'Europa League' },
      { href: '/watch/world-cup-2026', label: 'World Cup 2026' },
      { href: '/watch/formula-1', label: 'Formula 1' },
      { href: '/ufc', label: 'UFC & MMA' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { href: '/pricing', label: 'IPTV pricing' },
      { href: '/free-trial', label: 'Free 24-hour trial' },
      { href: '/buy', label: 'Buy subscription' },
      { href: '/channels', label: '230,000+ channels' },
      { href: '/iptv-vs-sky-sports', label: 'IPTV vs Sky Sports comparison' },
    ],
  },
  {
    title: 'Setup & guides',
    links: [
      { href: '/setup/firestick', label: 'Firestick setup' },
      { href: '/setup/smart-tv', label: 'Smart TV setup' },
      { href: '/setup/android', label: 'Android setup' },
      { href: '/setup/iphone', label: 'iPhone setup' },
      { href: '/blog/how-to-install-iptv-firestick', label: 'IPTV Firestick guide' },
      { href: '/blog/is-iptv-legal-uk', label: 'Is IPTV legal in the UK?' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
] as const

/** Crawl-friendly internal links for key commercial and content pages. */
export function SiteNavigationLinks() {
  return (
    <section
      aria-label="Browse Smart Live TV"
      className="py-16 md:py-20 bg-[#0a0a0f] border-t border-[#2a2a3a]"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Browse Smart Live TV
        </h2>
        <p className="text-gray-400 mb-10 max-w-2xl">
          Stream live sports, start a free trial, or follow our setup guides for Firestick and Smart TV.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {SECTIONS.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-[#00e676] transition-colors text-sm font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </section>
  )
}
