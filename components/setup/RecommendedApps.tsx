'use client'

import { useState } from 'react'
import { Check, Download, Star, Zap, Film, Shield, Smartphone } from 'lucide-react'

interface AppInfo {
  name: string
  badge?: string
  free: boolean
  pricingNote: string
  protocols: string[]
  installMethod: string
  installCode?: string
  bestFor: string
  pros: string[]
  storeAvailable: boolean
}

const DEVICE_APPS: Record<string, AppInfo[]> = {
  firestick: [
    {
      name: 'TiviMate',
      badge: '⭐ Best Overall',
      free: false,
      pricingNote: 'Free basic / ~£28 lifetime premium',
      protocols: ['Xtream Codes', 'M3U', 'Stalker Portal'],
      installMethod: 'Sideload via Downloader app',
      installCode: '278077',
      bestFor: 'Best TV guide experience, multiview, recording',
      pros: ['Cable TV-style programme guide', 'Watch up to 9 channels at once', 'Record live TV to USB', 'Fastest channel switching'],
      storeAvailable: false,
    },
    {
      name: 'IPTV Smarters Pro',
      badge: '👍 Easiest Setup',
      free: true,
      pricingNote: 'Free (optional £3 pro upgrade)',
      protocols: ['Xtream Codes', 'M3U'],
      installMethod: 'Sideload via Downloader app',
      installCode: '250931',
      bestFor: 'Beginners and families',
      pros: ['Simple 4-box layout: Live TV, Movies, Series, Catch-Up', 'Works with every IPTV provider', 'Built-in speed test', 'Great VOD section with movie posters'],
      storeAvailable: false,
    },
    {
      name: 'XCIPTV',
      badge: '🎬 Best for Movies',
      free: true,
      pricingNote: 'Free (ad-supported)',
      protocols: ['Xtream Codes', 'M3U'],
      installMethod: 'Sideload via Downloader app',
      installCode: '548268',
      bestFor: 'Netflix-style browsing of movies and series',
      pros: ['Beautiful tile layout like Netflix', 'IMDb ratings and movie info', 'Dual video players (ExoPlayer + VLC)', '100% free'],
      storeAvailable: false,
    },
    {
      name: 'Sparkle TV',
      badge: '⏸️ Best for Recording',
      free: false,
      pricingNote: 'Free basic / ~£15 lifetime',
      protocols: ['Xtream Codes', 'M3U', 'Stalker Portal'],
      installMethod: 'Sideload via Downloader app',
      bestFor: 'Pausing & recording live TV',
      pros: ['Pause and rewind live TV', 'Schedule recordings to USB or NAS', 'Clean modern interface', 'Very active updates'],
      storeAvailable: false,
    },
    {
      name: 'Televizo',
      badge: '⚡ Best for Budget Sticks',
      free: true,
      pricingNote: 'Free (£4 to remove ads)',
      protocols: ['Xtream Codes', 'M3U'],
      installMethod: 'Sideload via Downloader app',
      bestFor: 'Older or budget Firesticks',
      pros: ['Ultra-lightweight, runs on any Firestick', 'Loads huge playlists instantly', 'No lag or overheating', 'Catch-up TV support'],
      storeAvailable: false,
    },
  ],
  'smart-tv': [
    {
      name: 'IBO Player',
      badge: '⭐ Best for Samsung & LG',
      free: false,
      pricingNote: '7-day free trial / ~£8 lifetime',
      protocols: ['Xtream Codes', 'M3U'],
      installMethod: 'Direct from your TV app store',
      bestFor: 'Easiest setup — configure from your phone, no typing on remote',
      pros: ['Set up from your phone at iboplayer.com — no remote typing needed', 'Available on both Samsung and LG stores', 'Smooth 4K 60fps sports playback', 'Parental controls and multi-language audio'],
      storeAvailable: true,
    },
    {
      name: 'Smarters Player Lite',
      badge: '👍 Universal & Free',
      free: true,
      pricingNote: 'Free (optional £10 pro upgrade)',
      protocols: ['Xtream Codes', 'M3U'],
      installMethod: 'Direct from your TV app store',
      bestFor: 'Familiar interface that works on every device',
      pros: ['Free to use', 'Same layout on every device', 'Live TV, Movies, and Series sections', 'Works with all IPTV providers'],
      storeAvailable: true,
    },
    {
      name: 'Nanomid Player',
      badge: '🔒 Built-in VPN',
      free: false,
      pricingNote: '14-day free trial / ~£8 lifetime',
      protocols: ['Xtream Codes', 'M3U', 'Stalker Portal'],
      installMethod: 'Direct from your TV app store',
      bestFor: 'Bypassing ISP throttling without a separate VPN',
      pros: ['Built-in VPN/proxy — only app that does this on Samsung/LG', 'Solves buffering caused by ISP blocking', 'Available on both Samsung and LG stores', 'Custom buffer size settings'],
      storeAvailable: true,
    },
    {
      name: 'Flix IPTV',
      badge: '⚡ Lightweight',
      free: false,
      pricingNote: '7-day free trial / ~£7 lifetime',
      protocols: ['Xtream Codes', 'M3U'],
      installMethod: 'Direct from your TV app store',
      bestFor: 'Older or budget Smart TVs that lag with heavier apps',
      pros: ['Fastest loading on older Samsung/LG models', 'Manage playlists from phone via flixiptv.cc', 'Hide unwanted categories remotely', 'Multi-language subtitles'],
      storeAvailable: true,
    },
  ],
  android: [
    {
      name: 'Televizo',
      badge: '⭐ Best for Phones',
      free: true,
      pricingNote: 'Free (ads) / ~£7 lifetime',
      protocols: ['Xtream Codes', 'M3U'],
      installMethod: 'Google Play Store',
      bestFor: 'Best touch-friendly experience on phones',
      pros: ['Built for touchscreens — swipe for volume, brightness, channels', 'Lightweight, works on budget phones', 'Chromecast support built-in', 'Picture-in-Picture mode'],
      storeAvailable: true,
    },
    {
      name: 'IPTV Smarters Pro',
      badge: '👍 Easy & Familiar',
      free: true,
      pricingNote: 'Free (optional £3 pro upgrade)',
      protocols: ['Xtream Codes', 'M3U'],
      installMethod: 'Google Play Store',
      bestFor: 'Simple setup, universally supported',
      pros: ['Everyone knows how to use it', 'Live TV, Movies, Series in one app', 'Master search across all content', 'External player support (VLC, MX Player)'],
      storeAvailable: true,
    },
    {
      name: 'XCIPTV',
      badge: '🎬 Best for Movies',
      free: true,
      pricingNote: 'Free (ad-supported)',
      protocols: ['Xtream Codes', 'M3U'],
      installMethod: 'Google Play Store',
      bestFor: 'Browsing movies with IMDb info and ratings',
      pros: ['IMDb ratings and cast details', 'Dual video players', 'Built-in speed test', '100% free'],
      storeAvailable: true,
    },
    {
      name: 'OTT Navigator',
      badge: '📱 Best for Tablets',
      free: false,
      pricingNote: 'Free basic / ~£12 lifetime',
      protocols: ['Xtream Codes', 'M3U', 'Stalker Portal'],
      installMethod: 'Google Play Store',
      bestFor: 'Tablets and power users wanting full control',
      pros: ['Watch 2-4 channels at once on tablets', 'Most customisable IPTV app in existence', 'Supports every protocol including Stalker', 'Background audio playback'],
      storeAvailable: true,
    },
  ],
  iphone: [
    {
      name: 'UHF',
      badge: '⭐ Best for iPhone',
      free: false,
      pricingNote: 'Free trial / ~£20 lifetime',
      protocols: ['Xtream Codes', 'M3U'],
      installMethod: 'Apple App Store',
      bestFor: 'Best Apple-native IPTV experience with iCloud sync',
      pros: ['Syncs favourites across iPhone, iPad, Mac, and Apple TV', 'Picture-in-Picture and Dynamic Island support', 'Beautiful Apple-native design', 'Ultra-fast channel switching'],
      storeAvailable: true,
    },
    {
      name: 'Smarters Player Lite',
      badge: '👍 Free & Easy',
      free: true,
      pricingNote: 'Free (optional £3 pro upgrade)',
      protocols: ['Xtream Codes', 'M3U'],
      installMethod: 'Apple App Store',
      bestFor: 'Simple setup, no cost',
      pros: ['Free to download and use', 'Live TV, Movies, Series sections', 'Parental controls and sleep timer', 'Works with all IPTV providers'],
      storeAvailable: true,
    },
    {
      name: 'IPTVX',
      badge: '🎬 Best for Movies & Series',
      free: false,
      pricingNote: 'Free trial / ~£28 lifetime (Family Sharing)',
      protocols: ['Xtream Codes', 'M3U'],
      installMethod: 'Apple App Store',
      bestFor: 'Netflix-style VOD with trailers and ratings',
      pros: ['Stunning Netflix-like interface', 'Movie trailers, IMDb ratings, cast profiles', 'iCloud sync and Family Sharing support', 'Full AirPlay support'],
      storeAvailable: true,
    },
    {
      name: 'iPlayTV',
      badge: '💰 One-Time Payment',
      free: false,
      pricingNote: '~£5 one-time (no subscription)',
      protocols: ['Xtream Codes', 'M3U'],
      installMethod: 'Apple App Store',
      bestFor: 'Pay once, no recurring fees',
      pros: ['One-time purchase, no subscription', 'Classic TV guide grid', 'iCloud playlist sync', 'External player support'],
      storeAvailable: true,
    },
  ],
}

export function RecommendedApps({ device }: { device: string }) {
  const apps = DEVICE_APPS[device]
  if (!apps) return null

  const [expanded, setExpanded] = useState<string | null>(null)

  const deviceLabel = device === 'firestick' ? 'Firestick' :
    device === 'smart-tv' ? 'Smart TV' :
    device === 'android' ? 'Android' : 'iPhone & iPad'

  return (
    <section className="mb-16 md:mb-20">
      <h2 className="text-3xl font-bold text-white mb-3">
        Choose Your App
      </h2>
      <p className="text-gray-400 mb-8">
        Any of these apps work with Smart Live TV. Pick the one that suits you best — we&apos;ll send you the same login credentials either way.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {apps.map((app) => {
          const isExpanded = expanded === app.name
          return (
            <div
              key={app.name}
              className={`bg-gray-900 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isExpanded ? 'border-green-500/40' : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => setExpanded(isExpanded ? null : app.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setExpanded(isExpanded ? null : app.name)
                }
              }}
            >
              {/* Header — always visible */}
              <div className="p-5 flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  {app.badge?.includes('Best Overall') || app.badge?.includes('Best for Samsung') || app.badge?.includes('Best for Phones') || app.badge?.includes('Best for iPhone') ? (
                    <Star className="w-6 h-6 text-green-400" />
                  ) : app.badge?.includes('Easy') || app.badge?.includes('Free') || app.badge?.includes('Universal') ? (
                    <Smartphone className="w-6 h-6 text-blue-400" />
                  ) : app.badge?.includes('Movie') ? (
                    <Film className="w-6 h-6 text-purple-400" />
                  ) : app.badge?.includes('VPN') ? (
                    <Shield className="w-6 h-6 text-yellow-400" />
                  ) : app.badge?.includes('Budget') || app.badge?.includes('Lightweight') ? (
                    <Zap className="w-6 h-6 text-orange-400" />
                  ) : app.badge?.includes('Recording') ? (
                    <Download className="w-6 h-6 text-red-400" />
                  ) : (
                    <Smartphone className="w-6 h-6 text-green-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white">{app.name}</h3>
                    {app.badge && (
                      <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {app.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{app.bestFor}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      app.free ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {app.free ? '✓ Free' : app.pricingNote.split('/')[0]?.trim()}
                    </span>
                    {app.storeAvailable && (
                      <span className="text-xs text-gray-500">📥 {app.installMethod}</span>
                    )}
                    {app.installCode && (
                      <span className="text-xs text-gray-500">Code: <code className="text-green-400 font-mono">{app.installCode}</code></span>
                    )}
                  </div>
                </div>

                <div className={`shrink-0 w-6 h-6 flex items-center justify-center text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-gray-800 mt-0">
                  <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Why Choose {app.name}</div>
                      <ul className="space-y-1.5">
                        {app.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Supported Protocols</div>
                        <div className="flex flex-wrap gap-1.5">
                          {app.protocols.map((p) => (
                            <span key={p} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{p}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Pricing</div>
                        <p className="text-sm text-gray-300">{app.pricingNote}</p>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">How to Install</div>
                        <p className="text-sm text-gray-300">{app.installMethod}</p>
                        {app.installCode && (
                          <p className="text-sm text-green-400 mt-1">Downloader code: <code className="font-mono font-bold">{app.installCode}</code></p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-sm text-gray-500 mt-4 text-center">
        Not sure which to pick? We recommend <strong className="text-white">{apps[0]?.name}</strong> for the best experience, or <strong className="text-white">{apps[1]?.name}</strong> if you want something free and simple.
      </p>
    </section>
  )
}
