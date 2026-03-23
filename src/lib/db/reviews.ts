import { createClient } from '@/lib/supabase/server'
import type { ReviewWithReviewer, ReviewInsert } from '@/types'

export async function getReviewsBySeller(sellerId: string): Promise<ReviewWithReviewer[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select(
      `
      *,
      reviewer:profiles!reviewer_id(id, username, avatar_url)
    `
    )
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch reviews: ${error.message}`)
  return (data ?? []) as ReviewWithReviewer[]
}

export async function createReview(review: ReviewInsert): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from('reviews').insert(review)

  if (error) throw new Error(`Failed to create review: ${error.message}`)
}
