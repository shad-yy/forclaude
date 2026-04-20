"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Search, Tv, Trophy, Calendar, Heart, Settings, ArrowRight } from "lucide-react"
import { channels } from "@/lib/data/channels"

const quickActions = [
  { label: "Favorites", href: "/favorites", icon: Heart },
  { label: "Fixtures", href: "/fixtures", icon: Calendar },
  { label: "Leagues", href: "/leagues", icon: Trophy },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const navigate = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  return (
    <>
      {/* Trigger button for navbar */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-text-muted text-sm hover:border-accent-primary/40 transition-colors group"
        aria-label="Open search (Ctrl+K)"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-text-muted group-hover:text-text-secondary transition-colors">Search...</span>
        <kbd className="ml-4 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono text-text-muted">
          ⌘K
        </kbd>
      </button>

      {/* Mobile trigger — icon only */}
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden p-2 rounded-lg text-text-muted hover:text-text-primary transition-colors"
        aria-label="Open search"
      >
        <Search className="w-5 h-5" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search channels, pages, actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => (
              <CommandItem
                key={action.href}
                onSelect={() => navigate(action.href)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <action.icon className="w-4 h-4 text-text-muted" />
                <span>{action.label}</span>
                <ArrowRight className="w-3 h-3 ml-auto text-text-muted" />
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Channels">
            {channels.slice(0, 8).map((channel) => (
              <CommandItem
                key={channel.id}
                onSelect={() => navigate("/channels")}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-surface-elevated flex items-center justify-center overflow-hidden flex-shrink-0">
                  {channel.logo ? (
                    <img src={channel.logo} alt="" className="w-4 h-4 object-contain" />
                  ) : (
                    <Tv className="w-3 h-3 text-text-muted" />
                  )}
                </div>
                <span className="truncate">{channel.name}</span>
                {channel.isLive && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-live-red font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-live-red animate-pulse" />
                    LIVE
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
