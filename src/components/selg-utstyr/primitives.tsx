'use client'

import { useState, useRef, useEffect } from 'react'
import { SparklesIcon } from '@heroicons/react/16/solid'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { KJENTE_SKAFT } from './constants'

// ── AiBadge ───────────────────────────────────────────────────────────────────

export function AiBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
      <SparklesIcon className="size-2.5" />
      Foreslått av AI
    </span>
  )
}

// ── Felt ──────────────────────────────────────────────────────────────────────

export function Felt({
  label,
  required,
  error,
  aiBadge,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  aiBadge?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn(aiBadge && 'border-l-2 border-amber-400 pl-3')}>
      <Label className="mb-1.5 flex items-center gap-1.5">
        {label}
        {required && <span className="text-red-500">*</span>}
        {aiBadge && <AiBadge />}
      </Label>
      {error && <p className="mb-1.5 text-xs text-red-500">{error}</p>}
      {children}
    </div>
  )
}

// ── SkaftSok ──────────────────────────────────────────────────────────────────

export function SkaftSok({
  value,
  skaftType,
  onChange,
}: {
  value: string
  skaftType?: 'steel' | 'graphite' | 'none'
  onChange: (v: string) => void
}) {
  const [vis, setVis] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const kandidater = KJENTE_SKAFT.filter(
    (s) =>
      (skaftType === undefined || skaftType === 'none' || s.type === skaftType) &&
      (value.trim() === '' || s.navn.toLowerCase().includes(value.toLowerCase()))
  ).slice(0, 7)

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    },
    []
  )

  return (
    <div className="relative">
      <Input
        type="text"
        value={value}
        placeholder="f.eks. Fujikura Ventus Blue"
        onChange={(e) => {
          onChange(e.target.value)
          if (debounceRef.current) clearTimeout(debounceRef.current)
          debounceRef.current = setTimeout(() => setVis(true), 100)
        }}
        onFocus={() => setVis(true)}
        onBlur={() => setTimeout(() => setVis(false), 150)}
      />
      {vis && kandidater.length > 0 && (
        <div className="bg-background absolute top-full right-0 left-0 z-10 mt-1 overflow-hidden rounded-xl border border-neutral-950/10 shadow-lg">
          {kandidater.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => {
                onChange(s.navn)
                setVis(false)
              }}
              className="hover:bg-muted flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-sm transition-colors"
            >
              <span className="text-foreground">{s.navn}</span>
              <span className="text-muted-foreground text-xs capitalize">
                {s.type === 'steel' ? 'Stål' : 'Grafitt'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── PillToggle ────────────────────────────────────────────────────────────────

export function PillToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T | null | undefined
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'focus:border-foreground/50 h-11 cursor-pointer rounded-xl border border-neutral-950/10 px-4 text-sm transition-colors outline-none',
            value === opt.value
              ? 'border-foreground bg-foreground/8 text-foreground font-medium'
              : 'hover:border-foreground/40'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
