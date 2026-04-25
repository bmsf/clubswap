import { ListingCardSkeleton } from '@/components/listing-card-skeleton'

export default function Loading() {
  return (
    <section className="px-4 py-12 md:px-12 lg:px-20">
      <div className="mb-10 animate-pulse space-y-2">
        <div className="bg-muted h-8 w-48 rounded-full" />
        <div className="bg-muted h-4 w-72 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </section>
  )
}
