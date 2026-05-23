'use client'

import { useState, useTransition, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { searchModeller, type ModellGruppe } from '@/app/actions/searchModeller'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import { cn } from '@/lib/utils'

export interface ValgtModell {
  brand: string
  model: string
  year: number | null
  category: string
  equipmentId: string
}

const KATEGORI_LABEL: Record<string, string> = {
  driver: 'Driver',
  fairway_wood: 'Fairway wood',
  fairway: 'Fairway wood',
  hybrid: 'Hybrid',
  iron_set: 'Jernsett',
  iron: 'Jern',
  single_iron: 'Enkeltjern',
  irons: 'Jernsett',
  jernsett: 'Jernsett',
  wedge: 'Wedge',
  putter: 'Putter',
  golf_bag: 'Bag',
  bag: 'Bag',
  stand_bag: 'Stand bag',
  cart_bag: 'Cart bag',
  golf_shoes: 'Sko',
  shoes: 'Sko',
  sko: 'Sko',
  rangefinder: 'Avstandsmåler',
  baller: 'Baller',
  other: 'Annet',
  annet: 'Annet',
}

const KATEGORI_SORT_ORDER = [
  'driver',
  'fairway_wood',
  'hybrid',
  'jernsett',
  'wedge',
  'putter',
  'stand_bag',
  'cart_bag',
  'sko',
  'baller',
  'rangefinder',
  'annet',
]

interface KategoriEntry {
  gruppe: ModellGruppe
  equipmentId: string
  count: number
}

function grupperEtterKategori(resultater: ModellGruppe[]): Map<string, KategoriEntry[]> {
  const map = new Map<string, KategoriEntry[]>()
  for (const gruppe of resultater) {
    for (const v of gruppe.variants) {
      if (!map.has(v.category)) map.set(v.category, [])
      map.get(v.category)!.push({ gruppe, equipmentId: v.equipmentId, count: v.count })
    }
  }
  // Sort categories by preferred order
  const sorted = new Map<string, KategoriEntry[]>()
  const knownOrder = KATEGORI_SORT_ORDER.filter((k) => map.has(k))
  const rest = [...map.keys()].filter((k) => !KATEGORI_SORT_ORDER.includes(k))
  for (const k of [...knownOrder, ...rest]) sorted.set(k, map.get(k)!)
  return sorted
}

interface Props {
  value: ValgtModell | null
  onChange: (val: ValgtModell | null) => void
  onManuell: () => void
}

export function ModellVelger({ value, onChange, onManuell }: Props) {
  const [query, setQuery] = useState('')
  const [resultater, setResultater] = useState<ModellGruppe[]>([])
  const [harSokt, setHarSokt] = useState(false)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.trim().length < 2) {
      setResultater([])
      setHarSokt(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const data = await searchModeller(q)
        setResultater(data)
        setHarSokt(true)
      })
    }, 300)
  }

  function velgVariant(gruppe: ModellGruppe, category: string, equipmentId: string) {
    onChange({ brand: gruppe.brand, model: gruppe.model, year: gruppe.year, category, equipmentId })
  }

  if (value) {
    return (
      <div className="space-y-3">
        <div className="bg-muted flex items-center justify-between rounded-xl px-4 py-3.5">
          <div>
            <p className="text-foreground text-sm font-semibold">
              {value.brand} {value.model}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {KATEGORI_LABEL[value.category] ?? value.category}
              {value.year ? ` · ${value.year}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-muted-foreground hover:text-foreground ml-3 cursor-pointer rounded-lg p-1.5 transition-colors"
            aria-label="Fjern valg"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="text-muted-foreground text-xs">
          Ser feil?{' '}
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setQuery('')
              setResultater([])
              setHarSokt(false)
            }}
            className="text-foreground cursor-pointer underline underline-offset-2"
          >
            Søk på nytt
          </button>{' '}
          eller{' '}
          <button
            type="button"
            onClick={onManuell}
            className="text-foreground cursor-pointer underline underline-offset-2"
          >
            fyll inn manuelt
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <MagnifyingGlassIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={handleChange}
          placeholder="Søk etter modell, f.eks. Stealth 2 eller Pro V1"
          className={cn('pl-9', isPending && 'opacity-60')}
          autoFocus
        />
        {isPending && (
          <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
            …
          </span>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {harSokt && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {resultater.length === 0 ? (
              <div className="border-border rounded-xl border border-dashed px-4 py-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Ingen modeller funnet for &ldquo;{query}&rdquo;
                </p>
              </div>
            ) : (
              <Accordion multiple={false} className="w-full">
                {[...grupperEtterKategori(resultater)].map(([kategori, entries]) => (
                  <AccordionItem key={kategori} value={kategori}>
                    <AccordionTrigger className="text-sm">
                      <span>
                        {KATEGORI_LABEL[kategori] ?? kategori}
                        <span className="text-muted-foreground ml-1.5 font-normal">
                          ({entries.length})
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-0.5 pt-1 pb-2">
                        {entries.map(({ gruppe, equipmentId, count }) => (
                          <button
                            key={equipmentId}
                            type="button"
                            onClick={() => velgVariant(gruppe, kategori, equipmentId)}
                            className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left transition-colors"
                          >
                            <span className="text-sm">
                              {gruppe.brand} {gruppe.model}
                              {gruppe.year ? (
                                <span className="text-muted-foreground ml-1.5 text-xs">
                                  {gruppe.year}
                                </span>
                              ) : null}
                            </span>
                            {count > 0 && (
                              <span className="text-muted-foreground ml-3 shrink-0 text-xs tabular-nums">
                                {count === 1 ? '1 aktiv' : `${count} aktive`}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            <div className="border-border border-t pt-3">
              <button
                type="button"
                onClick={onManuell}
                className="text-muted-foreground hover:text-foreground cursor-pointer text-sm transition-colors"
              >
                Finner du ikke modellen din?{' '}
                <span className="text-foreground underline underline-offset-2">
                  Legg inn manuelt
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!harSokt && (
        <p className="text-muted-foreground text-xs">
          Skriv minst 2 tegn for å søke.{' '}
          <button
            type="button"
            onClick={onManuell}
            className="text-foreground cursor-pointer underline underline-offset-2"
          >
            Gå til manuell registrering
          </button>
        </p>
      )}
    </div>
  )
}
