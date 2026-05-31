'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

type Fane = 'alle' | 'uleste'

export function SamtaleListe({
  samtaler,
  activeKey,
}: {
  samtaler: SamtaleListeItem[]
  activeKey: string | null
}) {
  const [fane, setFane] = useState<Fane>('alle')
  const [sok, setSok] = useState('')

  const q = sok.trim().toLowerCase()
  const synlige = samtaler.filter((s) => {
    if (fane === 'uleste' && s.ulest === 0) return false
    if (!q) return true
    return `${s.motpartNavn} ${s.annonseTittel} ${s.sisteTekst}`.toLowerCase().includes(q)
  })

  return (
    <div className="flex h-full flex-col">
      {/* Tittel + Alle/Uleste */}
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
              value="uleste"
              className="rounded-md px-3 text-xs tracking-normal normal-case"
            >
              Uleste
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
            <p className="text-muted-foreground px-2 py-10 text-center text-sm">
              {fane === 'uleste' ? 'Ingen uleste samtaler.' : 'Ingen samtaler ennå.'}
            </p>
          ) : (
            synlige.map((s) => {
              const active = s.key === activeKey
              return (
                <Link
                  key={s.key}
                  href={`/meldinger?annonse=${s.listingId}&med=${s.motpartId}`}
                  className={cn(
                    'block rounded-lg border p-3 text-left transition-colors',
                    active
                      ? 'border-foreground/25 bg-muted'
                      : 'border-border bg-card hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-foreground truncate text-sm font-semibold">
                        {s.motpartNavn}
                      </span>
                      {s.ulest > 0 && <span className="bg-primary size-2 shrink-0 rounded-full" />}
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {relativTid(s.sistAktiv)}
                    </span>
                  </div>
                  <p className="text-foreground/80 mt-1 flex items-center gap-1.5 truncate text-xs font-medium">
                    <span className="truncate">{s.annonseTittel}</span>
                    {s.solgt && (
                      <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px]">
                        Solgt
                      </Badge>
                    )}
                  </p>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{s.sisteTekst}</p>
                </Link>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
