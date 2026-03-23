import { z } from 'zod'

export const messageSchema = z.object({
  listing_id: z.string().uuid(),
  recipient_id: z.string().uuid(),
  body: z
    .string()
    .min(1, 'Meldingen kan ikke være tom')
    .max(2000, 'Melding kan ikke overstige 2000 tegn'),
})

export type MessageFormValues = z.infer<typeof messageSchema>
