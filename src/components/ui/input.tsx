import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // text-base (16px) på mobil hindrer iOS-zoom ved fokus; md:text-sm beholder
        // desktop-utseendet (14px).
        'text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 border-border bg-card h-12 w-full rounded-2xl border px-4 text-base transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      {...props}
    />
  )
}

export { Input }
