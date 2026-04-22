'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/16/solid'
import { Input } from '@/components/ui/input'

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

const TITLES = ['driver', 'golfbag', 'jernkølle', 'putter']

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
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTitleNumber((prev) => (prev === TITLES.length - 1 ? 0 : prev + 1))
    }, 2000)
    return () => clearTimeout(timeout)
  }, [titleNumber])

  return (
    <>
      {/* Hero */}
      <section className="border-border flex flex-col gap-6 border-b px-4 py-8 md:flex-row md:items-start md:px-20 md:py-16">
        <div className="w-full md:w-1/2 md:shrink-0">
          <h1 className="text-foreground text-4xl leading-[1.1] font-[550] tracking-tight md:text-5xl">
            Markedsplass for golf.
            <br />
            Kjøp din neste{' '}
            <span className="relative inline-flex h-[1.2em] min-w-50 overflow-hidden align-bottom">
              {TITLES.map((title, index) => (
                <motion.span
                  key={index}
                  className="absolute bottom-0"
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
        </div>

        <div className="flex flex-1 flex-col gap-5">
          <div className="border-border bg-background focus-within:border-primary/50 flex w-full items-center gap-3 rounded-xl border px-4 transition-colors">
            <MagnifyingGlassIcon className="text-muted-foreground h-4 w-4 shrink-0" />
            <Input
              type="text"
              placeholder="Søk etter kølle, merke eller type..."
              className="flex-1 border-none px-0 focus:border-none"
            />
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Kjøp, selg og bytt brukt golfutstyr med spillere over hele Norge – raskt og enkelt.
          </p>
        </div>
      </section>

      {/* Listings grid */}
      <section className="overflow-auto px-4 pt-8 pb-10 md:px-20 md:pt-10 md:pb-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
            Siste annonser
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LISTINGS.map((listing) => (
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
