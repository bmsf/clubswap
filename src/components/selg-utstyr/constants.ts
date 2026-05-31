import { z } from 'zod'
import type { DetaljProfil } from '@/lib/categories'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface KolleItem {
  id: string
  kategori: string
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

export type Condition = 'ny' | 'meget_god' | 'god' | 'akseptabel'

export interface EquipmentAnalysis {
  category: string | null
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
      'text-muted-foreground dark:text-muted-foreground border-border dark:border-border bg-muted dark:bg-muted',
  },
  {
    value: 'meget_god',
    label: 'Meget god',
    beskrivelse: 'Minimal bruk, nesten ingen slitasje',
    klasse:
      'text-muted-foreground dark:text-muted-foreground border-border dark:border-border bg-muted dark:bg-muted',
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
      'text-muted-foreground dark:text-muted-foreground border-border dark:border-border bg-muted dark:bg-muted',
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

/** Loft-/type-valg for en detaljprofil, eller null hvis profilen ikke har loft. */
export function loftOptionerForProfil(
  profil: DetaljProfil
): { value: string; label: string }[] | null {
  switch (profil) {
    case 'driver':
      return DRIVER_LOFT_OPTIONS.map((l) => ({ value: l, label: l }))
    case 'wood':
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
  category: string
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

// ── New flow: tilstand ──────────────────────────────────────────────────────────

export type NyTilstand = 'ny' | 'utmerket' | 'god' | 'akseptabel'

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
      'border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground',
    dotKlasse: 'bg-muted-foreground',
  },
  {
    value: 'utmerket',
    label: 'Utmerket',
    beskrivelse: 'Brukt, maks 2-3 runder',
    klasse:
      'border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground',
    dotKlasse: 'bg-muted-foreground',
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
      'border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground',
    dotKlasse: 'bg-muted-foreground',
  },
]

export const NY_TILSTAND_LABEL: Record<NyTilstand, string> = {
  ny: 'Ny',
  utmerket: 'Utmerket',
  god: 'God',
  akseptabel: 'Akseptabel',
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
