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

export const DRIVER_LOFT_OPTIONS = ['8°', '9°', '10°', '10.5°', '11°', '11.5°', '12°']

// ── Loft/type per kategori ─────────────────────────────────────────────────────
export const FAIRWAY_LOFT_OPTIONS: { value: string; label: string }[] = [
  { value: '3 Wood', label: '3 Wood' },
  { value: '3+ Wood', label: '3+ Wood' },
  { value: '4 Wood', label: '4 Wood' },
  { value: '4+ Wood', label: '4+ Wood' },
  { value: '5 Wood', label: '5 Wood' },
  { value: '7 Wood', label: '7 Wood' },
  { value: '9 Wood', label: '9 Wood' },
  { value: '11 Wood', label: '11 Wood' },
]

export const HYBRID_LOFT_OPTIONS: { value: string; label: string }[] = [
  { value: '2-Hybrid', label: '2-Hybrid' },
  { value: '3-Hybrid', label: '3-Hybrid' },
  { value: '4-Hybrid', label: '4-Hybrid' },
  { value: '5-Hybrid', label: '5-Hybrid' },
  { value: '6-Hybrid', label: '6-Hybrid' },
  { value: '7-Hybrid', label: '7-Hybrid' },
  { value: '8-Hybrid', label: '8-Hybrid' },
  { value: 'A-Hybrid', label: 'A-Hybrid' },
  { value: 'S-Hybrid', label: 'S-Hybrid' },
]

export const WEDGE_LOFT_OPTIONS: { value: string; label: string }[] = [
  { value: '48°', label: '48°' },
  { value: '50°', label: '50°' },
  { value: '52°', label: '52°' },
  { value: '54°', label: '54°' },
  { value: '56°', label: '56°' },
  { value: '58°', label: '58°' },
  { value: '60°', label: '60°' },
]

/** Loft-/type-valg for en løst db-kategori, eller null hvis kategorien ikke har loft. */
export function loftOptionerForDb(dbKat: string): { value: string; label: string }[] | null {
  switch (dbKat) {
    case 'driver':
      return DRIVER_LOFT_OPTIONS.map((l) => ({ value: l, label: l }))
    case 'fairway_wood':
      return FAIRWAY_LOFT_OPTIONS
    case 'hybrid':
      return HYBRID_LOFT_OPTIONS
    case 'wedge':
      return WEDGE_LOFT_OPTIONS
    default:
      return null
  }
}

// ── Skaft lengde (relativ til standard) ────────────────────────────────────────
export const SKAFT_LENGDE_OPTIONS: { value: string; label: string }[] = [
  { value: '-2', label: '-2"' },
  { value: '-1.5', label: '-1,5"' },
  { value: '-1', label: '-1"' },
  { value: '-0.5', label: '-0,5"' },
  { value: 'standard', label: 'Standard' },
  { value: '+0.5', label: '+0,5"' },
  { value: '+1', label: '+1"' },
  { value: '+1.5', label: '+1,5"' },
  { value: '+2', label: '+2"' },
  { value: 'custom', label: 'Egendefinert' },
]

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
export const MAKS_ANTALL_BILDER = 8

// ── New 4-phase flow types ─────────────────────────────────────────────────────

export type UiKategori =
  | 'jernshaft'
  | 'trekker'
  | 'wedge'
  | 'putter'
  | 'baller'
  | 'bag'
  | 'sko'
  | 'tilbehor'
  | 'annet'

export type NyTilstand = 'ny' | 'utmerket' | 'god' | 'akseptabel'

export const UI_KATEGORI_OPTIONS: { value: UiKategori; label: string }[] = [
  { value: 'jernshaft', label: 'Jernkøller' },
  { value: 'trekker', label: 'Trekker' },
  { value: 'wedge', label: 'Wedge' },
  { value: 'putter', label: 'Putter' },
  { value: 'baller', label: 'Baller' },
  { value: 'bag', label: 'Bag' },
  { value: 'sko', label: 'Sko' },
  { value: 'tilbehor', label: 'Tilbehør' },
  { value: 'annet', label: 'Annet' },
]

export const UNDERKATEGORI_OPTIONS: Record<UiKategori, { value: string; label: string }[]> = {
  jernshaft: [
    { value: 'jernsett', label: 'Jern (3-PW)' },
    { value: 'hybrid', label: 'Hybridkøller' },
    { value: 'trerekke', label: 'Trerekke' },
    { value: 'enkelt_jern', label: 'Enkelt jern' },
  ],
  trekker: [
    { value: 'driver', label: 'Driver' },
    { value: 'fairway_tre', label: 'Fairway tre' },
    { value: 'hybridtrekker', label: 'Hybridtrekker' },
  ],
  wedge: [],
  putter: [
    { value: 'bladputter', label: 'Bladputter' },
    { value: 'malteputter', label: 'Malteputter' },
    { value: 'hoy_moi', label: 'Høy-MOI' },
  ],
  baller: [],
  bag: [
    { value: 'standbag', label: 'Standbag' },
    { value: 'cartbag', label: 'Cartbag' },
    { value: 'tourbag', label: 'Tourbag' },
  ],
  sko: [
    { value: 'piggsko', label: 'Piggsko' },
    { value: 'piggfri', label: 'Piggfri' },
    { value: 'casual', label: 'Casual' },
  ],
  tilbehor: [],
  annet: [],
}

export function uiKategoriTilDb(ui: UiKategori, underkat: string | null): string {
  switch (ui) {
    case 'jernshaft':
      if (underkat === 'hybrid') return 'hybrid'
      if (underkat === 'trerekke') return 'fairway_wood'
      if (underkat === 'enkelt_jern') return 'enkelt-jern'
      return 'jernsett'
    case 'trekker':
      // UI-skjema + flate manuell-verdier (fairway/hybrid)
      if (underkat === 'fairway_tre' || underkat === 'fairway') return 'fairway_wood'
      if (underkat === 'hybridtrekker' || underkat === 'hybrid') return 'hybrid'
      return 'driver'
    case 'wedge':
      return 'wedge'
    case 'putter':
      return 'putter'
    case 'baller':
      return 'baller'
    case 'bag':
      return 'bag'
    case 'sko':
      return 'sko'
    case 'tilbehor':
      return 'annet'
    case 'annet':
      return 'annet'
  }
}

export function kategoriTilUiKategori(kat: Category): { ui: UiKategori; underkat: string | null } {
  switch (kat) {
    case 'driver':
      return { ui: 'trekker', underkat: 'driver' }
    case 'fairway_wood':
      return { ui: 'trekker', underkat: 'fairway_tre' }
    case 'hybrid':
      return { ui: 'trekker', underkat: 'hybridtrekker' }
    case 'iron_set':
      return { ui: 'jernshaft', underkat: 'jernsett' }
    case 'single_iron':
      return { ui: 'jernshaft', underkat: 'enkelt_jern' }
    case 'wedge':
      return { ui: 'wedge', underkat: null }
    case 'putter':
      return { ui: 'putter', underkat: 'bladputter' }
    case 'golf_bag':
      return { ui: 'bag', underkat: null }
    case 'golf_shoes':
      return { ui: 'sko', underkat: null }
    case 'rangefinder':
      return { ui: 'tilbehor', underkat: null }
    case 'other':
      return { ui: 'annet', underkat: null }
  }
}

export const NY_TILSTANDER: {
  value: NyTilstand
  label: string
  beskrivelse: string
  klasse: string
  dotKlasse: string
}[] = [
  {
    value: 'ny',
    label: 'Ny',
    beskrivelse: 'Ubrukt, i eller uten innpakning',
    klasse:
      'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    dotKlasse: 'bg-emerald-500',
  },
  {
    value: 'utmerket',
    label: 'Utmerket',
    beskrivelse: 'Brukt, maks 2-3 runder',
    klasse:
      'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300',
    dotKlasse: 'bg-green-400',
  },
  {
    value: 'god',
    label: 'God',
    beskrivelse: 'Brukt, meget god stand, ingen skader',
    klasse: 'border-primary/30 bg-primary/8 text-primary',
    dotKlasse: 'bg-primary',
  },
  {
    value: 'akseptabel',
    label: 'Akseptabel',
    beskrivelse: 'Brukt, men noe kosmetisk slitasje',
    klasse:
      'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300',
    dotKlasse: 'bg-amber-500',
  },
]

export const NY_TILSTAND_LABEL: Record<NyTilstand, string> = {
  ny: 'Ny',
  utmerket: 'Utmerket',
  god: 'God',
  akseptabel: 'Akseptabel',
}

export const PRIS_ANBEFALINGER: Record<UiKategori, string> = {
  jernshaft: '500–4 000 kr',
  trekker: '300–3 500 kr',
  wedge: '300–2 000 kr',
  putter: '300–2 500 kr',
  baller: '50–500 kr',
  bag: '200–2 000 kr',
  sko: '100–1 200 kr',
  tilbehor: '50–1 000 kr',
  annet: '50–1 000 kr',
}

export const GOLF_MERKER = [
  'Titleist',
  'TaylorMade',
  'Callaway',
  'Ping',
  'Mizuno',
  'Cobra',
  'Cleveland',
  'Srixon',
  'Wilson',
  'Annet',
]

export const NY_FLEX_OPTIONS: { value: string; label: string }[] = [
  { value: 'regular', label: 'Regular Flex' },
  { value: 'stiff', label: 'Stiff Flex' },
  { value: 'lite_a', label: 'Lite/A Flex' },
  { value: 'x_stiff', label: 'X-Stiff Flex' },
  { value: 'tour_stiff', label: 'Tour-Stiff Flex' },
]

export const HOSEL_OPTIONS = [
  { value: 'straight', label: 'Straight' },
  { value: 'offset', label: 'Offset' },
  { value: 'double_bend', label: 'Double-bend' },
]

// ── Jernsett: hvilke køller settet inneholder ──────────────────────────────────
// Rekkefølgen er den kanoniske sorteringsrekkefølgen for visning og områdeformat.
export const JERN_KOLLER_OPTIONS: { value: string; label: string }[] = [
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '9', label: '9' },
  { value: 'P', label: 'P' },
  { value: 'A', label: 'A' },
  { value: 'S', label: 'S' },
]

const KOLLER_REKKEFOLGE = JERN_KOLLER_OPTIONS.map((k) => k.value)

/**
 * Formaterer valgte jernkøller. Sammenhengende utvalg vises som område ("4–P"),
 * ellers som kommaliste ("4, 6, 8"). Returnerer tom streng for tomt utvalg.
 */
export function formaterKoller(koller: string[]): string {
  const sortert = KOLLER_REKKEFOLGE.filter((k) => koller.includes(k))
  if (sortert.length === 0) return ''
  if (sortert.length === 1) return sortert[0]

  const indekser = sortert.map((k) => KOLLER_REKKEFOLGE.indexOf(k))
  const sammenhengende = indekser.every((idx, i) => i === 0 || idx === indekser[i - 1] + 1)

  return sammenhengende ? `${sortert[0]}–${sortert[sortert.length - 1]}` : sortert.join(', ')
}

// ── Materiale / håndighet — kodene matcher filter på /utforsk + detaljsiden ─────
export const SKAFT_MATERIALE_OPTIONS: { value: string; label: string }[] = [
  { value: 'graphite', label: 'Grafitt' },
  { value: 'steel', label: 'Stål' },
]

export const HAND_OPTIONS: { value: string; label: string }[] = [
  { value: 'right', label: 'Høyre' },
  { value: 'left', label: 'Venstre' },
]

export const ALLE_STEG_CREATE = [
  { id: 'metode', tittel: 'Metode' },
  { id: 'kategori', tittel: 'Kategori' },
  { id: 'detaljer', tittel: 'Detaljer' },
  { id: 'pris', tittel: 'Pris' },
] as const

export const ALLE_STEG_REDIGER = [
  { id: 'kategori', tittel: 'Kategori' },
  { id: 'utstyr', tittel: 'Utstyr' },
  { id: 'bilder', tittel: 'Bilder' },
  { id: 'tilstand', tittel: 'Tilstand' },
  { id: 'pris', tittel: 'Pris' },
] as const
