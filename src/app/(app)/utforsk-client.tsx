'use client'

import { ArrowRightIcon } from '@heroicons/react/16/solid'
import { ListingCard } from '@/components/ui/card-7'
import { Skeleton } from 'boneyard-js/react'

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

function CardFallback() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl">
      <div className="bg-muted aspect-4/3 w-full rounded-xl" />
      <div className="px-0.5 pt-2.5">
        <div className="bg-muted mb-1.5 h-2.5 w-14 rounded-full" />
        <div className="bg-muted mb-1 h-4 w-3/4 rounded-full" />
        <div className="bg-muted h-2.5 w-1/2 rounded-full" />
      </div>
    </div>
  )
}

function UtforskPageSkeleton() {
  return (
    <section className="px-4 py-6 md:px-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardFallback key={i} />
        ))}
      </div>
    </section>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UtforskClient({ listings }: { listings: Listing[] }) {
  const filteredListings = [...listings].sort(
    (a, b) => new Date(b.opprettet_at).getTime() - new Date(a.opprettet_at).getTime()
  )

  return (
    <>
      <Skeleton
        name="utforsk-page"
        loading={false}
        animate="shimmer"
        color="#e5dfd1"
        darkColor="#2b2b2b"
        fallback={<UtforskPageSkeleton />}
      >
        {/* Listings grid */}
        <section className="px-4 pt-3 pb-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-foreground text-xl font-semibold">Anbefalte annonser</h2>
            <button className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors">
              Se alle ({filteredListings.length})
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          {filteredListings.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              Ingen annonser funnet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filteredListings.map((listing) => (
                <Skeleton
                  key={listing.id}
                  name="listing-card"
                  loading={false}
                  animate="shimmer"
                  color="#e5dfd1"
                  darkColor="#2b2b2b"
                  fallback={<CardFallback />}
                >
                  <ListingCard
                    name={listing.modell}
                    brand={listing.merke}
                    condition={listing.tilstand ?? ''}
                    price={listing.pris}
                    location={listing.selges_fra}
                    posted={relativTid(listing.opprettet_at)}
                    imageUrl={forsideBilde(listing.bilder)}
                    href={`/annonser/${listing.id}`}
                  />
                </Skeleton>
              ))}
            </div>
          )}
        </section>
      </Skeleton>
    </>
  )
}
