import { ImageOff } from 'lucide-react'
import { AnnonseRadHandlinger } from '@/components/annonse-kort-handlinger'
import { cn } from '@/lib/utils'

export type AnnonseRadData = {
  id: string
  merke: string
  modell: string
  tilstand: string | null
  pris: number
  selges_fra: string | null
  bilder: unknown
  status: string
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  aktiv: { label: 'Aktiv', className: 'bg-primary text-primary-foreground' },
  paabegynt: { label: 'Påbegynt', className: 'bg-secondary text-secondary-foreground' },
  solgt: { label: 'Solgt', className: 'bg-muted text-muted-foreground' },
}

export function AnnonseRad({ annonse }: { annonse: AnnonseRadData }) {
  const bilde =
    Array.isArray(annonse.bilder) && annonse.bilder.length > 0
      ? (annonse.bilder[0] as string)
      : undefined
  const badge = STATUS_BADGE[annonse.status] ?? STATUS_BADGE.aktiv

  return (
    <div className="border-border flex flex-col gap-3 border-b py-4 sm:flex-row sm:items-center">
      {/* Thumbnail + info */}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg">
          {bilde ? (
            <img
              src={bilde}
              alt={annonse.modell}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff className="text-foreground/20 size-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-foreground truncate text-sm font-semibold">{annonse.modell}</p>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                badge.className
              )}
            >
              {badge.label}
            </span>
          </div>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {[annonse.merke, annonse.selges_fra].filter(Boolean).join(' · ')}
          </p>
          <p className="tabnum text-foreground mt-1 text-sm font-semibold">
            {annonse.pris.toLocaleString('nb-NO')}{' '}
            <span className="text-muted-foreground font-normal">kr</span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 sm:pl-4">
        <AnnonseRadHandlinger id={annonse.id} status={annonse.status} />
      </div>
    </div>
  )
}
