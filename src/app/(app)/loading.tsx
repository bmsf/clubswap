import { ListingCardSkeleton } from '@/components/listing-card-skeleton'

export default function Loading() {
  return (
    <>
      {/* Hero placeholder */}
      <section className="border-border grid grid-cols-1 gap-8 border-b px-6 py-16 lg:grid-cols-2 lg:items-start lg:px-20 lg:py-24">
        <div className="animate-pulse space-y-3 text-center lg:text-left">
          <div className="bg-muted mx-auto h-10 w-3/4 max-w-sm rounded-full lg:mx-0" />
          <div className="bg-muted mx-auto h-10 w-1/2 max-w-xs rounded-full lg:mx-0" />
          <div className="bg-muted mx-auto mt-2 h-3.5 w-full max-w-xs rounded-full lg:mx-0" />
          <div className="bg-muted mx-auto h-3.5 w-4/5 max-w-xs rounded-full lg:mx-0" />
        </div>
        <div className="flex flex-col gap-4 lg:mt-3">
          <div className="flex animate-pulse gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-muted h-8 flex-1 rounded-full" />
            ))}
          </div>
          <div className="bg-muted h-12 w-full animate-pulse rounded-full" />
          <div className="flex animate-pulse items-center gap-2">
            <div className="bg-muted h-4 w-16 rounded-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-muted h-7 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar placeholder */}
      <div className="flex animate-pulse items-center gap-3 px-4 pt-10 pb-3 md:px-12 lg:px-20">
        <div className="bg-muted h-9 w-36 rounded-xl" />
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-muted h-7 w-16 flex-shrink-0 rounded-full" />
          ))}
        </div>
      </div>

      {/* Listings grid */}
      <section className="px-4 pt-8 pb-10 md:px-12 md:pt-10 md:pb-12 lg:px-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </>
  )
}
