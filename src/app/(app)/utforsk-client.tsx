'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/16/solid'
import { cn } from '@/lib/utils'
import { ListFilter, ChevronRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ListingCard } from '@/components/ui/card-7'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Listing = {
  id: string
  merke: string
  modell: string
  tilstand: string | null
  pris: number
  selges_fra: string | null
  bilder: unknown[] | null
  opprettet_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativTid(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `${m}m siden`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}t siden`
  return `${Math.floor(h / 24)}d siden`
}

function forsideBilde(bilder: unknown[] | null): string | undefined {
  return Array.isArray(bilder) && bilder.length > 0 ? (bilder[0] as string) : undefined
}

// ── Static data ───────────────────────────────────────────────────────────────

const TITLES = ['driver', 'golfbag', 'putter']

const CATEGORIES = [
  { id: 'alt', label: 'Alt utstyr' },
  { id: 'drivere', label: 'Drivere' },
  { id: 'jernkoller', label: 'Jernkøller' },
  { id: 'puttere', label: 'Puttere' },
  { id: 'bagger', label: 'Bagger' },
]

const POPULAR_SEARCHES = ['TaylorMade', 'Titleist', 'Callaway', 'Putter', 'Wedge 56°']

const FILTER_CHIPS = [
  { id: 'alle', label: 'Alle' },
  { id: 'TaylorMade', label: 'TaylorMade' },
  { id: 'Titleist', label: 'Titleist' },
  { id: 'Callaway', label: 'Callaway' },
  { id: 'Ping', label: 'Ping' },
  { id: 'Cobra', label: 'Cobra' },
  { id: 'Cleveland', label: 'Cleveland' },
  { id: 'Mizuno', label: 'Mizuno' },
  { id: 'Ny', label: 'Ny' },
  { id: 'Meget god', label: 'Meget god' },
  { id: 'God', label: 'God' },
  { id: 'Akseptabel', label: 'Akseptabel' },
  { id: 'driver', label: 'Driver' },
  { id: 'jernkolle', label: 'Jernkølle' },
  { id: 'putter', label: 'Putter' },
  { id: 'wedge', label: 'Wedge' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'bag', label: 'Golfbag' },
]

const SORT_LABELS: Record<string, string> = {
  nyeste: 'Nyeste først',
  eldste: 'Eldste først',
  'pris-lav': 'Pris: lav til høy',
  'pris-hoy': 'Pris: høy til lav',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UtforskClient({ listings }: { listings: Listing[] }) {
  const router = useRouter()
  const [titleNumber, setTitleNumber] = useState(0)
  const [activeCategory, setActiveCategory] = useState('alt')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('nyeste')
  const [activeFilter, setActiveFilter] = useState('alle')
  const [canScrollRight, setCanScrollRight] = useState(false)
  const chipsRef = useRef<HTMLDivElement>(null)

  const handleSearch = (query: string) => {
    const q = query.trim()
    if (!q) return
    router.push(`/search/${encodeURIComponent(q)}`)
  }

  const handleChipsScroll = () => {
    const el = chipsRef.current
    if (!el) return
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    handleChipsScroll()
    const el = chipsRef.current
    el?.addEventListener('resize', handleChipsScroll)
    return () => el?.removeEventListener('resize', handleChipsScroll)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTitleNumber((prev) => (prev === TITLES.length - 1 ? 0 : prev + 1))
    }, 2000)
    return () => clearTimeout(timeout)
  }, [titleNumber])

  const filteredListings = listings
    .filter((l) => {
      if (activeFilter === 'alle') return true
      return l.tilstand === activeFilter || l.merke === activeFilter
    })
    .sort((a, b) => {
      if (sortBy === 'pris-lav') return a.pris - b.pris
      if (sortBy === 'pris-hoy') return b.pris - a.pris
      if (sortBy === 'eldste')
        return new Date(a.opprettet_at).getTime() - new Date(b.opprettet_at).getTime()
      return new Date(b.opprettet_at).getTime() - new Date(a.opprettet_at).getTime()
    })

  return (
    <>
      {/* Hero */}
      <section className="border-border grid grid-cols-1 gap-8 border-b px-6 py-16 lg:grid-cols-2 lg:items-start lg:px-20 lg:py-24">
        <div className="text-center lg:text-left">
          <h1 className="text-foreground mt-0 text-[clamp(1.75rem,8vw,2.6rem)] leading-[1.1] font-[550] tracking-tight lg:text-[2rem] xl:text-5xl">
            Markedsplass for golf.
            <br />
            Kjøp din neste{' '}
            <span className="relative inline-flex h-[1.2em] min-w-[38vw] overflow-hidden align-bottom lg:min-w-28 xl:min-w-44">
              {TITLES.map((title, index) => (
                <motion.span
                  key={index}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0"
                  initial={{ opacity: 0, y: -60 }}
                  transition={{ type: 'spring', stiffness: 50 }}
                  animate={
                    titleNumber === index
                      ? { y: 0, opacity: 1 }
                      : { y: titleNumber > index ? -80 : 80, opacity: 0 }
                  }
                >
                  {title}
                </motion.span>
              ))}
            </span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-sm text-sm leading-relaxed lg:mx-0 lg:max-w-none">
            Kjøp, selg og bytt brukt golfutstyr med spillere over hele Norge – raskt og enkelt.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 lg:mt-3 lg:items-stretch">
          {/* Category tabs */}
          <div className="flex w-full touch-pan-x gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                  activeCategory === cat.id
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="bg-muted/50 flex w-full items-center gap-3 rounded-full px-5 py-3 lg:max-w-xl dark:bg-[#1c1c1c]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Søk etter kølle, merke eller type..."
              className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              className="bg-primary-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-85"
            >
              <MagnifyingGlassIcon className="text-primary-btn-fg h-3.5 w-3.5" />
            </button>
          </div>

          {/* Popular searches */}
          <div className="flex w-full touch-pan-x items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-muted-foreground shrink-0 text-xs font-semibold">Populært:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => handleSearch(term)}
                className="border-border text-muted-foreground hover:border-primary/40 hover:text-foreground shrink-0 rounded-full border px-3 py-1 text-xs whitespace-nowrap transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="flex flex-col gap-6 px-4 pt-10 pb-3 md:px-12 lg:px-20">
        {/* Mobile: sort + filter button */}
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
            <SelectTrigger className="h-auto! shrink-0 rounded-xl px-5! py-2! text-sm font-medium">
              <SelectValue>{SORT_LABELS[sortBy]}</SelectValue>
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="nyeste">Nyeste først</SelectItem>
              <SelectItem value="eldste">Eldste først</SelectItem>
              <SelectItem value="pris-lav">Pris: lav til høy</SelectItem>
              <SelectItem value="pris-hoy">Pris: høy til lav</SelectItem>
            </SelectContent>
          </Select>
          <button className="border-border text-muted-foreground hover:text-foreground flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-4 text-sm font-medium transition-colors">
            <ListFilter className="h-3.5 w-3.5" />
            Filter
          </button>
        </div>

        {/* Mobile: filter chips */}
        <div className="relative flex overflow-hidden lg:hidden">
          <div
            ref={chipsRef}
            onScroll={handleChipsScroll}
            className="flex touch-pan-x overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex items-center gap-2 pr-2">
              {FILTER_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setActiveFilter(chip.id)}
                  className={cn(
                    'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                    activeFilter === chip.id
                      ? 'bg-muted text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
          {canScrollRight && (
            <button
              onClick={() => chipsRef.current?.scrollBy({ left: 150, behavior: 'smooth' })}
              className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-8 items-center justify-center transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Desktop: all in one row */}
        <div className="hidden items-center gap-3 lg:flex">
          <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
            <SelectTrigger className="h-auto! shrink-0 rounded-xl px-5! py-2! text-sm font-medium">
              <SelectValue>{SORT_LABELS[sortBy]}</SelectValue>
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="nyeste">Nyeste først</SelectItem>
              <SelectItem value="eldste">Eldste først</SelectItem>
              <SelectItem value="pris-lav">Pris: lav til høy</SelectItem>
              <SelectItem value="pris-hoy">Pris: høy til lav</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex flex-1 overflow-hidden">
            <div className="flex flex-1 touch-pan-x overflow-x-auto px-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-full items-center justify-evenly gap-2">
                {FILTER_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setActiveFilter(chip.id)}
                    className={cn(
                      'shrink-0 rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors',
                      activeFilter === chip.id
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button className="border-border text-muted-foreground hover:text-foreground flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors">
            <ListFilter className="h-3.5 w-3.5" />
            Filter
          </button>
        </div>
      </div>

      {/* Listings grid */}
      <section className="px-4 pt-8 pb-10 md:px-12 md:pt-10 md:pb-12 lg:px-20">
        {filteredListings.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">Ingen annonser funnet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                name={listing.modell}
                brand={listing.merke}
                condition={listing.tilstand ?? ''}
                price={listing.pris}
                location={listing.selges_fra}
                posted={relativTid(listing.opprettet_at)}
                imageUrl={forsideBilde(listing.bilder)}
              />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors">
            Se alle annonser
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </section>
    </>
  )
}
