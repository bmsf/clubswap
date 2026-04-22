'use client'

import { useTransition, useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { searchShafts, type ShaftResult } from '@/app/actions/searchShafts'
import { XMarkIcon } from '@heroicons/react/16/solid'
import { cn } from '@/lib/utils'

export interface SelectedShaft {
  id: string
  brand: string
  model: string
  category: string
}

interface Props {
  category: string
  placeholder?: string
  value: SelectedShaft | null
  onChange: (val: SelectedShaft | null) => void
}

export function SkaftSokDb({ category, placeholder, value, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ShaftResult[]>([])
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
        const data = await searchShafts(q, category)
        setResults(data)
        setOpen(true)
      })
    }, 250)
  }

  function handleSelect(r: ShaftResult) {
    onChange({ id: r.id, brand: r.brand, model: r.model, category: r.category })
    setQuery('')
    setOpen(false)
    setResults([])
  }

  if (value) {
    return (
      <div className="bg-muted flex items-center justify-between rounded-xl px-4 py-3">
        <span className="text-foreground text-sm font-medium">
          {value.brand} {value.model}
        </span>
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
        placeholder={placeholder ?? 'Søk etter skaft…'}
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
              </button>
            ))
          ) : (
            <div className="text-muted-foreground px-4 py-3 text-sm">Ingen treff</div>
          )}
        </div>
      )}
    </div>
  )
}
