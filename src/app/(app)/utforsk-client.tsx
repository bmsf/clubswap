'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ListingCard } from '@/components/ui/card-7'
import { Skeleton } from 'boneyard-js/react'
import { Check, X, ChevronDown, Funnel } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  skaft?: string | null
}

type SortOption = 'nyeste' | 'nær' | 'pris-lav' | 'pris-høy'
type DropdownKey = 'sort'

// ── Constants ─────────────────────────────────────────────────────────────────

const STAND_TYPER = ['Som ny', 'Meget god', 'God', 'Brukbar'] as const
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'nær', label: 'Nær deg' },
  { value: 'nyeste', label: 'Nyeste' },
  { value: 'pris-lav', label: 'Laveste pris' },
  { value: 'pris-høy', label: 'Høyeste pris' },
]

// ── Shared bar-button style ───────────────────────────────────────────────────

const BAR_BTN =
  'flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors select-none'
const BAR_BTN_IDLE = 'text-muted-foreground hover:text-foreground'
const BAR_BTN_ACTIVE = 'text-foreground'

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

// ── CheckOption ───────────────────────────────────────────────────────────────

function CheckOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center gap-3 py-1.5 text-left select-none"
    >
      <div
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
          checked ? 'border-foreground bg-foreground' : 'border-border hover:border-foreground/50'
        )}
      >
        {checked && <Check className="text-background h-2.5 w-2.5" />}
      </div>
      <span className="text-sm">{label}</span>
    </button>
  )
}

// ── FilterDropdown ────────────────────────────────────────────────────────────

function FilterDropdown({
  label,
  count,
  open,
  onToggle,
  align = 'left',
  children,
}: {
  label: string
  count?: number
  open: boolean
  onToggle: () => void
  align?: 'left' | 'right'
  children: React.ReactNode
}) {
  const hasCount = count != null && count > 0

  return (
    <div className="relative shrink-0">
      <button
        onClick={onToggle}
        className={cn(BAR_BTN, open || hasCount ? BAR_BTN_ACTIVE : BAR_BTN_IDLE)}
      >
        {label}
        {hasCount && (
          <span className="bg-muted text-foreground flex h-4 min-w-4 items-center justify-center rounded px-0.5 text-[10px] font-semibold tabular-nums">
            {count}
          </span>
        )}
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-150', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div
          className={cn(
            'border-border bg-background absolute top-full z-50 mt-2 rounded-xl border p-4 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────

function VDivider() {
  return <span className="bg-border h-4 w-px shrink-0" />
}

// ── Filter drawer ─────────────────────────────────────────────────────────────

function FilterDrawer({
  open,
  onClose,
  stand,
  onStandToggle,
  onReset,
  resultCount,
}: {
  open: boolean
  onClose: () => void
  stand: string[]
  onStandToggle: (v: string) => void
  onReset: () => void
  resultCount: number
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="bg-background fixed inset-y-0 left-0 z-50 flex w-80 max-w-[90vw] flex-col shadow-xl"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="border-border flex shrink-0 items-center justify-between border-b px-5 py-4">
              <span className="text-base font-semibold">Filtre</span>
              <button
                onClick={onClose}
                className="hover:bg-muted flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                aria-label="Lukk filtre"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <div className="space-y-2">
                <p className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
                  Stand
                </p>
                {STAND_TYPER.map((s) => (
                  <CheckOption
                    key={s}
                    label={s}
                    checked={stand.includes(s)}
                    onChange={() => onStandToggle(s)}
                  />
                ))}
              </div>
            </div>

            <div className="border-border flex shrink-0 items-center justify-between border-t px-5 py-4">
              <button
                onClick={onReset}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Nullstill alt
              </button>
              <button
                onClick={onClose}
                className="bg-foreground text-background rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
              >
                Vis {resultCount} annonser
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Card skeleton ─────────────────────────────────────────────────────────────

function CardFallback() {
  return (
    <div className="animate-pulse overflow-hidden">
      <div className="bg-muted m-2 aspect-square rounded-sm" />
      <div className="px-3.5 pt-3 pb-3">
        <div className="bg-muted mb-1.5 h-3.5 w-3/4 rounded-full" />
        <div className="bg-muted mb-2.5 h-2.5 w-1/2 rounded-full" />
        <div className="bg-muted h-3.5 w-16 rounded-full" />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function UtforskClient({ listings }: { listings: Listing[] }) {
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [stand, setStand] = useState<string[]>([])
  const [sortering, setSortering] = useState<SortOption>('nær')
  const filterBarRef = useRef<HTMLDivElement>(null)

  const toggle = (key: DropdownKey) => setOpenDropdown((prev) => (prev === key ? null : key))

  useEffect(() => {
    if (!openDropdown) return
    const handle = (e: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [openDropdown])

  function resetAllFilters() {
    setStand([])
  }

  const filteredListings = useMemo(() => {
    let result = [...listings]

    if (stand.length > 0) {
      result = result.filter((l) => l.tilstand != null && stand.includes(l.tilstand))
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
  }, [listings, stand, sortering])

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortering)?.label ?? 'Sorter'
  const drawerFilterCount = stand.length

  return (
    <>
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        stand={stand}
        onStandToggle={(v) => setStand(toggleItem(stand, v))}
        onReset={() => setStand([])}
        resultCount={filteredListings.length}
      />

      {/* Hero */}
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="py-10 text-center md:py-14">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Golftorget</h1>
          <p className="text-muted-foreground mt-3 text-base md:text-lg">
            Kjøp og selg golfutstyr i Norge
          </p>
        </div>
      </div>

      {/* Filter toolbar — sticky below top nav */}
      <div ref={filterBarRef} className="bg-background sticky top-16 z-30">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <div className="border-border flex h-12 items-center justify-between gap-6 border-t">
            {/* Left: Filtre drawer button */}
            <div className="flex items-center gap-2">
              {/* Filtre — opens drawer */}
              <button
                onClick={() => setDrawerOpen(true)}
                className={cn(
                  BAR_BTN,
                  drawerOpen || drawerFilterCount > 0 ? BAR_BTN_ACTIVE : BAR_BTN_IDLE
                )}
              >
                Filtre
                <div className="relative">
                  <Funnel className="h-4 w-4" />
                  {drawerFilterCount > 0 && (
                    <span className="bg-foreground text-background absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold">
                      {drawerFilterCount}
                    </span>
                  )}
                </div>
              </button>

              <VDivider />
              <button onClick={resetAllFilters} className={cn(BAR_BTN, BAR_BTN_IDLE)}>
                Nullstill alt
              </button>
            </div>

            {/* Right: Sort */}
            <FilterDropdown
              label={sortering === 'nær' ? 'Sorter' : `Sorter · ${currentSortLabel}`}
              open={openDropdown === 'sort'}
              onToggle={() => toggle('sort')}
              align="right"
            >
              <div className="w-40">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortering(opt.value)
                      setOpenDropdown(null)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between py-1.5 text-sm transition-colors',
                      sortering === opt.value
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {opt.label}
                    {sortering === opt.value && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </FilterDropdown>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <Skeleton
          name="utforsk-page"
          loading={false}
          animate="shimmer"
          color="#e5dfd1"
          darkColor="#2b2b2b"
          fallback={
            <div className="border-border grid grid-cols-2 border-t border-l sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border-border border-r border-b p-2">
                  <CardFallback />
                </div>
              ))}
            </div>
          }
        >
          {filteredListings.length === 0 ? (
            <p className="text-muted-foreground py-16 text-center text-sm">
              Ingen annonser funnet.
            </p>
          ) : (
            <div className="border-border grid grid-cols-2 border-t border-l sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="border-border border-r border-b p-2">
                  <Skeleton
                    name="listing-card"
                    loading={false}
                    animate="shimmer"
                    color="#e5dfd1"
                    darkColor="#2b2b2b"
                    fallback={<CardFallback />}
                  >
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
                    />
                  </Skeleton>
                </div>
              ))}
            </div>
          )}
        </Skeleton>
      </div>
      <div className="pb-10" />
    </>
  )
}
