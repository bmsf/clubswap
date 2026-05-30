import { GOLF_MERKER } from '@/components/selg-utstyr/constants'

/** Søkbare merker (uten «Annet»-sekken). */
export const SEARCH_BRANDS = GOLF_MERKER.filter((m) => m !== 'Annet')

export type SearchCategory = { label: string; parent: string; kategori: string }

/**
 * Flat, søkbar kategoriliste (underkategori + overkategori) for navbar-søket.
 * `kategori` peker til /utforsk?kategori=<verdi> og matcher taksonomien i
 * utforsk-client (KATEGORI_DB_VALUES + underkategori-verdier).
 */
export const SEARCH_CATEGORIES: SearchCategory[] = [
  { label: 'Drivere', parent: 'Golfkøller', kategori: 'driver' },
  { label: 'Wooder', parent: 'Golfkøller', kategori: 'fairway_wood' },
  { label: 'Hybrider', parent: 'Golfkøller', kategori: 'hybrid' },
  { label: 'Jernsett', parent: 'Golfkøller', kategori: 'jernsett' },
  { label: 'Wedger', parent: 'Golfkøller', kategori: 'wedge' },
  { label: 'Puttere', parent: 'Golfkøller', kategori: 'putter' },
  { label: 'Sko', parent: 'Klær & Sko', kategori: 'sko' },
  { label: 'Klær', parent: 'Klær & Sko', kategori: 'klaer' },
  { label: 'Hansker', parent: 'Klær & Sko', kategori: 'hansker' },
  { label: 'Baller', parent: 'Baller', kategori: 'baller' },
  { label: 'Golfbagger', parent: 'Bagger', kategori: 'bagger' },
  { label: 'Avstandsmålere', parent: 'Annet', kategori: 'rangefinder' },
  { label: 'GPS-klokker', parent: 'Annet', kategori: 'gps' },
]

// ── Nylige søk (localStorage) ──────────────────────────────────────────────────

const RECENT_KEY = 'gt-recent-searches'
const RECENT_MAX = 6

export function lesNyligeSok(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(raw) ? (raw as string[]).slice(0, RECENT_MAX) : []
  } catch {
    return []
  }
}

export function leggTilNyligSok(term: string): string[] {
  const t = term.trim()
  if (!t) return lesNyligeSok()
  const utenDuplikat = lesNyligeSok().filter((s) => s.toLowerCase() !== t.toLowerCase())
  const neste = [t, ...utenDuplikat].slice(0, RECENT_MAX)
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(neste))
  } catch {
    // ignore
  }
  return neste
}

export function tomNyligeSok(): string[] {
  try {
    localStorage.removeItem(RECENT_KEY)
  } catch {
    // ignore
  }
  return []
}
