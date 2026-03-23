import { z } from 'zod'

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Brukernavn må være minst 3 tegn')
    .max(30, 'Brukernavn kan ikke overstige 30 tegn')
    .regex(/^[a-z0-9_-]+$/, 'Kun bokstaver, tall, bindestrek og understrek'),
  full_name: z.string().min(2, 'Navn må være minst 2 tegn').max(100).optional().or(z.literal('')),
  location_city: z.string().max(100).optional().or(z.literal('')),
  location_country: z.string().length(2, 'Bruk landkode (f.eks. NO, SE, DK, FI)').default('NO'),
  handicap_index: z
    .number()
    .min(-10, 'Ugyldig handicap')
    .max(54, 'Maks handicap er 54')
    .optional()
    .nullable(),
  ngf_member_number: z.string().max(20).optional().or(z.literal('')),
  avatar_url: z.string().url().optional().or(z.literal('')),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
