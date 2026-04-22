'use client'

import { useTransition, useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { searchEquipment, type EquipmentResult } from '@/app/actions/searchEquipment'
import { XMarkIcon } from '@heroicons/react/16/solid'
import { cn } from '@/lib/utils'

export interface SelectedEquipment {
  id: string
  brand: string
  model: string
  year?: number | null
  category: string
}

interface Props {
  category: string
  placeholder?: string
  value: SelectedEquipment | null
  onChange: (val: SelectedEquipment | null) => void
  onManuell?: () => void
}

export function UtstyrSok({ category, placeholder, value, onChange, onManuell }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<EquipmentResult[]>([])
  const [open, setOpen] = useState(false)

  const [isPending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const data = await searchEquipment(q, category)
        setResults(data)
        setOpen(true)
      })
    }, 250)
  }

  function handleSelect(r: EquipmentResult) {
    onChange({ id: r.id, brand: r.brand, model: r.model, year: r.year, category: r.category })
    setQuery('')
    setOpen(false)
    setResults([])
  }

  if (value) {
    return (
      <div className="bg-muted flex items-center justify-between rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-sm font-medium">
            {value.brand} {value.model}
          </span>
          {value.year && (
            <span className="text-muted-foreground font-mono text-xs">{value.year}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          aria-label="Fjern valg"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={handleChange}
        placeholder={placeholder ?? 'Søk…'}
        className={cn(isPending && 'opacity-60')}
      />
      {open && (
        <div className="border-border absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-xl border bg-white shadow-lg dark:bg-zinc-900">
          {results.length > 0 ? (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelect(r)}
                className="hover:bg-muted flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors"
              >
                <span className="text-foreground text-sm">
                  <span className="font-medium">{r.brand}</span>{' '}
                  <span className="text-muted-foreground">{r.model}</span>
                </span>
                {r.year && (
                  <span className="text-muted-foreground font-mono text-xs">{r.year}</span>
                )}
              </button>
            ))
          ) : (
            <div className="text-muted-foreground px-4 py-3 text-sm">Ingen treff</div>
          )}
        </div>
      )}
      {onManuell && (
        <button
          type="button"
          onClick={onManuell}
          className="text-muted-foreground hover:text-foreground mt-2 cursor-pointer text-xs underline-offset-2 transition-colors hover:underline"
        >
          Fyll ut manuelt
        </button>
      )}
    </div>
  )
}
