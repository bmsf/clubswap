import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // text-base (16px) på mobil hindrer iOS-zoom ved fokus; md:text-sm på desktop.
        'text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 border-border w-full resize-none rounded-xl border bg-transparent px-4 py-3 text-base transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
