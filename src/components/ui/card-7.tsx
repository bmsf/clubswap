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
  price: number
  location?: string | null
  posted?: string
  clubsLabel?: string
  actions?: React.ReactNode
  href?: string
  flat?: boolean
  distanceKm?: number
}

export function ListingCard({
  className,
  imageUrl,
  name,
  brand,
  price,
  location,
  posted,
  clubsLabel,
  actions,
  href,
  flat,
  distanceKm,
  ...props
}: ListingCardProps) {
  const Wrapper = href ? Link : 'div'

  return (
    <motion.div
      className={cn(
        'group text-card-foreground flex cursor-pointer flex-col overflow-hidden',
        flat ? 'bg-transparent' : 'bg-card rounded-xl shadow-sm',
        className
      )}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      <Wrapper href={href as string} className="flex flex-1 flex-col">
        {/* Image */}
        <div
          className={cn(
            'bg-muted relative aspect-square overflow-hidden',
            flat ? 'm-2 rounded-sm' : 'w-full rounded-t-xl'
          )}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff className="text-foreground/20 size-8" />
            </div>
          )}
          <div className="bg-foreground/0 group-hover:bg-foreground/10 absolute inset-0 transition-colors duration-200" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-3">
          {/* Title */}
          <p className="truncate text-sm leading-snug font-medium">{name}</p>

          {/* Subtitle */}
          <p className="text-muted-foreground text-[10px] leading-snug">
            {[brand, location, posted].filter(Boolean).join(' · ')}
          </p>

          {distanceKm != null && (
            <p className="text-foreground/70 text-[10px] leading-snug font-medium">
              {distanceKm} km unna
            </p>
          )}

          {clubsLabel && (
            <p className="text-foreground/70 text-[10px] leading-snug font-medium">
              Jern: {clubsLabel}
            </p>
          )}

          {/* Price + CTA */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <p className="tabnum text-sm font-semibold">
              {price.toLocaleString('nb-NO')}{' '}
              <span className="text-muted-foreground font-normal">kr</span>
            </p>
            {actions && <div>{actions}</div>}
          </div>
        </div>
      </Wrapper>
    </motion.div>
  )
}
