'use client'

import { useState, useTransition } from 'react'
import { MapPinIcon, ChevronRightIcon, PlusIcon, TrashIcon } from '@heroicons/react/16/solid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { hentAdresser, leggTilAdresse, slettAdresse, type Adresse } from '@/app/actions/adresser'

interface Props {
  value: Adresse | null
  onChange: (adresse: Adresse | null) => void
}

export function AdresseVelger({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [adresser, setAdresser] = useState<Adresse[]>([])
  const [visNyForm, setVisNyForm] = useState(false)
  const [nyGate, setNyGate] = useState('')
  const [nyPoststed, setNyPoststed] = useState('')
  const [feil, setFeil] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function apneSheet() {
    setOpen(true)
    startTransition(async () => {
      const data = await hentAdresser()
      setAdresser(data)
    })
  }

  function velgAdresse(a: Adresse) {
    onChange(a)
    setOpen(false)
  }

  function leggTilNy() {
    if (!nyGate.trim() || !nyPoststed.trim()) return
    setFeil(null)
    startTransition(async () => {
      const result = await leggTilAdresse(nyGate.trim(), nyPoststed.trim())
      if ('feil' in result) {
        setFeil(result.feil)
        return
      }
      setAdresser((prev) => [...prev, result])
      setNyGate('')
      setNyPoststed('')
      setVisNyForm(false)
      onChange(result)
      setOpen(false)
    })
  }

  function fjernAdresse(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    startTransition(async () => {
      await slettAdresse(id)
      setAdresser((prev) => prev.filter((a) => a.id !== id))
      if (value?.id === id) onChange(null)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={apneSheet}
        className={cn(
          'hover:border-foreground/40 border-border flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors',
          value ? 'bg-muted' : 'hover:bg-muted/50'
        )}
      >
        <MapPinIcon className="text-muted-foreground size-4 shrink-0" />
        <span className="flex-1 text-sm">
          {value ? (
            <span>
              <span className="text-foreground font-medium">{value.poststed}</span>
              <span className="text-muted-foreground ml-1.5 text-xs">{value.full_address}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Legg til adresse</span>
          )}
        </span>
        <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="pb-safe max-h-[85dvh] overflow-y-auto rounded-t-2xl"
          showCloseButton={false}
        >
          <SheetHeader className="pb-4">
            <SheetTitle>Selges fra</SheetTitle>
          </SheetHeader>

          <div className="space-y-2 px-8 pb-8">
            {isPending && adresser.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">Laster adresser…</p>
            ) : adresser.length === 0 && !visNyForm ? (
              <p className="text-muted-foreground py-2 text-sm">Ingen lagrede adresser.</p>
            ) : (
              <div className="divide-border border-border divide-y overflow-hidden rounded-xl border">
                {adresser.map((a) => (
                  <div
                    key={a.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => velgAdresse(a)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && velgAdresse(a)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors',
                      value?.id === a.id ? 'bg-foreground text-background' : 'hover:bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center rounded-full border-2',
                        value?.id === a.id
                          ? 'border-background bg-background'
                          : 'border-muted-foreground'
                      )}
                    >
                      {value?.id === a.id && <span className="bg-foreground size-2 rounded-full" />}
                    </span>
                    <div className="flex-1">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          value?.id === a.id ? 'text-background' : 'text-foreground'
                        )}
                      >
                        {a.poststed}
                      </p>
                      <p
                        className={cn(
                          'text-xs',
                          value?.id === a.id ? 'text-background/70' : 'text-muted-foreground'
                        )}
                      >
                        {a.full_address}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => fjernAdresse(a.id, e)}
                      className={cn(
                        'rounded-lg p-1.5 transition-colors',
                        value?.id === a.id
                          ? 'text-background/60 hover:text-background'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                      aria-label="Slett adresse"
                    >
                      <TrashIcon className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {visNyForm ? (
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label>Gate / adresse</Label>
                  <Input
                    value={nyGate}
                    onChange={(e) => setNyGate(e.target.value)}
                    placeholder="f.eks. Storgata 12"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Poststed</Label>
                  <Input
                    value={nyPoststed}
                    onChange={(e) => setNyPoststed(e.target.value)}
                    placeholder="f.eks. Oslo"
                  />
                </div>
                {feil && <p className="text-destructive text-xs">{feil}</p>}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={leggTilNy}
                    disabled={!nyGate.trim() || !nyPoststed.trim() || isPending}
                    className="flex-1"
                  >
                    Lagre adresse
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setVisNyForm(false)
                      setFeil(null)
                    }}
                  >
                    Avbryt
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setVisNyForm(true)}
                className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2 pt-1 text-sm transition-colors"
              >
                <PlusIcon className="size-4" />
                Legg til ny adresse
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
