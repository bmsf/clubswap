'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { slettAnnonse } from '@/app/(app)/selg/actions'
import { Button } from '@/components/ui/button'

export function AnnonseKortHandlinger({ id }: { id: string }) {
  const router = useRouter()
  const [bekreft, setBekreft] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSlett() {
    if (!bekreft) {
      setBekreft(true)
      return
    }
    startTransition(async () => {
      const result = await slettAnnonse(id)
      if ('feil' in result) {
        toast.error(result.feil)
      } else {
        toast.success('Annonsen er slettet.')
        router.refresh()
      }
      setBekreft(false)
    })
  }

  return (
    <div className="border-border flex items-center gap-1.5 border-t px-4 py-3">
      <Button asChild variant="outline" size="sm" className="flex-1">
        <a href={`/annonser/${id}/rediger`}>
          <Pencil className="h-3.5 w-3.5" />
          Rediger
        </a>
      </Button>

      {bekreft ? (
        <div className="flex flex-1 items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground flex-1"
            onClick={() => setBekreft(false)}
          >
            Avbryt
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={handleSlett}
            disabled={isPending}
          >
            {isPending ? '…' : 'Ja, slett'}
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
          onClick={handleSlett}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Slett
        </Button>
      )}
    </div>
  )
}
