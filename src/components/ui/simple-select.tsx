'use client'

import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

type Option = string | { value: string; label: string }

interface SimpleSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function SimpleSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Velg...',
  className,
  disabled,
}: SimpleSelectProps) {
  const normalized = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))

  const currentLabel = normalized.find((o) => o.value === value)?.label

  return (
    <Select
      value={value}
      onValueChange={(v) => v != null && onValueChange?.(v)}
      disabled={disabled}
    >
      <SelectTrigger className={cn('w-full', className)}>
        <span className={currentLabel ? 'text-foreground' : 'text-muted-foreground'}>
          {currentLabel ?? placeholder}
        </span>
      </SelectTrigger>
      <SelectContent>
        {normalized.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
