'use client'

import { useState, useTransition, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { searchShafts, type ShaftResultat } from '@/app/actions/searchShafts'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import { cn } from '@/lib/utils'

export interface ValgtSkaft {
  brand: string
  model: string
  shaftId?: string
}

interface Props {
  value: ValgtSkaft | null
  onChange: (val: ValgtSkaft | null) => void
  shaftCategory?: string
}

export function SkaftVelger({ value, onChange, shaftCategory }: Props) {
  const [query, setQuery] = useState('')
  const [resultater, setResultater] = useState<ShaftResultat[]>([])
  const [harSokt, setHarSokt] = useState(false)
  const [manuell, setManuell] = useState(false)
  const [manuellBrand, setManuellBrand] = useState('')
  const [manuellModell, setManuellModell] = useState('')
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
        const data = await searchShafts(q, shaftCategory)
        setResultater(data)
        setHarSokt(true)
      })
    }, 300)
  }

  function velgSkaft(r: ShaftResultat) {
    onChange({ brand: r.brand, model: r.model, shaftId: r.id })
  }

  function lagreManuell() {
    if (manuellBrand.trim() && manuellModell.trim()) {
      onChange({ brand: manuellBrand.trim(), model: manuellModell.trim() })
    }
  }

  function tilbakeTilSok() {
    setManuell(false)
    setManuellBrand('')
    setManuellModell('')
  }

  if (value) {
    return (
      <div className="space-y-3">
        <div className="bg-muted flex items-center justify-between rounded-xl px-4 py-3.5">
          <div>
            <p className="text-foreground text-sm font-semibold">
              {value.brand} {value.model}
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
      </div>
    )
  }

  if (manuell) {
    return (
      <div className="space-y-3">
        <Input
          value={manuellBrand}
          onChange={(e) => setManuellBrand(e.target.value)}
          placeholder="Merke, f.eks. Fujikura"
          autoFocus
        />
        <Input
          value={manuellModell}
          onChange={(e) => setManuellModell(e.target.value)}
          placeholder="Modell, f.eks. Ventus Blue"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={lagreManuell}
            disabled={!manuellBrand.trim() || !manuellModell.trim()}
            className="flex-1"
          >
            Bruk dette skaftet
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={tilbakeTilSok}>
            Tilbake
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <MagnifyingGlassIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={handleChange}
          placeholder="Søk etter skaft, f.eks. Ventus Blue eller Dynamic Gold"
          className={cn('pl-9', isPending && 'opacity-60')}
        />
        {isPending && (
          <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
            …
          </span>
        )}
      </div>

      <AnimatePresence>
        {harSokt && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="space-y-1"
          >
            {resultater.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-950/10 px-4 py-5 text-center">
                <p className="text-muted-foreground text-sm">
                  Ingen skaft funnet for &ldquo;{query}&rdquo;
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-neutral-950/10">
                {resultater.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => velgSkaft(r)}
                    className="hover:bg-muted flex w-full cursor-pointer items-center px-4 py-2.5 text-left transition-colors"
                  >
                    <span className="text-sm">
                      <span className="font-medium">{r.brand}</span>{' '}
                      <span className="text-muted-foreground">{r.model}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setManuell(true)}
              className="text-muted-foreground hover:text-foreground cursor-pointer text-sm transition-colors"
            >
              Finner du ikke skaftet?{' '}
              <span className="text-foreground underline underline-offset-2">Legg inn manuelt</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!harSokt && (
        <p className="text-muted-foreground text-xs">
          Skriv minst 2 tegn for å søke.{' '}
          <button
            type="button"
            onClick={() => setManuell(true)}
            className="text-foreground cursor-pointer underline underline-offset-2"
          >
            Legg inn manuelt
          </button>
        </p>
      )}
    </div>
  )
}
