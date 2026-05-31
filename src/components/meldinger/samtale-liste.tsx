'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ImageOff, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { relativTid } from '@/lib/tid'

export type SamtaleListeItem = {
  key: string
  listingId: string
  motpartId: string
  motpartNavn: string
  motpartAvatar: string | null
  annonseTittel: string
  annonseBilde?: string
  sisteTekst: string
  sistAktiv: string
  ulest: number
  solgt?: boolean
}

function initialer(navn: string) {
  return (
    navn
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  )
}

export function SamtaleListe({
  annonse,
  samtaler,
  activeMed,
}: {
  annonse: { tittel: string; bilde?: string }
  samtaler: SamtaleListeItem[]
  activeMed: string | null
}) {
  const [sok, setSok] = useState('')

  const q = sok.trim().toLowerCase()
  const synlige = samtaler.filter(
    (s) => !q || `${s.motpartNavn} ${s.sisteTekst}`.toLowerCase().includes(q)
  )

  return (
    <div className="flex h-full flex-col">
      {/* Tilbake + annonse */}
      <div className="flex items-center gap-2 px-3 pt-4 pb-2">
        <Link
          href="/meldinger"
          className="text-muted-foreground hover:text-foreground hover:bg-muted flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
          aria-label="Tilbake til annonser"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="bg-muted relative size-9 shrink-0 overflow-hidden rounded-md">
          {annonse.bilde ? (
            <img
              src={annonse.bilde}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff className="text-foreground/20 size-4" />
            </div>
          )}
        </div>
        <p className="text-foreground min-w-0 truncate text-sm font-semibold">{annonse.tittel}</p>
      </div>

      {/* Søk */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={sok}
            onChange={(e) => setSok(e.target.value)}
            placeholder="Søk i samtaler"
            className="pl-9"
          />
        </div>
      </div>

      {/* Samtaler */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-2 px-4 pb-4">
          {synlige.length === 0 ? (
            <p className="text-muted-foreground px-2 py-10 text-center text-sm">Ingen samtaler.</p>
          ) : (
            synlige.map((s) => {
              const active = s.motpartId === activeMed
              return (
                <Link
                  key={s.key}
                  href={`/meldinger?annonse=${s.listingId}&med=${s.motpartId}`}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                    active
                      ? 'border-foreground/25 bg-muted'
                      : 'border-border bg-card hover:bg-muted/50'
                  )}
                >
                  <div className="bg-muted text-foreground relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold">
                    {s.motpartAvatar ? (
                      <img
                        src={s.motpartAvatar}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      initialer(s.motpartNavn)
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-foreground truncate text-sm font-semibold">
                          {s.motpartNavn}
                        </span>
                        {s.ulest > 0 && (
                          <span className="bg-primary size-2 shrink-0 rounded-full" />
                        )}
                      </div>
                      <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                        {relativTid(s.sistAktiv)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                      {s.sisteTekst}
                    </p>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
