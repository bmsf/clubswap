import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 h-11 w-full rounded-xl border bg-transparent px-4 text-sm transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Input }
