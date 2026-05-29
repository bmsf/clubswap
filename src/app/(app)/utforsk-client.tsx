'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ListingCard } from '@/components/ui/card-7'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Check, ChevronDown, ChevronRight, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchModeller, type ModellGruppe } from '@/app/actions/searchModeller'
import { formaterKoller } from '@/components/selg-utstyr/constants'

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
  haandighet?: string | null
  loft?: string | null
  koller?: string[] | null
}

type SortOption = 'nyeste' | 'pris-lav' | 'pris-høy'

// ── Constants ─────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'nyeste', label: 'Nyeste' },
  { value: 'pris-lav', label: 'Laveste pris' },
  { value: 'pris-høy', label: 'Høyeste pris' },
]

const KATEGORI_OPTIONS = [
  { value: 'golfkoller', label: 'Golfkøller' },
  { value: 'klaer_sko', label: 'Klær & Sko' },
  { value: 'baller', label: 'Baller' },
  { value: 'bagger', label: 'Bagger' },
  { value: 'annet', label: 'Annet' },
]

const UNDERKATEGORI_MAP: Record<string, { value: string; label: string }[]> = {
  golfkoller: [
    { value: 'driver', label: 'Drivere' },
    { value: 'mini_driver', label: 'Mini Drivere' },
    { value: 'fairway_wood', label: 'Wooder' },
    { value: 'hybrid', label: 'Hybrider' },
    { value: 'utility_iron', label: 'Utilityjern' },
    { value: 'jernsett', label: 'Jernsett' },
    { value: 'enkelt-jern', label: 'Løse jern' },
    { value: 'wedge', label: 'Wedger' },
    { value: 'putter', label: 'Puttere' },
  ],
  klaer_sko: [
    { value: 'sko', label: 'Sko' },
    { value: 'klaer', label: 'Klær' },
    { value: 'hansker', label: 'Hansker' },
  ],
  baller: [{ value: 'baller', label: 'Baller' }],
  bagger: [
    { value: 'bag', label: 'Golfbag' },
    { value: 'stand_bag', label: 'Stand bag' },
    { value: 'cart_bag', label: 'Cart bag' },
    { value: 'tour_bag', label: 'Tour bag' },
  ],
  annet: [
    { value: 'rangefinder', label: 'Avstandsmåler' },
    { value: 'gps', label: 'GPS-klokke' },
    { value: 'elektronikk', label: 'Elektronikk' },
    { value: 'annet', label: 'Diverse' },
  ],
}

const KATEGORI_DB_VALUES: Record<string, string[]> = {
  golfkoller: [
    'driver',
    'mini_driver',
    'fairway_wood',
    'hybrid',
    'utility_iron',
    'jernsett',
    'enkelt-jern',
    'wedge',
    'putter',
  ],
  klaer_sko: ['sko', 'klaer', 'hansker'],
  baller: ['baller'],
  bagger: ['bag', 'stand_bag', 'cart_bag', 'tour_bag'],
  annet: ['annet', 'rangefinder', 'elektronikk', 'gps'],
}

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
            checked
              ? 'border-foreground bg-foreground'
              : 'hover:border-foreground/50 border-neutral-950/10'
          )}
        >
          {checked && <Check className="text-background size-2.5" />}
        </div>
        <span className="text-sm">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-muted-foreground text-xs tabular-nums">{count}</span>
      )}
    </button>
  )
}

// ── CategoryTree ─────────────────────────────────────────────────────────────

const ALL_SUBKATEGORI = Object.values(UNDERKATEGORI_MAP).flat()

function CategoryTree({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const open = new Set<string>()
    for (const k of KATEGORI_OPTIONS) {
      if (
        selected.includes(k.value) ||
        (UNDERKATEGORI_MAP[k.value] ?? []).some((u) => selected.includes(u.value))
      ) {
        open.add(k.value)
      }
    }
    return open
  })

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function handleBroadSelect(key: string) {
    const childValues = (UNDERKATEGORI_MAP[key] ?? []).map((u) => u.value)
    const without = selected.filter((v) => !childValues.includes(v) && v !== key)
    onChange(selected.includes(key) ? without : [...without, key])
  }

  function handleSubSelect(parentKey: string, subValue: string) {
    const without = selected.filter((v) => v !== parentKey && v !== subValue)
    onChange(selected.includes(subValue) ? without : [...without, subValue])
  }

  return (
    <div className="px-5 pb-2">
      {KATEGORI_OPTIONS.map((k) => {
        const subs = UNDERKATEGORI_MAP[k.value] ?? []
        const isOpen = openGroups.has(k.value)
        const selectedCount = [k.value, ...subs.map((s) => s.value)].filter((v) =>
          selected.includes(v)
        ).length

        return (
          <div key={k.value} className="border-b border-neutral-950/10 last:border-0">
            <button
              onClick={() => toggleGroup(k.value)}
              className="flex w-full items-center justify-between py-3 text-left select-none"
            >
              <span className="text-sm font-medium">{k.label}</span>
              <div className="flex items-center gap-2">
                {selectedCount > 0 && (
                  <span className="bg-foreground text-background flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums">
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
                    label={`Alle ${k.label.toLowerCase()}`}
                    checked={selected.includes(k.value)}
                    onChange={() => handleBroadSelect(k.value)}
                  />
                  {subs.map((u) => (
                    <CheckOption
                      key={u.value}
                      label={u.label}
                      checked={selected.includes(u.value)}
                      onChange={() => handleSubSelect(k.value, u.value)}
                    />
                  ))}
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
      <input
        type="text"
        value={query}
        onChange={handleInput}
        placeholder="Søk, f.eks. Stealth 2…"
        className="bg-muted w-full rounded-lg px-3 py-2 text-sm outline-none"
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
                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
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
    <div className="border-b border-neutral-950/10 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left select-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{label}</span>
          {count != null && count > 0 && (
            <span className="bg-foreground text-background flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums">
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
            className="bg-background absolute top-full left-0 z-50 mt-1 w-44 rounded-xl border border-neutral-950/10 p-2 shadow-lg"
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

    if (valgtModellFilter) {
      result = result.filter(
        (l) => l.merke === valgtModellFilter.brand && l.modell === valgtModellFilter.model
      )
    }

    if (kategorier.length > 0) {
      const dbValues = kategorier.flatMap((v) => KATEGORI_DB_VALUES[v] ?? [v])
      result = result.filter((l) => l.kategori != null && dbValues.includes(l.kategori))
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

    return result
  }, [
    listings,
    valgtModellFilter,
    kategorier,
    merke,
    modell,
    tilstand,
    prisRange,
    skaft,
    sortering,
  ])

  const totalActiveFilters =
    (valgtModellFilter ? 1 : 0) +
    kategorier.length +
    merke.length +
    modell.length +
    tilstand.length +
    prisRange.length +
    skaft.length

  const showModell = merke.length === 1 && availableModels.length > 0

  return (
    <>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="border-b border-neutral-950/10">
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
                  <span className="h-4 w-px bg-neutral-950/10" />
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
          <SheetHeader className="border-b border-neutral-950/10 px-5 py-4">
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

            {/* Kategori — tree with inline subcategories */}
            <FilterRow
              label="Kategori"
              count={kategorier.length || undefined}
              open={openRows.has('kategori')}
              onToggle={() => toggleRow('kategori')}
              summary={
                kategorier.length > 0
                  ? kategorier
                      .map(
                        (v) =>
                          KATEGORI_OPTIONS.find((k) => k.value === v)?.label ??
                          ALL_SUBKATEGORI.find((u) => u.value === v)?.label ??
                          v
                      )
                      .join(', ')
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
          <div className="border-t border-neutral-950/10 px-5 py-4">
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

      {/* ── Result count + grid ────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl">
        {filteredListings.length > 0 && (
          <p className="text-muted-foreground px-4 pt-4 pb-1 text-xs tabular-nums md:px-6">
            {filteredListings.length} {filteredListings.length === 1 ? 'annonse' : 'annonser'}
          </p>
        )}

        {filteredListings.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center text-sm">Ingen annonser funnet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="p-2">
                <ListingCard
                  flat
                  name={listing.modell}
                  brand={listing.merke}
                  condition={listing.tilstand ?? ''}
                  price={listing.pris}
                  location={listing.selges_fra}
                  posted={relativTid(listing.opprettet_at)}
                  imageUrl={forsideBilde(listing.bilder)}
                  href={`/annonser/${listing.id}`}
                  clubsLabel={
                    listing.kategori === 'jernsett' && listing.koller && listing.koller.length > 0
                      ? formaterKoller(listing.koller)
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        )}
        <div className="pb-10" />
      </div>
    </>
  )
}
