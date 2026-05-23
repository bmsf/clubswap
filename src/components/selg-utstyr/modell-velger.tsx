'use client'

import { useState, useTransition, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
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
  fairway_wood: 'Fairway',
  fairway: 'Fairway',
  hybrid: 'Hybrid',
  iron_set: 'Jernsett',
  iron: 'Jern',
  single_iron: 'Enkeltjern',
  irons: 'Jernsett',
  wedge: 'Wedge',
  putter: 'Putter',
  golf_bag: 'Bag',
  bag: 'Bag',
  golf_shoes: 'Sko',
  shoes: 'Sko',
  rangefinder: 'Avstandsmåler',
  other: 'Annet',
  annet: 'Annet',
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
              resultater.map((gruppe) => (
                <div key={`${gruppe.brand}__${gruppe.model}`}>
                  <p className="text-muted-foreground mb-2 text-xs font-medium">
                    {gruppe.brand} {gruppe.model}
                    {gruppe.year ? <span className="ml-1.5 font-mono">{gruppe.year}</span> : null}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {gruppe.variants.map((v) => (
                      <button
                        key={v.equipmentId}
                        type="button"
                        onClick={() => velgVariant(gruppe, v.category, v.equipmentId)}
                        className="border-border bg-background hover:border-foreground/40 hover:bg-muted flex cursor-pointer flex-col items-start rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.98]"
                      >
                        <span className="text-sm font-medium">
                          {KATEGORI_LABEL[v.category] ?? v.category}
                        </span>
                        <span className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                          {v.count === 0
                            ? 'Ingen aktive'
                            : v.count === 1
                              ? '1 aktiv'
                              : `${v.count} aktive`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
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
