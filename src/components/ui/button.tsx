import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:
          'bg-highlight-btn text-foreground dark:text-[#1d1d1d] hover:opacity-90 shadow-[0_2px_6px_rgba(0,0,0,0.10)]',
        primary:
          'bg-primary-btn text-primary-btn-fg shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:opacity-90',
        outline:
          'border border-border/70 bg-background text-foreground hover:bg-muted hover:border-border',
        ghost: 'text-foreground hover:bg-muted',
        destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-[0_2px_6px_rgba(0,0,0,0.12)]',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-11 px-7',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
