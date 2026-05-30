import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 h-12 w-full rounded-2xl border border-neutral-950/10 bg-white px-4 text-sm transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Input }
