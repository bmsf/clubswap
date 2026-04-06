import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 w-full resize-none rounded-xl border bg-transparent px-4 py-3 text-sm transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
