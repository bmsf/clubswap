import { createClient } from '@/lib/supabase/server'
import type { ListingWithSeller, ListingInsert, ListingUpdate } from '@/types'
import type { ListingFilterValues } from '@/lib/schemas'

export async function getListings(
  filters: Partial<ListingFilterValues> = {}
): Promise<ListingWithSeller[]> {
  const supabase = await createClient()

  let query = supabase
    .from('listings')
    .select(
      `
      *,
      seller:profiles!seller_id(id, username, avatar_url, location_city, location_country)
    `
    )
    .eq('status', 'active')

  if (filters.category) query = query.eq('category', filters.category)
  if (filters.condition) query = query.eq('condition', filters.condition)
  if (filters.min_price !== undefined) query = query.gte('price', filters.min_price)
  if (filters.max_price !== undefined) query = query.lte('price', filters.max_price)
  if (filters.location_country) query = query.eq('location_country', filters.location_country)
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters.sort === 'price_asc') {
    query = query.order('price', { ascending: true })
  } else if (filters.sort === 'price_desc') {
    query = query.order('price', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const page = filters.page ?? 1
  const limit = filters.limit ?? 24
  query = query.range((page - 1) * limit, page * limit - 1)

  const { data, error } = await query

  if (error) throw new Error(`Failed to fetch listings: ${error.message}`)
  return (data ?? []) as ListingWithSeller[]
}

export async function getListingById(id: string): Promise<ListingWithSeller | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select(
      `
      *,
      seller:profiles!seller_id(id, username, avatar_url, location_city, location_country)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch listing: ${error.message}`)
  }

  return data as ListingWithSeller
}

export async function getListingsBySeller(sellerId: string): Promise<ListingWithSeller[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select(
      `
      *,
      seller:profiles!seller_id(id, username, avatar_url, location_city, location_country)
    `
    )
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch seller listings: ${error.message}`)
  return (data ?? []) as ListingWithSeller[]
}

export async function createListing(listing: ListingInsert): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('listings').insert(listing).select('id').single()

  if (error) throw new Error(`Failed to create listing: ${error.message}`)
  return data.id
}

export async function updateListing(id: string, update: ListingUpdate): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from('listings').update(update).eq('id', id)

  if (error) throw new Error(`Failed to update listing: ${error.message}`)
}

export async function incrementViews(id: string): Promise<void> {
  const supabase = await createClient()
  await supabase.rpc('increment_listing_views', { listing_id: id })
}
