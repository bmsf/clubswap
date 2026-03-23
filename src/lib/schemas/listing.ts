import { z } from 'zod'

export const listingCategoryValues = [
  'driver',
  'fairway_wood',
  'hybrid',
  'irons',
  'wedge',
  'putter',
  'bag',
  'shoes',
  'clothing',
  'accessories',
  'other',
] as const

export const listingConditionValues = ['mint', 'very_good', 'good', 'fair'] as const

export const listingStatusValues = ['active', 'sold', 'archived'] as const

export const currencyCodeValues = ['NOK', 'SEK', 'DKK', 'EUR'] as const

export const shaftFlexValues = ['ladies', 'senior', 'regular', 'stiff', 'x_stiff'] as const

export const shaftMaterialValues = ['graphite', 'steel'] as const

export const gripSizeValues = ['undersize', 'standard', 'midsize', 'jumbo'] as const

export const handPreferenceValues = ['right', 'left'] as const

export const clubSpecsSchema = z.object({
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  year: z.number().int().min(1950).max(2030).optional(),
  hand: z.enum(handPreferenceValues).optional(),
  shaft_flex: z.enum(shaftFlexValues).optional(),
  shaft_material: z.enum(shaftMaterialValues).optional(),
  loft: z.number().min(0).max(90).optional(),
  grip_size: z.enum(gripSizeValues).optional(),
  set_composition: z.string().max(50).optional(),
})

export const gearSpecsSchema = z.object({
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
})

export const listingSchema = z.object({
  title: z
    .string()
    .min(5, 'Tittel må være minst 5 tegn')
    .max(100, 'Tittel kan ikke overstige 100 tegn'),
  description: z
    .string()
    .min(20, 'Beskrivelse må være minst 20 tegn')
    .max(2000, 'Beskrivelse kan ikke overstige 2000 tegn'),
  category: z.enum(listingCategoryValues, { error: 'Velg en kategori' }),
  condition: z.enum(listingConditionValues, { error: 'Velg en tilstand' }),
  price: z
    .number({ error: 'Ugyldig pris' })
    .int('Pris må være et heltall')
    .positive('Pris må være større enn 0')
    .max(1_000_000, 'Pris kan ikke overstige 1 000 000'),
  currency: z.enum(currencyCodeValues).default('NOK'),
  location_city: z.string().max(100).optional().or(z.literal('')),
  location_country: z.string().length(2).default('NO'),
  images: z.array(z.string().url()).min(1, 'Legg til minst ett bilde').max(10, 'Maks 10 bilder'),
  specs: z.union([clubSpecsSchema, gearSpecsSchema]).optional(),
})

export type ListingFormValues = z.infer<typeof listingSchema>

export const listingFilterSchema = z.object({
  category: z.enum(listingCategoryValues).optional(),
  condition: z.enum(listingConditionValues).optional(),
  min_price: z.number().int().nonnegative().optional(),
  max_price: z.number().int().positive().optional(),
  currency: z.enum(currencyCodeValues).optional(),
  location_country: z.string().length(2).optional(),
  shaft_flex: z.enum(shaftFlexValues).optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(24),
})

export type ListingFilterValues = z.infer<typeof listingFilterSchema>
