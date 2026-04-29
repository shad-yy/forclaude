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
import { Search, Tv, Trophy, Calendar, Heart, Zap, BookOpen, DollarSign, FileText } from "lucide-react"

const QUICK_LINKS = [
  { label: "Premier League", href: "/watch/premier-league", icon: Trophy, category: "Sports" },
  { label: "Champions League", href: "/watch/champions-league", icon: Trophy, category: "Sports" },
  { label: "World Cup 2026", href: "/watch/world-cup-2026", icon: Trophy, category: "Sports" },
  { label: "UFC", href: "/ufc", icon: Zap, category: "Sports" },
  { label: "Formula 1", href: "/watch/formula-1", icon: Zap, category: "Sports" },
  { label: "La Liga", href: "/watch/la-liga", icon: Trophy, category: "Sports" },
  { label: "Bundesliga", href: "/watch/bundesliga", icon: Trophy, category: "Sports" },
  { label: "Serie A", href: "/watch/serie-a", icon: Trophy, category: "Sports" },
  { label: "Europa League", href: "/watch/europa-league", icon: Trophy, category: "Sports" },
  { label: "Ligue 1", href: "/watch/ligue-1", icon: Trophy, category: "Sports" },
]

const PAGE_LINKS = [
  { label: "Free Trial", href: "/free-trial", icon: Zap, category: "Pages" },
  { label: "Pricing", href: "/pricing", icon: DollarSign, category: "Pages" },
  { label: "Blog", href: "/blog", icon: BookOpen, category: "Pages" },
  { label: "Channels", href: "/channels", icon: Tv, category: "Pages" },
  { label: "News", href: "/news", icon: FileText, category: "Pages" },
  { label: "Contact Us", href: "/contact", icon: Heart, category: "Pages" },
]

const ALL_ITEMS = [...QUICK_LINKS, ...PAGE_LINKS]

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
        <CommandInput placeholder="Search sports, pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Sports">
            {QUICK_LINKS.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => navigate(item.href)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <item.icon className="w-4 h-4 text-text-muted" />
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] bg-surface-elevated text-text-muted px-2 py-0.5 rounded-full font-medium">
                  {item.category}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Pages">
            {PAGE_LINKS.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => navigate(item.href)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <item.icon className="w-4 h-4 text-text-muted" />
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] bg-surface-elevated text-text-muted px-2 py-0.5 rounded-full font-medium">
                  {item.category}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
