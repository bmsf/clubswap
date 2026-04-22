'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PencilIcon, TrashIcon } from '@heroicons/react/16/solid'
import { toast } from 'sonner'
import { slettAnnonse } from '@/app/(app)/selg/actions'
import { Button } from '@/components/ui/button'
import { useBekreftSlettModal } from '@/store/bekreft-slett-modal'

export function AnnonseKortHandlinger({ id }: { id: string }) {
  const { openModal: openSlett } = useBekreftSlettModal()

  return (
    <div className="border-border flex items-center gap-1.5 border-t px-4 py-3">
      <Button asChild variant="outline" size="sm" className="flex-1">
        <a href={`/annonser/${id}/rediger`}>
          <PencilIcon className="h-3.5 w-3.5" />
          Rediger
        </a>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex-1 text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
        onClick={() => openSlett(id)}
      >
        <TrashIcon className="h-3.5 w-3.5" />
        Slett
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
          className="text-muted-foreground hover:text-foreground absolute top-3.5 right-3.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors"
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
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 shadow-md dark:bg-red-950/40">
            <TrashIcon className="h-6 w-6 text-red-500" />
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
              className="border-border text-foreground hover:bg-muted flex h-10 flex-1 cursor-pointer items-center justify-center rounded-xl border text-sm font-medium transition-colors disabled:opacity-60"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={handleSlett}
              disabled={isPending}
              className="flex h-10 flex-1 cursor-pointer items-center justify-center rounded-xl bg-red-500 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
            >
              {isPending ? 'Sletter…' : 'Ja, slett'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
