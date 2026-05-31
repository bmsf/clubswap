import { GOLF_MERKER } from '@/components/selg-utstyr/constants'
import { ALLE_LEAVES } from '@/lib/categories'

/** Søkbare merker (uten «Annet»-sekken). */
export const SEARCH_BRANDS = GOLF_MERKER.filter((m) => m !== 'Annet')

export type SearchCategory = { label: string; parent: string; kategori: string }

/**
 * Flat, søkbar kategoriliste (leaf + hovedkategori) for navbar-søket, generert
 * fra den delte taksonomien. `kategori` peker til /utforsk?kategori=<leaf-slug>.
 * Facet-leaves (Skaft etter flex) utelates — de filtrerer på en annen kolonne.
 */
export const SEARCH_CATEGORIES: SearchCategory[] = ALLE_LEAVES.filter((l) => !l.facet).map((l) => ({
  label: l.label,
  parent: l.hovedLabel,
  kategori: l.slug,
}))

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
