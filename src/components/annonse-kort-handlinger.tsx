'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowUturnLeftIcon,
  CheckBadgeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'
import { toast } from 'sonner'
import { markerSomAktiv, markerSomSolgt, slettAnnonse } from '@/app/(app)/selg/actions'
import { Button } from '@/components/ui/button'
import { useBekreftSlettModal } from '@/store/bekreft-slett-modal'

export function AnnonseRadHandlinger({ id, status }: { id: string; status: string }) {
  const { openModal: openSlett } = useBekreftSlettModal()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function toggleStatus() {
    startTransition(async () => {
      const result = status === 'solgt' ? await markerSomAktiv(id) : await markerSomSolgt(id)
      if ('feil' in result) {
        toast.error(result.feil)
      } else {
        toast.success(
          status === 'solgt' ? 'Annonsen er aktiv igjen.' : 'Annonsen er markert som solgt.'
        )
        router.refresh()
      }
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      {status !== 'paabegynt' && (
        <Button variant="outline" size="default" onClick={toggleStatus} disabled={isPending}>
          {status === 'solgt' ? (
            <>
              <ArrowUturnLeftIcon className="size-4" />
              <span className="hidden sm:inline">Aktiver</span>
            </>
          ) : (
            <>
              <CheckBadgeIcon className="size-4" />
              <span className="hidden sm:inline">Marker som solgt</span>
            </>
          )}
        </Button>
      )}

      <Button asChild variant="outline" size="default">
        <a href={`/annonser/${id}/rediger`}>
          <PencilIcon className="size-4" />
          <span className="hidden sm:inline">Rediger</span>
        </a>
      </Button>

      <Button
        variant="outline"
        size="default"
        className="text-destructive hover:border-destructive/30 hover:bg-destructive/10 dark:hover:bg-destructive/20"
        onClick={() => openSlett(id)}
      >
        <TrashIcon className="size-4" />
        <span className="hidden sm:inline">Slett</span>
      </Button>
    </div>
  )
}

export function BekreftSlettModal() {
  const { open, annonseId, closeModal } = useBekreftSlettModal()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, closeModal])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open || !annonseId) return null

  function handleSlett() {
    startTransition(async () => {
      const result = await slettAnnonse(annonseId!)
      if ('feil' in result) {
        toast.error(result.feil)
      } else {
        toast.success('Annonsen er slettet.')
        router.refresh()
        closeModal()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

      <div
        role="dialog"
        aria-modal="true"
        className="bg-card border-border relative z-10 w-[min(92vw,420px)] overflow-hidden rounded-2xl border shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Lukk-knapp */}
        <button
          type="button"
          onClick={closeModal}
          className="text-muted-foreground hover:text-foreground absolute top-3.5 right-3.5 flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors"
          aria-label="Lukk"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Innhold */}
        <div className="flex flex-col items-center px-7 pt-8 pb-6">
          <div className="bg-destructive/10 dark:bg-destructive/20 mb-4 flex size-12 items-center justify-center rounded-xl shadow-md">
            <TrashIcon className="text-destructive size-6" />
          </div>

          <h1 className="text-foreground mb-1 text-[1.1rem] font-bold">Slett annonse</h1>
          <p className="text-muted-foreground mb-6 text-center text-xs leading-relaxed">
            Er du sikker på at du vil slette denne annonsen? Dette kan ikke angres.
          </p>

          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="text-foreground hover:bg-muted border-border flex h-10 flex-1 cursor-pointer items-center justify-center rounded-xl border text-sm font-medium transition-colors disabled:opacity-60"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={handleSlett}
              disabled={isPending}
              className="bg-destructive text-primary-foreground hover:bg-destructive/90 flex h-10 flex-1 cursor-pointer items-center justify-center rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {isPending ? 'Sletter…' : 'Ja, slett'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
