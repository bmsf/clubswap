import { z } from 'zod'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface KolleItem {
  id: string
  kategori: Category
  merke: string
  modell: string
  aarsmodell?: string
  hand?: 'right' | 'left'
  skaftType?: 'steel' | 'graphite' | 'none'
  skaftModell?: string
  selectedSkaft?: { id: string; brand: string; model: string; category: string }
  shaftFlex?: 'L' | 'A' | 'R' | 'S' | 'X'
  loft?: string
  headcover?: boolean
  confirmed?: boolean
  manuell?: boolean
}

export type Category =
  | 'driver'
  | 'fairway_wood'
  | 'hybrid'
  | 'iron_set'
  | 'single_iron'
  | 'wedge'
  | 'putter'
  | 'golf_bag'
  | 'golf_shoes'
  | 'rangefinder'
  | 'other'

export type Condition = 'ny' | 'meget_god' | 'god' | 'akseptabel'

export interface EquipmentAnalysis {
  category: Category | null
  brand: string | null
  model: string | null
  year: number | null
  hand: 'right' | 'left' | null
  loft: number | null
  shaft_flex: 'L' | 'A' | 'R' | 'S' | 'X' | null
  shaft_type: 'steel' | 'graphite' | null
  includes_headcover: boolean | null
  condition_estimate: Condition | null
  confidence: 'high' | 'medium' | 'low'
}

// ── Schema ────────────────────────────────────────────────────────────────────

export const schema = z.object({
  merke: z.string().min(1, 'Fyll inn merke'),
  modell: z.string().min(1, 'Fyll inn modellnavn'),
  aarsmodell: z.string().optional(),
  hand: z.enum(['right', 'left']).optional(),
  loft: z.string().optional(),
  shaftFlex: z.enum(['L', 'A', 'R', 'S', 'X']).optional(),
  skaftType: z.enum(['steel', 'graphite']).optional(),
  headcover: z.boolean().optional(),
  skadebeskrivelse: z.string().optional(),
  pris: z.coerce.number({ message: 'Fyll inn pris' }).positive('Pris må være høyere enn 0'),
  selgesFra: z.string().min(1, 'Fyll inn by eller sted'),
  tilbyrFrakt: z.boolean(),
})

export type FormData = z.infer<typeof schema>

// Create mode: merke/modell come from koller state, not RHF — skip their validation
export const createModeSchema = schema.extend({
  merke: z.string().default(''),
  modell: z.string().default(''),
})

// ── Category ──────────────────────────────────────────────────────────────────

export const CATEGORY_TO_DB: Record<Category, string> = {
  driver: 'driver',
  fairway_wood: 'fairway_wood',
  hybrid: 'hybrid',
  iron_set: 'jernsett',
  single_iron: 'enkelt-jern',
  wedge: 'wedge',
  putter: 'putter',
  golf_bag: 'bag',
  golf_shoes: 'sko',
  rangefinder: 'rangefinder',
  other: 'annet',
}

export const KATEGORI_OPTIONS = [
  { value: 'driver', label: 'Driver' },
  { value: 'fairway_wood', label: 'Fairway wood' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'iron_set', label: 'Jernsett' },
  { value: 'single_iron', label: 'Enkeltjern' },
  { value: 'wedge', label: 'Wedge' },
  { value: 'putter', label: 'Putter' },
  { value: 'golf_bag', label: 'Golfbag' },
  { value: 'golf_shoes', label: 'Golfsko' },
  { value: 'rangefinder', label: 'Avstandsmåler' },
  { value: 'other', label: 'Annet' },
]

// Maps equipment category to shaft DB category
export const SHAFT_KATEGORI_MAP: Partial<Record<Category, string>> = {
  driver: 'driver_fairway',
  fairway_wood: 'driver_fairway',
  hybrid: 'driver_fairway',
  iron_set: 'iron',
  single_iron: 'iron',
  wedge: 'wedge',
  putter: 'putter',
}

// Categories with shaft specifications
export const HAR_SKAFT = new Set<Category>([
  'driver',
  'fairway_wood',
  'hybrid',
  'iron_set',
  'single_iron',
  'wedge',
  'putter',
])

export const HAR_HEADCOVER = new Set<Category>(['driver', 'fairway_wood', 'hybrid', 'putter'])
export const HAR_LOFT_DRIVER = new Set<Category>(['driver'])

// ── Condition ─────────────────────────────────────────────────────────────────

export const TILSTANDER: {
  value: Condition
  label: string
  beskrivelse: string
  klasse: string
}[] = [
  {
    value: 'ny',
    label: 'Ny',
    beskrivelse: 'Aldri brukt, original emballasje',
    klasse:
      'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950',
  },
  {
    value: 'meget_god',
    label: 'Meget god',
    beskrivelse: 'Minimal bruk, nesten ingen slitasje',
    klasse:
      'text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950',
  },
  {
    value: 'god',
    label: 'God',
    beskrivelse: 'Normal bruksslitasje',
    klasse: 'text-primary border-primary/30 bg-primary/8',
  },
  {
    value: 'akseptabel',
    label: 'Akseptabel',
    beskrivelse: 'Synlig slitasje, funksjonell',
    klasse:
      'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950',
  },
]

// ── Shaft options ─────────────────────────────────────────────────────────────

export const DRIVER_LOFT_OPTIONS = ['9°', '9.5°', '10°', '10.5°', '11°', '11.5°', '12°']

export const KJENTE_SKAFT: { navn: string; type: 'steel' | 'graphite' }[] = [
  { navn: 'Fujikura Ventus Blue', type: 'graphite' },
  { navn: 'Fujikura Ventus Red', type: 'graphite' },
  { navn: 'Fujikura Ventus Black', type: 'graphite' },
  { navn: 'Fujikura Speeder', type: 'graphite' },
  { navn: 'Mitsubishi Tensei AV', type: 'graphite' },
  { navn: 'Mitsubishi Tensei CK Pro Orange', type: 'graphite' },
  { navn: 'Mitsubishi Diamana', type: 'graphite' },
  { navn: 'Project X HZRDUS Smoke', type: 'graphite' },
  { navn: 'Project X EvenFlow', type: 'graphite' },
  { navn: 'Aldila Rogue', type: 'graphite' },
  { navn: 'Aldila Synergy', type: 'graphite' },
  { navn: 'Graphite Design Tour AD', type: 'graphite' },
  { navn: 'True Temper Dynamic Gold', type: 'steel' },
  { navn: 'True Temper Project X', type: 'steel' },
  { navn: 'KBS Tour', type: 'steel' },
  { navn: 'KBS C-Taper', type: 'steel' },
  { navn: 'KBS $ Taper', type: 'steel' },
  { navn: 'Nippon NS Pro 950', type: 'steel' },
  { navn: 'Nippon NS Pro Modus3', type: 'steel' },
  { navn: 'Aerotech SteelFiber', type: 'steel' },
]

export const SKAFT_TYPE_OPTIONS: { value: 'steel' | 'graphite' | 'none'; label: string }[] = [
  { value: 'steel', label: 'Stål' },
  { value: 'graphite', label: 'Grafitt' },
  { value: 'none', label: 'Uten skaft' },
]

export const SHAFT_FLEX_OPTIONS: { value: 'L' | 'A' | 'R' | 'S' | 'X'; label: string }[] = [
  { value: 'L', label: 'L' },
  { value: 'A', label: 'A' },
  { value: 'R', label: 'R' },
  { value: 'S', label: 'S' },
  { value: 'X', label: 'X' },
]

// ── Year options ──────────────────────────────────────────────────────────────

const GJELDENDE_AAR = new Date().getFullYear()
export const AARSMODELL_VALG = Array.from({ length: GJELDENDE_AAR - 1989 }, (_, i) =>
  String(GJELDENDE_AAR - i)
)

// ── Known models (for search) ─────────────────────────────────────────────────

export const KJENTE_MODELLER: {
  brand: string
  model: string
  category: Category
  year?: number
}[] = [
  { brand: 'TaylorMade', model: 'Stealth 2', category: 'driver', year: 2023 },
  { brand: 'TaylorMade', model: 'Stealth 2 Plus', category: 'driver', year: 2023 },
  { brand: 'TaylorMade', model: 'Qi10', category: 'driver', year: 2024 },
  { brand: 'TaylorMade', model: 'Qi10 Max', category: 'driver', year: 2024 },
  { brand: 'TaylorMade', model: 'SIM2', category: 'driver', year: 2021 },
  { brand: 'TaylorMade', model: 'M6', category: 'driver', year: 2019 },
  { brand: 'TaylorMade', model: 'P770', category: 'iron_set', year: 2023 },
  { brand: 'TaylorMade', model: 'P790', category: 'iron_set', year: 2023 },
  { brand: 'TaylorMade', model: 'Milled Grind 4', category: 'wedge', year: 2024 },
  { brand: 'Callaway', model: 'Paradym', category: 'driver', year: 2023 },
  { brand: 'Callaway', model: 'Paradym Ai Smoke', category: 'driver', year: 2024 },
  { brand: 'Callaway', model: 'Apex Pro', category: 'iron_set', year: 2023 },
  { brand: 'Callaway', model: 'Apex DCB', category: 'iron_set', year: 2023 },
  { brand: 'Callaway', model: 'Jaws Raw', category: 'wedge', year: 2022 },
  { brand: 'Titleist', model: 'TSR3', category: 'driver', year: 2022 },
  { brand: 'Titleist', model: 'TSR2', category: 'driver', year: 2022 },
  { brand: 'Titleist', model: 'GT3', category: 'driver', year: 2024 },
  { brand: 'Titleist', model: 'T100', category: 'iron_set', year: 2023 },
  { brand: 'Titleist', model: 'T200', category: 'iron_set', year: 2023 },
  { brand: 'Titleist', model: 'Vokey SM10', category: 'wedge', year: 2024 },
  { brand: 'Titleist', model: 'Vokey SM9', category: 'wedge', year: 2022 },
  { brand: 'Ping', model: 'G430 Max', category: 'driver', year: 2023 },
  { brand: 'Ping', model: 'G430 LST', category: 'driver', year: 2023 },
  { brand: 'Ping', model: 'i230', category: 'iron_set', year: 2023 },
  { brand: 'Ping', model: 'Blueprint T', category: 'iron_set', year: 2024 },
  { brand: 'Ping', model: 'Glide 4.0', category: 'wedge', year: 2023 },
  { brand: 'Cobra', model: 'Aerojet', category: 'driver', year: 2023 },
  { brand: 'Cobra', model: 'Darkspeed', category: 'driver', year: 2024 },
  { brand: 'Cleveland', model: 'RTX 6 ZipCore', category: 'wedge', year: 2022 },
  { brand: 'Cleveland', model: 'RTX Full-Face 2', category: 'wedge', year: 2024 },
  { brand: 'Mizuno', model: 'JPX923 Hot Metal', category: 'iron_set', year: 2023 },
  { brand: 'Mizuno', model: 'JPX923 Forged', category: 'iron_set', year: 2023 },
  { brand: 'Srixon', model: 'ZX5 Mk II', category: 'driver', year: 2023 },
  { brand: 'Srixon', model: 'Z-Forged II', category: 'iron_set', year: 2022 },
  { brand: 'Scotty Cameron', model: 'Phantom X 5', category: 'putter', year: 2023 },
  { brand: 'Scotty Cameron', model: 'Special Select Fastback 1.5', category: 'putter', year: 2022 },
  { brand: 'Odyssey', model: 'White Hot OG #7', category: 'putter', year: 2022 },
  { brand: 'Odyssey', model: 'Ai-ONE Milled', category: 'putter', year: 2024 },
]

// ── Steps ─────────────────────────────────────────────────────────────────────

export const ALLE_STEG = [
  { id: 'metode', tittel: 'Metode' },
  { id: 'kategori', tittel: 'Kategori' },
  { id: 'utstyr', tittel: 'Utstyr' },
  { id: 'bilder', tittel: 'Bilder' },
  { id: 'tilstand', tittel: 'Tilstand' },
  { id: 'pris', tittel: 'Pris' },
] as const

export type StegId = (typeof ALLE_STEG)[number]['id']

// ── Image upload constraints ───────────────────────────────────────────────────

export const TILLATTE_BILDE_TYPER = ['image/jpeg', 'image/png', 'image/webp']
export const MAKS_BILDESTORRELSE_BYTES = 5 * 1024 * 1024
export const MAKS_ANTALL_BILDER = 6
