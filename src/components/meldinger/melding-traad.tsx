'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/supabase/client'
import {
  sendMelding,
  markerSamtaleLest,
  slettSamtale,
  type Melding,
} from '@/app/(app)/meldinger/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { klokkeslett, relativTid } from '@/lib/tid'

function initialer(navn: string) {
  return (
    navn
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  )
}

export function MeldingTraad({
  listingId,
  motpartId,
  motpartNavn,
  motpartAvatar,
  annonseTittel,
  annonseId,
  currentUserId,
  initialMeldinger,
}: {
  listingId: string
  motpartId: string
  motpartNavn: string
  motpartAvatar?: string | null
  annonseTittel: string
  annonseId: string
  currentUserId: string
  initialMeldinger: Melding[]
}) {
  const router = useRouter()
  const [meldinger, setMeldinger] = useState<Melding[]>(initialMeldinger)
  const [tekst, setTekst] = useState('')
  const [isPending, startTransition] = useTransition()
  const [slettPending, startSlett] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  // (Komponenten remountes per samtale via `key` i forelder.)

  // Marker som lest når samtalen åpnes
  useEffect(() => {
    void markerSamtaleLest(listingId, motpartId)
  }, [listingId, motpartId])

  // Realtime: nye meldinger i denne samtalen
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`meldinger:${listingId}:${motpartId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `listing_id=eq.${listingId}`,
        },
        (payload) => {
          const m = payload.new as Melding
          const iSamtalen =
            (m.sender_id === motpartId && m.recipient_id === currentUserId) ||
            (m.sender_id === currentUserId && m.recipient_id === motpartId)
          if (!iSamtalen) return
          setMeldinger((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
          if (m.sender_id === motpartId) void markerSamtaleLest(listingId, motpartId)
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [listingId, motpartId, currentUserId])

  // Scroll til bunn ved nye meldinger — kun inne i meldingslisten, ikke hele siden.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [meldinger])

  function send() {
    const body = tekst.trim()
    if (!body || isPending) return
    setTekst('')
    startTransition(async () => {
      const res = await sendMelding({ listingId, recipientId: motpartId, body })
      if ('feil' in res) {
        toast.error(res.feil)
        setTekst(body)
      } else {
        setMeldinger((prev) =>
          prev.some((x) => x.id === res.melding.id) ? prev : [...prev, res.melding]
        )
      }
    })
  }

  function slett() {
    startSlett(async () => {
      const res = await slettSamtale(listingId, motpartId)
      if ('feil' in res) {
        toast.error(res.feil)
      } else {
        toast.success('Samtalen er slettet.')
        router.push('/meldinger')
        router.refresh()
      }
    })
  }

  const sistAktiv = meldinger.length > 0 ? meldinger[meldinger.length - 1].created_at : null

  return (
    <div className="flex h-full flex-col">
      {/* Handlingslinje */}
      <div className="border-border flex h-12 items-center justify-between gap-2 border-b px-2 md:px-3">
        <Link
          href="/meldinger"
          className="text-muted-foreground hover:text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-md transition-colors md:hidden"
          aria-label="Tilbake"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1 md:hidden" />
        <AlertDialog>
          <AlertDialogTrigger
            className="text-muted-foreground hover:text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-md transition-colors"
            aria-label="Slett samtale"
          >
            <Trash2 className="size-4" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Slett samtale</AlertDialogTitle>
              <AlertDialogDescription>
                Er du sikker på at du vil slette denne samtalen? Meldingene fjernes for begge parter
                og dette kan ikke angres.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Avbryt</AlertDialogCancel>
              <AlertDialogAction
                onClick={slett}
                disabled={slettPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {slettPending ? 'Sletter…' : 'Slett'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar className="size-10">
          {motpartAvatar && <AvatarImage src={motpartAvatar} alt={motpartNavn} />}
          <AvatarFallback className="text-xs font-semibold">
            {initialer(motpartNavn)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-semibold">{motpartNavn}</p>
          <Link
            href={`/annonser/${annonseId}`}
            className="text-muted-foreground hover:text-foreground truncate text-xs"
          >
            {annonseTittel}
          </Link>
        </div>
        {sistAktiv && (
          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
            {relativTid(sistAktiv)}
          </span>
        )}
      </div>
      <Separator />

      {/* Meldinger */}
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {meldinger.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Ingen meldinger ennå. Si hei!
          </p>
        )}
        {meldinger.map((m) => {
          const mine = m.sender_id === currentUserId
          return (
            <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
                  mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                )}
              >
                <p className="break-words whitespace-pre-wrap">{m.body}</p>
                <p
                  className={cn(
                    'mt-0.5 text-[10px] tabular-nums',
                    mine ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  )}
                >
                  {klokkeslett(m.created_at)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Skrivefelt */}
      <div className="border-border border-t p-3">
        <Textarea
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          rows={2}
          placeholder={`Svar ${motpartNavn}…`}
          className="max-h-40 resize-none"
        />
        <div className="mt-2 flex justify-end">
          <Button onClick={send} disabled={isPending || !tekst.trim()} variant="primary">
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
