'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ImageOff, Search } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { relativTid } from '@/lib/tid'

type Felles = {
  listingId: string
  tittel: string
  bilde?: string
  solgt?: boolean
  ulest: number
  sistAktiv: string
}

export type InnboksItem =
  | (Felles & { type: 'salg'; antallSamtaler: number })
  | (Felles & { type: 'kjop'; motpartId: string; motpartNavn: string; sisteTekst: string })

type Fane = 'alle' | 'kjop' | 'salg'

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

function href(item: InnboksItem): string {
  // Salg → inn i annonsen (samtaleliste). Kjøp → rett i tråden med selgeren.
  return item.type === 'salg'
    ? `/meldinger?annonse=${item.listingId}`
    : `/meldinger?annonse=${item.listingId}&med=${item.motpartId}`
}

function sokTekst(item: InnboksItem): string {
  return item.type === 'kjop'
    ? `${item.tittel} ${item.motpartNavn} ${item.sisteTekst}`
    : item.tittel
}

export function InnboksListe({
  items,
  activeListingId,
  activeMed,
}: {
  items: InnboksItem[]
  activeListingId: string | null
  activeMed: string | null
}) {
  const [fane, setFane] = useState<Fane>('alle')
  const [sok, setSok] = useState('')

  const q = sok.trim().toLowerCase()
  const synlige = items.filter((it) => {
    if (fane !== 'alle' && it.type !== fane) return false
    if (!q) return true
    return sokTekst(it).toLowerCase().includes(q)
  })

  const tomTekst =
    fane === 'kjop'
      ? 'Ingen kjøpssamtaler.'
      : fane === 'salg'
        ? 'Ingen salgssamtaler.'
        : 'Ingen meldinger ennå.'

  return (
    <div className="flex h-full flex-col">
      {/* Tittel + filter */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <h1 className="text-foreground text-xl font-bold tracking-tight">Innboks</h1>
        <Tabs value={fane} onValueChange={(v) => setFane(v as Fane)}>
          <TabsList className="h-8 rounded-lg">
            <TabsTrigger
              value="alle"
              className="rounded-md px-3 text-xs tracking-normal normal-case"
            >
              Alle
            </TabsTrigger>
            <TabsTrigger
              value="kjop"
              className="rounded-md px-3 text-xs tracking-normal normal-case"
            >
              Kjøp
            </TabsTrigger>
            <TabsTrigger
              value="salg"
              className="rounded-md px-3 text-xs tracking-normal normal-case"
            >
              Salg
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Søk */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={sok}
            onChange={(e) => setSok(e.target.value)}
            placeholder="Søk"
            className="pl-9"
          />
        </div>
      </div>

      {/* Liste */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-2 px-4 pb-4">
          {synlige.length === 0 ? (
            <p className="text-muted-foreground px-2 py-10 text-center text-sm">{tomTekst}</p>
          ) : (
            synlige.map((it) => {
              const active =
                it.type === 'salg'
                  ? it.listingId === activeListingId && activeMed === null
                  : it.listingId === activeListingId && it.motpartId === activeMed
              return (
                <Link
                  key={
                    it.type === 'salg'
                      ? `salg:${it.listingId}`
                      : `kjop:${it.listingId}:${it.motpartId}`
                  }
                  href={href(it)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                    active
                      ? 'border-foreground/25 bg-muted'
                      : 'border-border bg-card hover:bg-muted/50'
                  )}
                >
                  {/* Thumbnail */}
                  <div className="bg-muted relative size-11 shrink-0 overflow-hidden rounded-md">
                    {it.bilde ? (
                      <img
                        src={it.bilde}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageOff className="text-foreground/20 size-4" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-foreground flex min-w-0 items-center gap-1.5 truncate text-sm font-semibold">
                        <span className="truncate">{it.tittel}</span>
                        {it.solgt && (
                          <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px]">
                            Solgt
                          </Badge>
                        )}
                      </p>
                      <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                        {relativTid(it.sistAktiv)}
                      </span>
                    </div>

                    {it.type === 'salg' ? (
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-muted-foreground truncate text-xs">
                          {it.antallSamtaler} {it.antallSamtaler === 1 ? 'samtale' : 'samtaler'}
                        </p>
                        {it.ulest > 0 && (
                          <span className="bg-primary text-primary-foreground flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold tabular-nums">
                            {it.ulest > 99 ? '99+' : it.ulest}
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-foreground/80 truncate text-xs font-medium">
                            {it.motpartNavn}
                          </span>
                          {it.ulest > 0 && (
                            <span className="bg-primary size-2 shrink-0 rounded-full" />
                          )}
                        </div>
                        <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                          {it.sisteTekst}
                        </p>
                      </>
                    )}
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
