'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ListingCard } from '@/components/ui/card-7'
import { ListingGrid } from '@/components/listing-grid'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Check, ChevronDown, ChevronRight, Filter, MapPin, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { createClient } from '@/supabase/client'
import { geokodPostnummerOffentlig } from '@/app/actions/geokoding'
import { searchModeller, type ModellGruppe } from '@/app/actions/searchModeller'
import { formaterKoller } from '@/components/selg-utstyr/constants'
import {
  TAKSONOMI,
  leafSlugsForSlug,
  facetForSlug,
  kategoriLabel,
  detaljProfil,
} from '@/lib/categories'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Listing = {
  id: string
  merke: string
  modell: string
  tilstand: string | null
  pris: number
  selges_fra: string | null
  bilder: unknown[] | null
  opprettet_at: string
  kategori?: string | null
  skaft_materiale?: string | null
  shaft_flex?: string | null
  haandighet?: string | null
  loft?: string | null
  koller?: string[] | null
  lat?: number | null
  lng?: number | null
}

type SortOption = 'nyeste' | 'pris-lav' | 'pris-høy'

const RADIUS_VALG: { value: number | null; label: string }[] = [
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: null, label: 'Hele landet' },
]

// ── Constants ─────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'nyeste', label: 'Nyeste' },
  { value: 'pris-lav', label: 'Laveste pris' },
  { value: 'pris-høy', label: 'Høyeste pris' },
]

const PRIS_RANGES = [
  { label: 'Under 500 kr', min: 0, max: 500 },
  { label: '500 – 2 000 kr', min: 500, max: 2000 },
  { label: '2 000 – 5 000 kr', min: 2000, max: 5000 },
  { label: 'Over 5 000 kr', min: 5000, max: Infinity },
]

const MERKE_OPTIONS = [
  'Titleist',
  'TaylorMade',
  'Callaway',
  'Ping',
  'Mizuno',
  'Cobra',
  'Cleveland',
  'Srixon',
  'Scotty Cameron',
  'Wilson',
]

const TILSTAND_OPTIONS = [
  { value: 'ny', label: 'Ny' },
  { value: 'utmerket', label: 'Utmerket' },
  { value: 'god', label: 'God' },
  { value: 'akseptabel', label: 'Akseptabel' },
]

// Eldre verdier (engelske koder + norske etiketter) → nye koder
const TILSTAND_LEGACY: Record<string, string> = {
  mint: 'ny',
  Ny: 'ny',
  very_good: 'utmerket',
  som_ny: 'utmerket',
  'Som ny': 'utmerket',
  'Meget god': 'utmerket',
  good: 'god',
  bra: 'god',
  Bra: 'god',
  God: 'god',
  fair: 'akseptabel',
  ok: 'akseptabel',
  OK: 'akseptabel',
  Akseptabel: 'akseptabel',
  slitt: 'akseptabel',
  Slitt: 'akseptabel',
}

const TILSTAND_LABEL: Record<string, string> = {
  ny: 'Ny',
  utmerket: 'Utmerket',
  god: 'God',
  akseptabel: 'Akseptabel',
}

const SKAFT_OPTIONS = [
  { value: 'graphite', label: 'Grafitt' },
  { value: 'steel', label: 'Stål' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativTid(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `${m}m siden`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}t siden`
  return `${Math.floor(h / 24)}d siden`
}

function forsideBilde(bilder: unknown[] | null): string | undefined {
  return Array.isArray(bilder) && bilder.length > 0 ? (bilder[0] as string) : undefined
}

function toggleItem(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

function normalisertTilstand(raw: string | null): string {
  if (!raw) return ''
  return TILSTAND_LEGACY[raw] ?? raw
}

// ── CheckOption ───────────────────────────────────────────────────────────────

function CheckOption({
  label,
  count,
  checked,
  onChange,
}: {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center justify-between gap-3 py-2 text-left select-none"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
            checked ? 'border-foreground bg-foreground' : 'hover:border-foreground/50 border-border'
          )}
        >
          {checked && <Check className="text-background size-2.5" />}
        </div>
        <span className="text-sm">{label}</span>
      </div>
      {count !== undefined && <span className="text-muted-foreground tabnum text-xs">{count}</span>}
    </button>
  )
}

// ── CategoryTree (3 nivåer: hoved → gruppe → leaf) ───────────────────────────

// Alle slugs (hoved + grupper + leaves) som hører til en hovedkategori — for telling.
function slugsForHoved(hovedSlug: string): Set<string> {
  const set = new Set<string>([hovedSlug])
  const hoved = TAKSONOMI.find((h) => h.slug === hovedSlug)
  for (const g of hoved?.grupper ?? []) {
    set.add(g.slug)
    for (const l of g.leaves) set.add(l.slug)
  }
  return set
}

function CategoryTree({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [openHoved, setOpenHoved] = useState<Set<string>>(() => {
    const open = new Set<string>()
    for (const h of TAKSONOMI) {
      if ([...slugsForHoved(h.slug)].some((s) => selected.includes(s))) open.add(h.slug)
    }
    return open
  })
  const [openGruppe, setOpenGruppe] = useState<Set<string>>(new Set())

  function toggle(set: Set<string>, key: string, setter: (s: Set<string>) => void) {
    const next = new Set(set)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setter(next)
  }

  // Velg en slug eksklusivt: fjern foreldre og barn-slugs så vi ikke dobbeltteller.
  function selectSlug(slug: string, relatert: string[]) {
    const without = selected.filter((v) => v !== slug && !relatert.includes(v))
    onChange(selected.includes(slug) ? without : [...without, slug])
  }

  return (
    <div className="px-5 pb-2">
      {TAKSONOMI.map((hoved) => {
        const alleSlugs = slugsForHoved(hoved.slug)
        const selectedCount = [...alleSlugs].filter((s) => selected.includes(s)).length
        const isOpen = openHoved.has(hoved.slug)
        const hovedRelatert = [...alleSlugs].filter((s) => s !== hoved.slug)

        return (
          <div key={hoved.slug} className="border-border border-b last:border-0">
            <button
              onClick={() => toggle(openHoved, hoved.slug, setOpenHoved)}
              className="flex w-full items-center justify-between py-3 text-left select-none"
            >
              <span className="text-sm font-medium">{hoved.label}</span>
              <div className="flex items-center gap-2">
                {selectedCount > 0 && (
                  <span className="bg-foreground text-background tabnum flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold">
                    {selectedCount}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    'text-muted-foreground size-4 transition-transform duration-150',
                    isOpen && 'rotate-180'
                  )}
                />
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden pl-2"
                >
                  <CheckOption
                    label={`Alle ${hoved.label.toLowerCase()}`}
                    checked={selected.includes(hoved.slug)}
                    onChange={() => selectSlug(hoved.slug, hovedRelatert)}
                  />
                  {hoved.grupper.map((gruppe) => {
                    const leafSlugs = gruppe.leaves.map((l) => l.slug)
                    const gruppeRelatert = [hoved.slug, ...leafSlugs]
                    const gOpen = openGruppe.has(gruppe.slug)
                    const gCount = [gruppe.slug, ...leafSlugs].filter((s) =>
                      selected.includes(s)
                    ).length
                    return (
                      <div key={gruppe.slug} className="border-border/60 border-t first:border-0">
                        <button
                          onClick={() => toggle(openGruppe, gruppe.slug, setOpenGruppe)}
                          className="flex w-full items-center justify-between py-2 pl-2 text-left select-none"
                        >
                          <span className="text-muted-foreground text-xs font-medium">
                            {gruppe.label}
                          </span>
                          <div className="flex items-center gap-2">
                            {gCount > 0 && (
                              <span className="bg-foreground/80 text-background tabnum flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold">
                                {gCount}
                              </span>
                            )}
                            <ChevronDown
                              className={cn(
                                'text-muted-foreground size-3.5 transition-transform duration-150',
                                gOpen && 'rotate-180'
                              )}
                            />
                          </div>
                        </button>
                        <AnimatePresence>
                          {gOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden pl-4"
                            >
                              {!gruppe.facet && (
                                <CheckOption
                                  label={`Alle ${gruppe.label.toLowerCase()}`}
                                  checked={selected.includes(gruppe.slug)}
                                  onChange={() => selectSlug(gruppe.slug, gruppeRelatert)}
                                />
                              )}
                              {gruppe.leaves.map((leaf) => (
                                <CheckOption
                                  key={leaf.slug}
                                  label={leaf.label}
                                  checked={selected.includes(leaf.slug)}
                                  onChange={() => selectSlug(leaf.slug, [hoved.slug, gruppe.slug])}
                                />
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

// ── ModellFilterRow ───────────────────────────────────────────────────────────

function ModellFilterRow({
  value,
  onChange,
}: {
  value: { brand: string; model: string } | null
  onChange: (v: { brand: string; model: string } | null) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ModellGruppe[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (q.length < 2) {
      setResults([])
      return
    }
    timerRef.current = setTimeout(async () => {
      const res = await searchModeller(q)
      setResults(res)
    }, 300)
  }

  if (value) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {value.brand} {value.model}
        </span>
        <button
          onClick={() => onChange(null)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fjern modellfilter"
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="text"
        value={query}
        onChange={handleInput}
        placeholder="Søk, f.eks. Stealth 2…"
        className="bg-muted h-auto w-full rounded-lg border-0 px-3 py-2"
      />
      {results.length > 0 && (
        <div className="flex flex-col">
          {results.map((r) => (
            <button
              key={`${r.brand}__${r.model}`}
              onClick={() => {
                onChange({ brand: r.brand, model: r.model })
                setQuery('')
                setResults([])
              }}
              className="hover:bg-muted flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition-colors"
            >
              <span>
                {r.brand} {r.model}
                {r.year ? ` (${r.year})` : ''}
              </span>
              {r.variants.some((v) => v.count > 0) && (
                <span className="text-muted-foreground tabnum shrink-0 text-xs">
                  {r.variants.reduce((s, v) => s + v.count, 0)} annonser
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      {query.length >= 2 && results.length === 0 && (
        <p className="text-muted-foreground text-xs">Ingen modeller funnet</p>
      )}
    </div>
  )
}

// ── FilterRow (accordion row inside drawer) ───────────────────────────────────

function FilterRow({
  label,
  count,
  open,
  onToggle,
  summary,
  children,
}: {
  label: string
  count?: number
  open: boolean
  onToggle: () => void
  summary?: string
  children: React.ReactNode
}) {
  return (
    <div className="border-border border-b last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left select-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{label}</span>
          {count != null && count > 0 && (
            <span className="bg-foreground text-background tabnum flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold">
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!open && summary && (
            <span className="text-muted-foreground max-w-32 truncate text-xs">{summary}</span>
          )}
          {open ? (
            <ChevronDown className="text-muted-foreground size-4" />
          ) : (
            <ChevronRight className="text-muted-foreground size-4" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Sort dropdown (stays in top bar) ─────────────────────────────────────────

function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption
  onChange: (v: SortOption) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="text-foreground hover:text-foreground/70 flex items-center gap-1.5 py-4 text-sm font-medium transition-colors select-none"
      >
        Sorter
        <ChevronDown
          className={cn('size-4 transition-transform duration-150', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="bg-background border-border absolute top-full left-0 z-50 mt-1 w-44 rounded-xl border p-2 shadow-lg"
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                  value === opt.value
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {opt.label}
                {value === opt.value && <Check className="size-3.5" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function UtforskClient({
  listings,
  initialKategori,
}: {
  listings: Listing[]
  initialKategori?: string[]
}) {
  // Fritekstsøk er bare et filter, drevet av ?sok=-parameteren (navbar-søket).
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const sokTerm = (searchParams.get('sok') ?? '').trim()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [openRows, setOpenRows] = useState<Set<string>>(new Set())
  const [valgtModellFilter, setValgtModellFilter] = useState<{
    brand: string
    model: string
  } | null>(null)
  const [kategorier, setKategorier] = useState<string[]>(initialKategori ?? [])
  const [merke, setMerke] = useState<string[]>([])
  const [modell, setModell] = useState<string[]>([])
  const [tilstand, setTilstand] = useState<string[]>([])
  const [prisRange, setPrisRange] = useState<string[]>([])
  const [skaft, setSkaft] = useState<string[]>([])
  const [sortering, setSortering] = useState<SortOption>('nyeste')

  // ── Nærhet / posisjon ───────────────────────────────────────────────────────
  const [posisjon, setPosisjon] = useState<{ lat: number; lng: number } | null>(null)
  const [radiusKm, setRadiusKm] = useState<number | null>(25)
  const [postnummerInput, setPostnummerInput] = useState('')
  const [posisjonsfeil, setPosisjonsfeil] = useState<string | null>(null)
  const [henterPosisjon, setHenterPosisjon] = useState(false)

  const supabase = useMemo(() => createClient(), [])
  const radiusM = radiusKm ? radiusKm * 1000 : 100_000_000

  const { data: naerhetData } = useQuery({
    queryKey: ['naerheten', posisjon?.lat, posisjon?.lng, radiusM],
    enabled: !!posisjon,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('annonser_i_naerheten', {
        inn_lng: posisjon!.lng,
        inn_lat: posisjon!.lat,
        radius_m: radiusM,
        maks: 500,
      })
      if (error) throw error
      return (data ?? []) as { id: string; distance_m: number }[]
    },
  })

  const avstandKart = useMemo(() => {
    if (!posisjon || !naerhetData) return null
    return new Map(naerhetData.map((r) => [r.id, r.distance_m]))
  }, [posisjon, naerhetData])

  function brukMinPosisjon() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setPosisjonsfeil('Posisjon støttes ikke i denne nettleseren.')
      return
    }
    setHenterPosisjon(true)
    setPosisjonsfeil(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosisjon({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setHenterPosisjon(false)
      },
      () => {
        setPosisjonsfeil('Fant ikke posisjonen din. Skriv inn postnummer i stedet.')
        setHenterPosisjon(false)
      },
      { timeout: 10000 }
    )
  }

  async function brukPostnummer() {
    const pnr = postnummerInput.trim()
    if (!pnr) return
    const k = await geokodPostnummerOffentlig(pnr)
    if (!k) {
      setPosisjonsfeil('Ukjent postnummer.')
      return
    }
    setPosisjon(k)
    setPosisjonsfeil(null)
  }

  function nullstillPosisjon() {
    setPosisjon(null)
    setPostnummerInput('')
    setPosisjonsfeil(null)
  }

  function handleMerkeToggle(value: string) {
    const next = toggleItem(merke, value)
    setMerke(next)
    if (next.length !== 1) setModell([])
  }

  function toggleRow(key: string) {
    setOpenRows((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function resetAllFilters() {
    setValgtModellFilter(null)
    setKategorier([])
    setMerke([])
    setModell([])
    setTilstand([])
    setPrisRange([])
    setSkaft([])
    nullstillPosisjon()
    // Tøm også søkeordet (og evt. stale kategori-param) fra URL-en.
    if (searchParams.toString()) router.push(pathname)
  }

  const availableModels = useMemo(() => {
    if (merke.length !== 1) return []
    const brand = merke[0]
    const counts: Record<string, number> = {}
    for (const l of listings) {
      if (l.merke === brand && l.modell) {
        counts[l.modell] = (counts[l.modell] ?? 0) + 1
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  }, [listings, merke])

  const filteredListings = useMemo(() => {
    let result = [...listings]

    // Nærhetsfilter: behold kun annonser RPC-en returnerte innenfor radius.
    if (posisjon && avstandKart) {
      result = result.filter((l) => avstandKart.has(l.id))
    }

    if (sokTerm) {
      const tokens = sokTerm.toLowerCase().split(/\s+/)
      result = result.filter((l) => {
        const hay = `${l.merke} ${l.modell} ${l.tilstand ?? ''} ${l.kategori ?? ''}`.toLowerCase()
        return tokens.every((t) => hay.includes(t))
      })
    }

    if (valgtModellFilter) {
      result = result.filter(
        (l) => l.merke === valgtModellFilter.brand && l.modell === valgtModellFilter.model
      )
    }

    if (kategorier.length > 0) {
      // Ekspander valgte slugs (hoved/gruppe/leaf) til leaf-slugs + flex-facetverdier.
      const katLeafs = new Set<string>()
      const flexValues = new Set<string>()
      for (const slug of kategorier) {
        const facet = facetForSlug(slug)
        if (facet) {
          flexValues.add(facet.value)
          continue
        }
        for (const s of leafSlugsForSlug(slug)) katLeafs.add(s)
      }
      result = result.filter((l) => {
        const katOk = katLeafs.size === 0 || (l.kategori != null && katLeafs.has(l.kategori))
        const flexOk =
          flexValues.size === 0 || (l.shaft_flex != null && flexValues.has(l.shaft_flex))
        return katOk && flexOk
      })
    }
    if (merke.length > 0) {
      result = result.filter((l) => merke.includes(l.merke))
    }
    if (modell.length > 0) {
      result = result.filter((l) => modell.includes(l.modell))
    }
    if (tilstand.length > 0) {
      result = result.filter((l) => {
        const norm = normalisertTilstand(l.tilstand)
        return tilstand.includes(norm)
      })
    }
    if (prisRange.length > 0) {
      result = result.filter((l) =>
        prisRange.some((label) => {
          const r = PRIS_RANGES.find((p) => p.label === label)
          return r && l.pris >= r.min && l.pris < r.max
        })
      )
    }
    if (skaft.length > 0) {
      result = result.filter((l) => l.skaft_materiale != null && skaft.includes(l.skaft_materiale))
    }

    // Når posisjon er aktiv styrer avstand sorteringen (nærmest først).
    if (posisjon && avstandKart) {
      result.sort(
        (a, b) => (avstandKart.get(a.id) ?? Infinity) - (avstandKart.get(b.id) ?? Infinity)
      )
    } else {
      switch (sortering) {
        case 'nyeste':
          result.sort(
            (a, b) => new Date(b.opprettet_at).getTime() - new Date(a.opprettet_at).getTime()
          )
          break
        case 'pris-lav':
          result.sort((a, b) => a.pris - b.pris)
          break
        case 'pris-høy':
          result.sort((a, b) => b.pris - a.pris)
          break
      }
    }

    return result
  }, [
    listings,
    sokTerm,
    valgtModellFilter,
    kategorier,
    merke,
    modell,
    tilstand,
    prisRange,
    skaft,
    sortering,
    posisjon,
    avstandKart,
  ])

  const totalActiveFilters =
    (sokTerm ? 1 : 0) +
    (valgtModellFilter ? 1 : 0) +
    kategorier.length +
    merke.length +
    modell.length +
    tilstand.length +
    prisRange.length +
    skaft.length +
    (posisjon ? 1 : 0)

  const showModell = merke.length === 1 && availableModels.length > 0

  return (
    <>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="border-border border-b">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Left: Filtre + Nullstill */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="text-foreground hover:text-foreground/70 flex items-center gap-2 py-4 text-sm font-medium transition-colors select-none"
              >
                <Filter className="size-4" />
                {totalActiveFilters > 0 ? `${totalActiveFilters} Filtre` : 'Filtre'}
              </button>
              {totalActiveFilters > 0 && (
                <>
                  <span className="bg-border h-4 w-px" />
                  <button
                    onClick={resetAllFilters}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors select-none"
                  >
                    Nullstill alt
                  </button>
                </>
              )}
            </div>

            {/* Right: Sort */}
            <SortDropdown value={sortering} onChange={setSortering} />
          </div>
        </div>
      </div>

      {/* ── Filter drawer ─────────────────────────────────────────────────── */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="flex w-full flex-col p-0 sm:max-w-sm">
          <SheetHeader className="border-border border-b px-5 py-4">
            <SheetTitle className="text-base font-semibold">Filtre</SheetTitle>
          </SheetHeader>

          {/* Scrollable filter rows */}
          <div className="flex-1 overflow-y-auto">
            {/* Modell-søk — search by exact model name */}
            <FilterRow
              label="Modell-søk"
              count={valgtModellFilter ? 1 : 0}
              open={openRows.has('modell-sok')}
              onToggle={() => toggleRow('modell-sok')}
              summary={
                valgtModellFilter
                  ? `${valgtModellFilter.brand} ${valgtModellFilter.model}`
                  : undefined
              }
            >
              <ModellFilterRow value={valgtModellFilter} onChange={setValgtModellFilter} />
            </FilterRow>

            {/* Avstand — finn annonser i nærheten */}
            <FilterRow
              label="Avstand"
              count={posisjon ? 1 : undefined}
              open={openRows.has('avstand')}
              onToggle={() => toggleRow('avstand')}
              summary={posisjon ? (radiusKm ? `Innen ${radiusKm} km` : 'Hele landet') : undefined}
            >
              <div className="space-y-3">
                {!posisjon ? (
                  <>
                    <button
                      type="button"
                      onClick={brukMinPosisjon}
                      disabled={henterPosisjon}
                      className="border-border hover:border-foreground/40 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      <MapPin className="size-4" />
                      {henterPosisjon ? 'Henter posisjon…' : 'Bruk min posisjon'}
                    </button>
                    <div className="flex items-center gap-2">
                      <Input
                        value={postnummerInput}
                        onChange={(e) => setPostnummerInput(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => e.key === 'Enter' && brukPostnummer()}
                        placeholder="Eller skriv postnummer"
                        inputMode="numeric"
                        maxLength={4}
                        className="h-auto w-full rounded-lg bg-transparent px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={brukPostnummer}
                        className="bg-foreground text-background rounded-lg px-3 py-2 text-sm font-medium"
                      >
                        Bruk
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Posisjon valgt</span>
                    <button
                      type="button"
                      onClick={nullstillPosisjon}
                      className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2"
                    >
                      Fjern
                    </button>
                  </div>
                )}

                {posisjonsfeil && <p className="text-destructive text-xs">{posisjonsfeil}</p>}

                <div className="flex flex-wrap gap-1.5">
                  {RADIUS_VALG.map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => setRadiusKm(r.value)}
                      disabled={!posisjon}
                      className={cn(
                        'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50',
                        radiusKm === r.value
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground/40'
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </FilterRow>

            {/* Kategori — tree with inline subcategories */}
            <FilterRow
              label="Kategori"
              count={kategorier.length || undefined}
              open={openRows.has('kategori')}
              onToggle={() => toggleRow('kategori')}
              summary={
                kategorier.length > 0
                  ? kategorier.map((v) => kategoriLabel(v) ?? v).join(', ')
                  : undefined
              }
            >
              <CategoryTree selected={kategorier} onChange={setKategorier} />
            </FilterRow>

            {/* Merke */}
            <FilterRow
              label="Merke"
              count={merke.length || undefined}
              open={openRows.has('merke')}
              onToggle={() => toggleRow('merke')}
              summary={merke.length > 0 ? merke.join(', ') : undefined}
            >
              {MERKE_OPTIONS.map((m) => (
                <CheckOption
                  key={m}
                  label={m}
                  checked={merke.includes(m)}
                  onChange={() => handleMerkeToggle(m)}
                />
              ))}
            </FilterRow>

            {/* Modell — only when single brand selected */}
            <AnimatePresence>
              {showModell && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <FilterRow
                    label="Modell"
                    count={modell.length || undefined}
                    open={openRows.has('modell')}
                    onToggle={() => toggleRow('modell')}
                    summary={modell.length > 0 ? modell.join(', ') : undefined}
                  >
                    {availableModels.map(({ name, count }) => (
                      <CheckOption
                        key={name}
                        label={name}
                        count={count}
                        checked={modell.includes(name)}
                        onChange={() => setModell(toggleItem(modell, name))}
                      />
                    ))}
                  </FilterRow>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tilstand */}
            <FilterRow
              label="Tilstand"
              count={tilstand.length || undefined}
              open={openRows.has('tilstand')}
              onToggle={() => toggleRow('tilstand')}
              summary={
                tilstand.length > 0
                  ? tilstand.map((v) => TILSTAND_LABEL[v] ?? v).join(', ')
                  : undefined
              }
            >
              {TILSTAND_OPTIONS.map((t) => (
                <CheckOption
                  key={t.value}
                  label={t.label}
                  checked={tilstand.includes(t.value)}
                  onChange={() => setTilstand(toggleItem(tilstand, t.value))}
                />
              ))}
            </FilterRow>

            {/* Pris */}
            <FilterRow
              label="Pris"
              count={prisRange.length || undefined}
              open={openRows.has('pris')}
              onToggle={() => toggleRow('pris')}
              summary={prisRange.length > 0 ? prisRange.join(', ') : undefined}
            >
              {PRIS_RANGES.map((r) => (
                <CheckOption
                  key={r.label}
                  label={r.label}
                  checked={prisRange.includes(r.label)}
                  onChange={() => setPrisRange(toggleItem(prisRange, r.label))}
                />
              ))}
            </FilterRow>

            {/* Skaft */}
            <FilterRow
              label="Skaft"
              count={skaft.length || undefined}
              open={openRows.has('skaft')}
              onToggle={() => toggleRow('skaft')}
              summary={
                skaft.length > 0
                  ? skaft
                      .map((v) => SKAFT_OPTIONS.find((s) => s.value === v)?.label ?? v)
                      .join(', ')
                  : undefined
              }
            >
              {SKAFT_OPTIONS.map((s) => (
                <CheckOption
                  key={s.value}
                  label={s.label}
                  checked={skaft.includes(s.value)}
                  onChange={() => setSkaft(toggleItem(skaft, s.value))}
                />
              ))}
            </FilterRow>
          </div>

          {/* Footer */}
          <div className="border-border border-t px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={resetAllFilters}
                className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-2 transition-colors"
              >
                Nullstill alt
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="bg-foreground text-background flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              >
                Vis {filteredListings.length}{' '}
                {filteredListings.length === 1 ? 'annonse' : 'annonser'}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl">
        {filteredListings.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center text-sm">Ingen annonser funnet.</p>
        ) : (
          <ListingGrid>
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                flat
                name={listing.modell}
                brand={listing.merke}
                price={listing.pris}
                location={listing.selges_fra}
                posted={relativTid(listing.opprettet_at)}
                imageUrl={forsideBilde(listing.bilder)}
                href={`/annonser/${listing.id}`}
                distanceKm={
                  avstandKart?.has(listing.id)
                    ? Math.round((avstandKart.get(listing.id) ?? 0) / 1000)
                    : undefined
                }
                clubsLabel={
                  detaljProfil(listing.kategori) === 'iron_set' &&
                  listing.koller &&
                  listing.koller.length > 0
                    ? formaterKoller(listing.koller)
                    : undefined
                }
              />
            ))}
          </ListingGrid>
        )}
        <div className="pb-10" />
      </div>
    </>
  )
}
