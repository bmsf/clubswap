import { Sparkles } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// ── AiBadge ───────────────────────────────────────────────────────────────────

export function AiBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">
      <Sparkles className="h-2.5 w-2.5" />
      AI
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
    <div>
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
            'border-border h-10 cursor-pointer rounded-xl border px-4 text-sm transition-colors',
            value === opt.value
              ? 'border-primary bg-primary/8 text-primary font-medium'
              : 'hover:border-primary/40'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
