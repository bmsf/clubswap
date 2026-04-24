'use client'

import { use, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'
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

// ── Data ──────────────────────────────────────────────────────────────────────

const LISTINGS = [
  {
    id: 1,
    name: 'Stealth 2 Driver',
    brand: 'TaylorMade',
    condition: 'Meget god',
    price: 2490,
    location: 'Oslo',
    posted: '2t siden',
  },
  {
    id: 2,
    name: 'Apex Pro Irons 4–PW',
    brand: 'Callaway',
    condition: 'God',
    price: 3800,
    location: 'Bergen',
    posted: '5t siden',
  },
  {
    id: 3,
    name: 'SM9 Wedge 56°',
    brand: 'Titleist',
    condition: 'Ny',
    price: 1290,
    location: 'Trondheim',
    posted: '1d siden',
  },
  {
    id: 4,
    name: 'Paradym Driver',
    brand: 'Callaway',
    condition: 'Meget god',
    price: 2950,
    location: 'Stavanger',
    posted: '1d siden',
  },
  {
    id: 5,
    name: 'T200 Irons 5–GW',
    brand: 'Titleist',
    condition: 'God',
    price: 4200,
    location: 'Kristiansand',
    posted: '2d siden',
  },
  {
    id: 6,
    name: 'Qi10 Driver',
    brand: 'TaylorMade',
    condition: 'Akseptabel',
    price: 1750,
    location: 'Drammen',
    posted: '3d siden',
  },
  {
    id: 7,
    name: 'Cleveland RTX6 58°',
    brand: 'Cleveland',
    condition: 'Meget god',
    price: 890,
    location: 'Tromsø',
    posted: '3d siden',
  },
  {
    id: 8,
    name: 'Scotty Cameron Putter',
    brand: 'Titleist',
    condition: 'God',
    price: 3100,
    location: 'Fredrikstad',
    posted: '4d siden',
  },
]

const POPULAR_SEARCHES = ['TaylorMade', 'Titleist', 'Callaway', 'Putter', 'Wedge 56°']

const CATEGORIES = [
  { id: 'alt', label: 'Alt utstyr' },
  { id: 'drivere', label: 'Drivere' },
  { id: 'jernkoller', label: 'Jernkøller' },
  { id: 'puttere', label: 'Puttere' },
  { id: 'bagger', label: 'Bagger' },
]

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchesQuery(listing: (typeof LISTINGS)[number], query: string) {
  const q = query.toLowerCase()
  return (
    listing.name.toLowerCase().includes(q) ||
    listing.brand.toLowerCase().includes(q) ||
    listing.condition.toLowerCase().includes(q)
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SearchPage({ params }: { params: Promise<{ query: string }> }) {
  const { query: rawQuery } = use(params)
  const query = decodeURIComponent(rawQuery)

  const router = useRouter()
  const [searchInput, setSearchInput] = useState(query)
  const [activeCategory, setActiveCategory] = useState('alt')
  const [sortBy, setSortBy] = useState('nyeste')
  const [activeFilter, setActiveFilter] = useState('alle')
  const [canScrollRight, setCanScrollRight] = useState(false)
  const chipsRef = useRef<HTMLDivElement>(null)

  const handleChipsScroll = () => {
    const el = chipsRef.current
    if (!el) return
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  const handleSearch = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    router.push(`/search/${encodeURIComponent(trimmed)}`)
  }

  const filteredListings = LISTINGS.filter((l) => {
    const matchesFilter =
      activeFilter === 'alle' || l.condition === activeFilter || l.brand === activeFilter
    return matchesFilter && matchesQuery(l, query)
  }).sort((a, b) => {
    if (sortBy === 'pris-lav') return a.price - b.price
    if (sortBy === 'pris-hoy') return b.price - a.price
    if (sortBy === 'eldste') return a.id - b.id
    return b.id - a.id
  })

  const relatedTerms = POPULAR_SEARCHES.filter(
    (t) => t.toLowerCase() !== query.toLowerCase()
  ).slice(0, 4)

  return (
    <>
      {/* Search header */}
      <section className="border-border border-b px-6 py-12 text-center lg:px-20 lg:py-16">
        <h1 className="text-foreground text-[clamp(2rem,6vw,3rem)] font-[650] tracking-tight capitalize">
          {query}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          De beste annonsene for &ldquo;{query}&rdquo;
        </p>

        {/* Inline search bar */}
        <div className="bg-muted/50 mx-auto mt-6 flex max-w-md items-center gap-3 rounded-full px-5 py-3 dark:bg-[#1c1c1c]">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchInput)}
            placeholder="Søk etter kølle, merke eller type..."
            className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
          />
          <button
            onClick={() => handleSearch(searchInput)}
            className="bg-primary-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-85"
          >
            <MagnifyingGlassIcon className="text-primary-btn-fg h-3.5 w-3.5" />
          </button>
        </div>

        {/* Related searches */}
        {relatedTerms.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-muted-foreground text-xs font-semibold">Relatert:</span>
            {relatedTerms.map((term) => (
              <button
                key={term}
                onClick={() => handleSearch(term)}
                className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 transition-colors hover:underline"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* Category tabs */}
        <div className="mt-8 flex touch-pan-x gap-1.5 overflow-x-auto [scrollbar-width:none] lg:justify-center [&::-webkit-scrollbar]:hidden">
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
      </section>

      {/* Filter bar */}
      <div className="flex flex-col gap-6 px-4 pt-8 pb-3 md:px-12 lg:px-20">
        {/* Mobile: sort left, filter right */}
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

        {/* Mobile: scrollable chips */}
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

      {/* Results grid */}
      <section className="px-4 pt-8 pb-10 md:px-12 md:pt-10 md:pb-12 lg:px-20">
        {filteredListings.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground text-sm">
              Ingen annonser funnet for &ldquo;{query}&rdquo;.
            </p>
            <button
              onClick={() => router.push('/')}
              className="text-primary mt-3 text-sm font-medium hover:underline"
            >
              Se alle annonser
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                name={listing.name}
                brand={listing.brand}
                condition={listing.condition}
                price={listing.price}
                location={listing.location}
                posted={listing.posted}
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
