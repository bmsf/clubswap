'use client'

import { Skeleton } from 'boneyard-js/react'
import { ListingCard } from '@/components/ui/card-7'

const FIXTURE_PROPS = {
  name: 'TaylorMade Stealth 2 Driver',
  brand: 'TaylorMade',
  condition: 'Meget god',
  price: 2490,
  location: 'Oslo',
  posted: '2t siden',
}

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

export function ListingCardSkeleton() {
  return (
    <Skeleton
      name="listing-card"
      loading={true}
      animate="shimmer"
      color="#e5dfd1"
      darkColor="#2b2b2b"
      fallback={<CardFallback />}
      fixture={<ListingCard {...FIXTURE_PROPS} />}
    >
      <></>
    </Skeleton>
  )
}
