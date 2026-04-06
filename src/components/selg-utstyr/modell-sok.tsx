'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { type Category, KJENTE_MODELLER } from './constants'

export function ModellSok({
  kategori,
  onVelg,
}: {
  kategori: Category
  onVelg: (brand: string, model: string, year?: number) => void
}) {
  const [sokeTekst, setSokeTekst] = useState('')
  const [resultater, setResultater] = useState<typeof KJENTE_MODELLER>([])
  const [vis, setVis] = useState(false)
  const [manuell, setManuell] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sok = useCallback(
    (tekst: string) => {
      if (!tekst.trim()) {
        setResultater([])
        setVis(false)
        return
      }
      const q = tekst.toLowerCase()
      const treff = KJENTE_MODELLER.filter(
        (m) =>
          m.category === kategori &&
          (`${m.brand} ${m.model}`.toLowerCase().includes(q) ||
            m.brand.toLowerCase().includes(q) ||
            m.model.toLowerCase().includes(q))
      ).slice(0, 8)
      setResultater(treff)
      setVis(true)
    },
    [kategori]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => sok(sokeTekst), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [sokeTekst, sok])

  if (manuell) return null

  return (
    <div className="relative">
      <Input
        type="text"
        value={sokeTekst}
        onChange={(e) => setSokeTekst(e.target.value)}
        onFocus={() => sokeTekst && setVis(true)}
        onBlur={() => setTimeout(() => setVis(false), 150)}
        placeholder="Søk etter modell, f.eks. TaylorMade Stealth 2 Driver"
      />
      {vis && (
        <div className="border-border bg-background absolute top-full right-0 left-0 z-10 mt-1 overflow-hidden rounded-xl border shadow-lg">
          {resultater.length > 0 ? (
            <>
              {resultater.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => {
                    onVelg(r.brand, r.model, r.year)
                    setSokeTekst(`${r.brand} ${r.model}`)
                    setVis(false)
                  }}
                  className="hover:bg-muted flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-sm transition-colors"
                >
                  <span>
                    <span className="text-foreground font-medium">{r.brand}</span>{' '}
                    <span className="text-muted-foreground">{r.model}</span>
                  </span>
                  {r.year && <span className="text-muted-foreground text-xs">{r.year}</span>}
                </button>
              ))}
              <button
                type="button"
                onMouseDown={() => {
                  setManuell(true)
                  setVis(false)
                }}
                className="hover:bg-muted border-border w-full cursor-pointer border-t px-4 py-2.5 text-left text-sm text-violet-600 transition-colors dark:text-violet-400"
              >
                Modellen finnes ikke i listen – legg til manuelt
              </button>
            </>
          ) : (
            <div className="px-4 py-3">
              <p className="text-muted-foreground text-sm">Ingen treff</p>
              <button
                type="button"
                onMouseDown={() => {
                  setManuell(true)
                  setVis(false)
                }}
                className="mt-1 cursor-pointer text-sm text-violet-600 dark:text-violet-400"
              >
                Legg til manuelt
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
