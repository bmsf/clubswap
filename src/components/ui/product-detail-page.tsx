'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, Heart, Share2, Send, ImageOff, MapPin, Truck, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const CONDITION_LABELS: Record<string, string> = {
  mint: 'Ny',
  very_good: 'Meget god',
  good: 'God',
  fair: 'Akseptabel',
}

const CONDITION_CLASSES: Record<string, string> = {
  mint: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  very_good: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  good: 'bg-primary/10 text-primary',
  fair: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const CATEGORY_LABELS: Record<string, string> = {
  driver: 'Driver',
  mini_driver: 'Mini driver',
  fairway_wood: 'Fairway',
  fairway: 'Fairway',
  hybrid: 'Hybrid',
  utility_iron: 'Utilityjern',
  irons: 'Jernsett',
  jernsett: 'Jernsett',
  iron_set: 'Jernsett',
  'enkelt-jern': 'Enkeltjern',
  iron: 'Enkeltjern',
  wedge: 'Wedge',
  putter: 'Putter',
  bag: 'Golfbag',
  stand_bag: 'Stand bag',
  cart_bag: 'Cart bag',
  tour_bag: 'Tour bag',
  sko: 'Sko',
  shoes: 'Sko',
  klaer: 'Klær',
  clothing: 'Klær',
  hansker: 'Hansker',
  baller: 'Baller',
  rangefinder: 'Avstandsmåler',
  gps: 'GPS-klokke',
  elektronikk: 'Elektronikk',
  accessories: 'Tilbehør',
  annet: 'Annet',
  other: 'Annet',
}

const SHAFT_FLEX_LABELS: Record<string, string> = {
  ladies: 'Ladies',
  senior: 'Senior',
  regular: 'Regular',
  stiff: 'Stiff',
  x_stiff: 'X-Stiff',
}

const SHAFT_MATERIAL_LABELS: Record<string, string> = {
  graphite: 'Grafitt',
  steel: 'Stål',
}

const HAND_LABELS: Record<string, string> = {
  right: 'Høyrehendt',
  left: 'Venstrehendt',
}

interface SpecBadge {
  label: string
}

interface Seller {
  id: string
  name: string
  username: string
  avatarUrl?: string | null
  locationCity?: string | null
  listingCount?: number
}

export interface ListingDetailProps {
  id: string
  title: string
  merke: string
  modell: string
  kategori: string
  tilstand: string
  pris: number
  selgesFra?: string | null
  tilbyrFrakt: boolean
  bilder: string[]
  skadebeskrivelse?: string | null
  aarsmodell?: string | null
  shaftFlex?: string | null
  skaftMateriale?: string | null
  loft?: string | null
  haandighet?: string | null
  skaftModell?: string | null
  seller: Seller
}

export function ProductDetailPage({
  merke,
  modell,
  kategori,
  tilstand,
  pris,
  selgesFra,
  tilbyrFrakt,
  bilder,
  skadebeskrivelse,
  aarsmodell,
  shaftFlex,
  skaftMateriale,
  loft,
  haandighet,
  skaftModell,
  seller,
}: ListingDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

  const specBadges: SpecBadge[] = [
    { label: CATEGORY_LABELS[kategori] ?? kategori },
    ...(aarsmodell ? [{ label: aarsmodell }] : []),
    ...(shaftFlex ? [{ label: SHAFT_FLEX_LABELS[shaftFlex] ?? shaftFlex }] : []),
    ...(skaftMateriale ? [{ label: SHAFT_MATERIAL_LABELS[skaftMateriale] ?? skaftMateriale }] : []),
    ...(loft ? [{ label: `${loft}°` }] : []),
    ...(haandighet ? [{ label: HAND_LABELS[haandighet] ?? haandighet }] : []),
    ...(skaftModell ? [{ label: skaftModell }] : []),
  ]

  const conditionLabel = CONDITION_LABELS[tilstand] ?? tilstand
  const conditionClass = CONDITION_CLASSES[tilstand] ?? 'bg-secondary text-secondary-foreground'

  const breadcrumbs = [
    { label: 'Markedet', href: '/utforsk' },
    { label: CATEGORY_LABELS[kategori] ?? kategori, href: `/utforsk` },
    { label: `${merke} ${modell}`, href: '#' },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      {/* Breadcrumbs */}
      <nav
        aria-label="Navigasjonsbane"
        className="text-muted-foreground mb-4 flex items-center text-sm"
      >
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            <Link href={item.href} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
            {index < breadcrumbs.length - 1 && <ChevronRight className="mx-1 h-4 w-4 shrink-0" />}
          </React.Fragment>
        ))}
      </nav>

      {/* Action buttons row */}
      <div className="mb-6 flex items-center justify-end gap-2">
        <Button variant="ghost" size="icon" aria-label="Lagre annonse">
          <Heart className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Del annonse">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Main grid */}
      <main className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2">
        {/* Image gallery */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-muted relative aspect-4/5 w-full overflow-hidden rounded-xl border"
            >
              {bilder.length > 0 ? (
                <img
                  src={bilder[currentImageIndex]}
                  alt={`${merke} ${modell} – bilde ${currentImageIndex + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageOff className="text-muted-foreground/30 h-12 w-12" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Dot navigation */}
          {bilder.length > 1 && (
            <div className="flex justify-center gap-2">
              {bilder.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    currentImageIndex === index
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                  aria-label={`Vis bilde ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail strip */}
          {bilder.length > 1 && (
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {bilder.map((src, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                    currentImageIndex === index ? 'border-primary' : 'border-transparent'
                  )}
                >
                  <img
                    src={src}
                    alt={`Miniatyrbilde ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {merke} {modell}
            </h1>
            <span
              className={cn(
                'pill mt-1 shrink-0 rounded-full px-3 py-1 text-xs font-semibold',
                conditionClass
              )}
            >
              {conditionLabel}
            </span>
          </div>

          <div className="mt-3">
            <span className="text-4xl font-bold">{pris.toLocaleString('nb-NO')} kr</span>
            {tilbyrFrakt && (
              <span className="text-muted-foreground ml-2 inline-flex items-center gap-1 text-sm">
                <Truck className="h-3.5 w-3.5" />
                Frakt tilgjengelig
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="my-6 flex gap-2">
            <Button size="lg" className="flex-1 gap-2">
              <Send className="h-5 w-5" />
              Kontakt selger
            </Button>
          </div>

          {/* Spec badges */}
          {specBadges.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {specBadges.map((badge, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="gap-1.5 px-3 py-1 text-sm font-normal"
                >
                  <Tag className="h-3.5 w-3.5" />
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Location */}
          {selgesFra && (
            <div className="text-muted-foreground mb-4 flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{selgesFra}</span>
            </div>
          )}

          {/* Description */}
          {skadebeskrivelse && (
            <p className="text-muted-foreground text-sm leading-relaxed">{skadebeskrivelse}</p>
          )}

          {/* Seller */}
          <div className="mt-8 border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  {seller.avatarUrl && <AvatarImage src={seller.avatarUrl} alt={seller.name} />}
                  <AvatarFallback>
                    {(seller.name || seller.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{seller.name || seller.username}</p>
                  {seller.locationCity && (
                    <p className="text-muted-foreground text-xs">{seller.locationCity}</p>
                  )}
                </div>
              </div>
              <Button variant="link" className="text-primary" asChild>
                <Link href={`/selgere/${seller.username}`}>Alle annonser &rarr;</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
