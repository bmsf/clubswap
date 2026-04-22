'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPathIcon } from '@heroicons/react/16/solid'
import { createClient } from '@/supabase/client'
import { useRedigerAnnonseModal } from '@/store/rediger-annonse-modal'
import { SelgUtstyrView } from '@/components/selg-utstyr-view'
import { CATEGORY_TO_DB, TILSTANDER } from '@/components/selg-utstyr/constants'
import type { Category, Condition } from '@/components/selg-utstyr/constants'

type Annonse = {
  id: string
  kategori: string
  merke: string
  modell: string
  aarsmodell?: string | null
  shaft_flex?: string | null
  haandighet?: string | null
  loft?: string | null
  skaft_materiale?: string | null
  tilstand: string
  skadebeskrivelse?: string | null
  pris: number
  selges_fra: string
  tilbyr_frakt: boolean
  bilder: string[]
}

const KJENTE_MERKER = [
  'TaylorMade',
  'Callaway',
  'Titleist',
  'Ping',
  'Cobra',
  'Cleveland',
  'Srixon',
  'Mizuno',
  'Wilson',
  'Odyssey',
  'Scotty Cameron',
  'PXG',
  'Honma',
]

const DB_TO_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_TO_DB).map(([k, v]) => [v, k])
) as Record<string, Category>

function dbTilstandToCondition(tilstand: string): Condition | undefined {
  return TILSTANDER.find((t) => t.label === tilstand)?.value
}

function mapAnnonse(a: Annonse) {
  const merkeErKjent = KJENTE_MERKER.includes(a.merke)
  const kategori = DB_TO_CATEGORY[a.kategori] ?? null
  const initialTilstand = dbTilstandToCondition(a.tilstand)

  const initialData = {
    merke: merkeErKjent ? a.merke : 'Annet',
    annetMerke: merkeErKjent ? undefined : a.merke,
    modell: a.modell,
    aarsmodell: a.aarsmodell ?? undefined,
    shaftFlex: (a.shaft_flex as never) ?? undefined,
    hand:
      a.haandighet === 'Høyre'
        ? ('right' as const)
        : a.haandighet === 'Venstre'
          ? ('left' as const)
          : undefined,
    loft: a.loft ?? undefined,
    skaftType:
      a.skaft_materiale === 'Stål'
        ? ('steel' as const)
        : a.skaft_materiale === 'Grafitt'
          ? ('graphite' as const)
          : undefined,
    skadebeskrivelse: a.skadebeskrivelse ?? undefined,
    pris: a.pris,
    selgesFra: a.selges_fra,
    tilbyrFrakt: a.tilbyr_frakt,
  }

  return { kategori, initialTilstand, initialData, eksisterendeBilder: a.bilder ?? [] }
}

export function RedigerAnnonseModal() {
  const { open, annonseId, closeModal } = useRedigerAnnonseModal()
  const router = useRouter()
  const [annonse, setAnnonse] = useState<Annonse | null>(null)
  const laster = open && !!annonseId && !annonse

  useEffect(() => {
    if (!open || !annonseId) return
    const supabase = createClient()
    supabase
      .from('annonser')
      .select('*')
      .eq('id', annonseId)
      .single()
      .then(({ data }) => setAnnonse(data))
    return () => setAnnonse(null)
  }, [open, annonseId])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, closeModal])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const mapped = annonse ? mapAnnonse(annonse) : null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

      <div
        role="dialog"
        aria-modal="true"
        className="bg-card border-border relative z-10 my-auto w-[min(95vw,700px)] overflow-hidden rounded-2xl border shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-foreground text-base font-semibold">Rediger annonse</h2>
          <button
            type="button"
            onClick={closeModal}
            className="text-muted-foreground hover:text-foreground flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors"
            aria-label="Lukk"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {laster || !mapped ? (
            <div className="flex h-48 items-center justify-center">
              <ArrowPathIcon className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : (
            <SelgUtstyrView
              key={annonseId}
              annonseId={annonseId!}
              initialData={mapped.initialData}
              initialKategori={mapped.kategori ?? undefined}
              initialTilstand={mapped.initialTilstand}
              eksisterendeBilder={mapped.eksisterendeBilder}
              modalModus
              onSuccess={() => {
                closeModal()
                router.refresh()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
