'use client'

import * as React from 'react'
import Link from 'next/link'
import { ImageOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ListingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl?: string
  name: string
  brand: string
  condition: string
  price: number
  location?: string | null
  posted?: string
  actions?: React.ReactNode
  href?: string
}

export function ListingCard({
  className,
  imageUrl,
  name,
  brand,
  condition,
  price,
  location,
  posted,
  actions,
  href,
  ...props
}: ListingCardProps) {
  const Wrapper = href ? Link : 'div'

  return (
    <motion.div
      whileHover={{
        scale: 1.025,
        boxShadow: '0px 12px 32px -6px hsl(var(--foreground) / 0.14)',
        transition: { type: 'spring', stiffness: 320, damping: 22 },
      }}
      className={cn(
        'group border-border/50 bg-card text-card-foreground flex cursor-pointer flex-col overflow-hidden rounded-2xl border shadow-sm',
        className
      )}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      <Wrapper href={href as string} className="flex flex-1 flex-col">
        {/* Image */}
        <div className="bg-muted relative aspect-3/2 w-full overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff className="text-foreground/20 h-8 w-8" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-lg leading-tight font-bold">{name}</p>
            </div>
            {condition && (
              <span className="border-border text-muted-foreground shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                {condition}
              </span>
            )}
          </div>

          {/* Subtitle */}
          <p className="text-muted-foreground text-sm">
            {[brand, location].filter(Boolean).join(' · ')}
            {posted && <> &bull; {posted}</>}
          </p>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price + CTA */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-lg font-bold tabular-nums">
              {price.toLocaleString('nb-NO')}{' '}
              <span className="text-muted-foreground text-sm font-normal">kr</span>
            </p>
            {actions && <div>{actions}</div>}
          </div>
        </div>
      </Wrapper>
    </motion.div>
  )
}
