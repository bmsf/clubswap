'use client'

import { useEffect, useRef, useState } from 'react'
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

// ── Data ──────────────────────────────────────────────────────────────────────

const CONDITION_CLASSES: Record<string, string> = {
  Ny: 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950',
  'Meget god':
    'text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950',
  God: 'text-primary border-primary/30 bg-primary/8',
  Akseptabel:
    'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950',
}

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

// ── Animated title words ──────────────────────────────────────────────────────

const TITLES = ['driver', 'golfbag', 'putter']

// ── Search categories & popular terms ─────────────────────────────────────────

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

// ── Components ────────────────────────────────────────────────────────────────

function ListingImage({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    return (
      <div className="w-full" style={{ aspectRatio: '4/3' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </div>
    )
  }
  return (
    <div
      className="bg-muted/60 flex w-full flex-col items-center justify-center gap-1.5 rounded-t-xl"
      style={{ aspectRatio: '4/3' }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        className="text-muted-foreground/40"
        aria-hidden="true"
      >
        <rect x="15" y="2" width="2" height="14" rx="1" fill="currentColor" />
        <line
          x1="16"
          y1="16"
          x2="24"
          y2="26"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="20" y="24" width="8" height="5" rx="1.5" fill="currentColor" />
      </svg>
      <span className="text-muted-foreground/60 text-xs">Intet bilde</span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UtforskPage() {
  const [titleNumber, setTitleNumber] = useState(0)
  const [activeCategory, setActiveCategory] = useState('alt')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('nyeste')
  const [activeFilter, setActiveFilter] = useState('alle')
  const [canScrollRight, setCanScrollRight] = useState(false)
  const chipsRef = useRef<HTMLDivElement>(null)

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

  const filteredListings = LISTINGS.filter((l) => {
    if (activeFilter === 'alle') return true
    return l.condition === activeFilter || l.brand === activeFilter
  }).sort((a, b) => {
    if (sortBy === 'pris-lav') return a.price - b.price
    if (sortBy === 'pris-hoy') return b.price - a.price
    if (sortBy === 'eldste') return a.id - b.id
    return b.id - a.id
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
              placeholder="Søk etter kølle, merke eller type..."
              className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
            />
            <button className="bg-primary-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-85">
              <MagnifyingGlassIcon className="text-primary-btn-fg h-3.5 w-3.5" />
            </button>
          </div>

          {/* Popular searches */}
          <div className="flex w-full touch-pan-x items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-muted-foreground shrink-0 text-xs font-semibold">Populært:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className={cn(
                  'border-border shrink-0 rounded-full border px-3 py-1 text-xs whitespace-nowrap transition-colors',
                  searchQuery === term
                    ? 'border-primary/50 text-primary'
                    : 'text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar — full width */}
      <div className="flex flex-col gap-6 px-4 pt-10 pb-3 md:px-12 lg:px-20">
        {/* Row 1 (mobile): sort left, filter button right */}
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

        {/* Row 2 (mobile): filter chips scrollable */}
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <article
              key={listing.id}
              className="border-border bg-background hover:border-primary/30 hover:bg-muted/30 flex cursor-pointer flex-col overflow-hidden rounded-xl border transition-colors"
            >
              <ListingImage alt={listing.name} />

              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-muted-foreground mb-0.5 text-xs">{listing.brand}</p>
                    <p className="text-foreground truncate text-sm leading-snug font-semibold">
                      {listing.name}
                    </p>
                  </div>
                  <span
                    className={[
                      'mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                      CONDITION_CLASSES[listing.condition] ?? '',
                    ].join(' ')}
                  >
                    {listing.condition}
                  </span>
                </div>

                <p className="text-foreground font-mono text-base font-bold">
                  {listing.price.toLocaleString('nb-NO')} kr
                </p>

                <p className="text-muted-foreground text-xs">
                  {listing.location} · {listing.posted}
                </p>
              </div>
            </article>
          ))}
        </div>

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
