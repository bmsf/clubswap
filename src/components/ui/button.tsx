import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[calc(infinity*1px-1px)] text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:
          'bg-white text-neutral-950 shadow-sm ring-1 ring-neutral-950/10 hover:bg-neutral-50',
        primary: 'bg-neutral-950 text-white shadow-lg ring-1 ring-neutral-950 hover:bg-neutral-800',
        outline:
          'bg-white text-neutral-950 shadow-sm ring-1 ring-neutral-950/10 hover:bg-neutral-50 hover:ring-neutral-950/15',
        ghost: 'text-neutral-950 hover:bg-neutral-100',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        link: 'text-neutral-950 underline-offset-4 hover:underline',
      },
      size: {
        default: 'px-3 py-[3px]',
        sm: 'px-2.5 py-[1px] text-xs',
        lg: 'px-4 py-[5px] text-base',
        icon: 'size-9',
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
