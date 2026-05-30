'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

export type AnnonseTab = 'aktiv' | 'paabegynt' | 'ferdig'

const TABS: { value: AnnonseTab; label: string }[] = [
  { value: 'aktiv', label: 'Aktiv' },
  { value: 'paabegynt', label: 'Påbegynt' },
  { value: 'ferdig', label: 'Ferdig' },
]

export function AnnonseStatusFilter({
  active,
  counts,
}: {
  active: AnnonseTab
  counts: Record<AnnonseTab, number>
}) {
  return (
    <div className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]">
      {TABS.map((tab) => {
        const isActive = tab.value === active
        return (
          <Link
            key={tab.value}
            href={tab.value === 'aktiv' ? '/annonser' : `/annonser?status=${tab.value}`}
            className={cn(
              'inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-md border border-transparent px-3 text-sm font-medium transition-colors',
              isActive ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground'
            )}
          >
            {tab.label}
            <span className="bg-foreground/10 text-foreground/70 rounded-full px-1.5 text-[11px] leading-[1.4] tabular-nums">
              {counts[tab.value]}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
