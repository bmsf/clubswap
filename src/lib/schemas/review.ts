import { z } from 'zod'

export const reviewSchema = z.object({
  listing_id: z.string().uuid(),
  seller_id: z.string().uuid(),
  rating: z.number().int().min(1, 'Gi minst 1 stjerne').max(5, 'Maks 5 stjerner'),
  comment: z.string().max(1000).optional().or(z.literal('')),
})

export type ReviewFormValues = z.infer<typeof reviewSchema>
