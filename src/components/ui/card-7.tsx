'use client'

import * as React from 'react'
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
}

export function ListingCard({
  className,
  imageUrl,
  name,
  brand,
  condition: _condition,
  price,
  location,
  posted,
  actions,
  ...props
}: ListingCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [tiltStyle, setTiltStyle] = React.useState<React.CSSProperties>({})

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top
    const rotateX = ((y - height / 2) / (height / 2)) * -5
    const rotateY = ((x - width / 2) / (width / 2)) * 5
    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    })
  }

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease-in-out',
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className={cn('group cursor-pointer overflow-hidden rounded-xl transform-3d', className)}
      {...props}
    >
      {/* Image area — landscape 4/3 */}
      <div className="bg-muted relative aspect-4/3 w-full overflow-hidden rounded-xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 h-full w-full transform-[translateZ(-10px)_scale(1.08)] object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex transform-[translateZ(-10px)_scale(1.08)] items-center justify-center">
            <svg
              width="36"
              height="36"
              viewBox="0 0 32 32"
              fill="none"
              className="text-muted-foreground/30"
              aria-hidden="true"
            >
              <rect x="15" y="2" width="2" height="14" rx="1" fill="currentColor" />
              <line
                x1="16"
                y1="16"
                x2="24"
                y2="26"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <rect x="20" y="24" width="8" height="5" rx="1.5" fill="currentColor" />
            </svg>
          </div>
        )}
      </div>

      {/* Text content — below the image */}
      <div className="flex transform-[translateZ(20px)] items-start justify-between gap-2 px-0.5 pt-2.5">
        <div className="min-w-0">
          <p className="text-muted-foreground mb-0.5 text-[11px] leading-none">{brand}</p>
          <p className="text-foreground truncate text-sm leading-snug font-semibold">{name}</p>
          {(location || posted) && (
            <p className="text-muted-foreground mt-0.5 text-[11px]">
              {[location, posted].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <p className="text-foreground shrink-0 pt-0.5 font-mono text-sm font-bold">
          {price.toLocaleString('nb-NO')} kr
        </p>
      </div>

      {/* Optional action slot (e.g. Rediger / Slett for mine annonser) */}
      {actions && <div className="mt-2.5 transform-[translateZ(20px)]">{actions}</div>}
    </div>
  )
}
