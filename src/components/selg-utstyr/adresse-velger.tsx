'use client'

import { useEffect, useState, useTransition } from 'react'
import { MapPinIcon, ChevronRightIcon, ChevronLeftIcon, TrashIcon } from '@heroicons/react/16/solid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { hentAdresser, leggTilAdresse, slettAdresse, type Adresse } from '@/app/actions/adresser'

export type BeliggenhetPresisjon = 'generell' | 'noyaktig'

interface Props {
  value: Adresse | null
  onChange: (adresse: Adresse | null) => void
  beliggenhet: BeliggenhetPresisjon
  onBeliggenhetChange: (b: BeliggenhetPresisjon) => void
}

type Skjerm = 'hoved' | 'velg' | 'ny'

// Liten monokrom radio-indikator (matcher Tise-flyten, men i nøytrale tokens).
function Radio({ valgt }: { valgt: boolean }) {
  return (
    <span
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
        valgt ? 'border-foreground' : 'border-muted-foreground/40'
      )}
    >
      {valgt && <span className="bg-foreground size-2.5 rounded-full" />}
    </span>
  )
}

// Fylt felt à la Tise: grå boks med liten label over selve inputen.
function FeltBoks({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
  inputMode,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
  inputMode?: 'numeric' | 'text'
}) {
  return (
    <label className="bg-muted block rounded-xl px-4 py-2.5">
      <span className="text-muted-foreground block text-xs">{label}</span>
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        inputMode={inputMode}
        readOnly={!onChange}
        className="placeholder:text-muted-foreground h-auto w-full rounded-none border-0 bg-transparent p-0 shadow-none"
      />
    </label>
  )
}

export function AdresseVelger({ value, onChange, beliggenhet, onBeliggenhetChange }: Props) {
  const [open, setOpen] = useState(false)
  const [skjerm, setSkjerm] = useState<Skjerm>('hoved')
  const [adresser, setAdresser] = useState<Adresse[]>([])
  const [isPending, startTransition] = useTransition()

  // «Ny adresse»-skjema
  const [navn, setNavn] = useState('')
  const [land] = useState('Norge')
  const [gateadresse, setGateadresse] = useState('')
  const [gatenummer, setGatenummer] = useState('')
  const [postnummer, setPostnummer] = useState('')
  const [poststed, setPoststed] = useState('')
  const [feil, setFeil] = useState<string | null>(null)

  // Åpne/lukke-animasjon — samme mønster som auth-modal: hold modalen montert
  // mens den animerer ut.
  const [fase, setFase] = useState<'closed' | 'enter' | 'open' | 'closing'>('closed')

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFase('enter')
      const r = requestAnimationFrame(() => setFase('open'))
      return () => cancelAnimationFrame(r)
    }
    setFase((f) => (f === 'closed' ? 'closed' : 'closing'))
    const t = setTimeout(() => setFase('closed'), 150)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  function apneSheet() {
    setOpen(true)
    setSkjerm('hoved')
    startTransition(async () => {
      const data = await hentAdresser()
      setAdresser(data)
      // Forhåndsvelg standardadresse hvis ingen er valgt ennå.
      if (!value && data.length > 0) {
        onChange(data.find((a) => a.er_standard) ?? data[0])
      }
    })
  }

  function velgAdresse(a: Adresse) {
    onChange(a)
    setSkjerm('hoved')
  }

  function nullstillNyForm() {
    setNavn('')
    setGateadresse('')
    setGatenummer('')
    setPostnummer('')
    setPoststed('')
    setFeil(null)
  }

  function leggTilNy() {
    if (!gateadresse.trim() || !postnummer.trim() || !poststed.trim()) return
    setFeil(null)
    startTransition(async () => {
      const result = await leggTilAdresse({
        navn: navn.trim() || undefined,
        land,
        gateadresse: gateadresse.trim(),
        gatenummer: gatenummer.trim() || undefined,
        postnummer: postnummer.trim(),
        poststed: poststed.trim(),
      })
      if ('feil' in result) {
        setFeil(result.feil)
        return
      }
      setAdresser((prev) => [...prev, result])
      onChange(result)
      nullstillNyForm()
      setSkjerm('hoved')
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

  const nyGyldig = gateadresse.trim() && postnummer.trim() && poststed.trim()
  const animKlasse = fase === 'open' ? 'is-open' : fase === 'closing' ? 'is-closing' : ''

  return (
    <>
      {/* Trigger i «Sted»-feltet */}
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

      {fase !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className={`t-modal-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm ${animKlasse}`}
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            className={`t-modal bg-card border-border relative z-10 flex max-h-[88dvh] w-[min(92vw,480px)] flex-col overflow-hidden rounded-2xl border shadow-2xl ${animKlasse}`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header — varierer per skjerm */}
            <div className="border-border relative flex items-center justify-center border-b px-6 py-4">
              {skjerm !== 'hoved' && (
                <button
                  type="button"
                  onClick={() => setSkjerm(skjerm === 'ny' ? 'velg' : 'hoved')}
                  className="hover:bg-muted absolute left-4 rounded-lg p-1.5 transition-colors"
                  aria-label="Tilbake"
                >
                  <ChevronLeftIcon className="size-5" />
                </button>
              )}
              <h2 className="text-foreground text-base font-semibold">
                {skjerm === 'hoved'
                  ? 'Hvor vil du sende varen fra?'
                  : skjerm === 'velg'
                    ? 'Velg adresse'
                    : 'Ny adresse'}
              </h2>
              {skjerm === 'hoved' && (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted absolute right-4 rounded-lg p-1.5 transition-colors"
                  aria-label="Lukk"
                >
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-5" />
                </button>
              )}
            </div>

            {/* ── Skjerm: Hovedmeny ───────────────────────────────────── */}
            {skjerm === 'hoved' && (
              <div className="space-y-5 overflow-y-auto px-6 pt-6 pb-8">
                <div>
                  <h3 className="text-foreground text-xl font-semibold">Adresse</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    Velg adressen du vil sende varen fra. Du kan alltid endre dette før du
                    aksepterer et bud.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSkjerm('velg')}
                  className="bg-muted hover:bg-muted/70 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors"
                >
                  <MapPinIcon className="text-muted-foreground size-5 shrink-0" />
                  <span className="flex-1">
                    <span className="text-muted-foreground block text-xs">Adresse</span>
                    <span className="text-foreground block text-sm font-medium">
                      {value ? value.full_address : 'Velg adresse'}
                    </span>
                  </span>
                  <ChevronRightIcon className="text-muted-foreground size-5 shrink-0" />
                </button>

                <div className="space-y-3">
                  {(
                    [
                      {
                        v: 'generell' as const,
                        tittel: 'Generell beliggenhet',
                        tekst: 'Kjøpere vil bare kunne se varens omtrentlige beliggenhet',
                      },
                      {
                        v: 'noyaktig' as const,
                        tittel: 'Nøyaktig beliggenhet',
                        tekst: 'Kjøpere vil kunne se varens nøyaktige beliggenhet',
                      },
                    ] as const
                  ).map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => onBeliggenhetChange(o.v)}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <span className="pt-0.5">
                        <Radio valgt={beliggenhet === o.v} />
                      </span>
                      <span className="flex-1">
                        <span className="text-foreground block text-sm font-semibold">
                          {o.tittel}
                        </span>
                        <span className="text-muted-foreground block text-xs leading-relaxed">
                          {o.tekst}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                <Button type="button" className="w-full" onClick={() => setOpen(false)}>
                  Ferdig
                </Button>
              </div>
            )}

            {/* ── Skjerm: Velg adresse ────────────────────────────────── */}
            {skjerm === 'velg' && (
              <div className="flex flex-1 flex-col overflow-y-auto px-6 pt-6 pb-8">
                {isPending && adresser.length === 0 ? (
                  <p className="text-muted-foreground py-6 text-center text-sm">Laster adresser…</p>
                ) : adresser.length === 0 ? (
                  <p className="text-muted-foreground py-6 text-center text-sm">
                    Ingen lagrede adresser ennå.
                  </p>
                ) : (
                  <div className="divide-border divide-y">
                    {adresser.map((a) => (
                      <div
                        key={a.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => velgAdresse(a)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && velgAdresse(a)}
                        className="flex cursor-pointer items-center gap-3 py-4 text-left"
                      >
                        <Radio valgt={value?.id === a.id} />
                        <div className="flex-1">
                          {a.navn && (
                            <p className="text-foreground text-sm font-semibold">{a.navn}</p>
                          )}
                          <p
                            className={cn(
                              'text-sm',
                              a.navn ? 'text-muted-foreground' : 'text-foreground font-medium'
                            )}
                          >
                            {a.full_address}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => fjernAdresse(a.id, e)}
                          className="text-muted-foreground hover:text-destructive rounded-lg p-1.5 transition-colors"
                          aria-label="Slett adresse"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 w-full"
                  onClick={() => {
                    nullstillNyForm()
                    setSkjerm('ny')
                  }}
                >
                  Legg til ny adresse
                </Button>
              </div>
            )}

            {/* ── Skjerm: Ny adresse ──────────────────────────────────── */}
            {skjerm === 'ny' && (
              <div className="flex flex-1 flex-col overflow-y-auto px-6 pt-6 pb-8">
                <div className="space-y-3">
                  <FeltBoks label="Land" value={land} />
                  <FeltBoks label="Navn" value={navn} onChange={setNavn} placeholder="Navn" />
                  <div className="grid grid-cols-2 gap-3">
                    <FeltBoks
                      label="Gateadresse"
                      value={gateadresse}
                      onChange={setGateadresse}
                      placeholder="Gateadresse"
                      autoFocus
                    />
                    <FeltBoks
                      label="Gatenummer"
                      value={gatenummer}
                      onChange={setGatenummer}
                      placeholder="Gatenummer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FeltBoks
                      label="Postnummer"
                      value={postnummer}
                      onChange={(v) => setPostnummer(v.replace(/\D/g, ''))}
                      placeholder="Postnummer"
                      inputMode="numeric"
                    />
                    <FeltBoks
                      label="Poststed"
                      value={poststed}
                      onChange={setPoststed}
                      placeholder="Poststed"
                    />
                  </div>
                  {feil && <p className="text-destructive text-xs">{feil}</p>}
                </div>

                <Button
                  type="button"
                  className="mt-6 w-full"
                  onClick={leggTilNy}
                  disabled={!nyGyldig || isPending}
                >
                  Legg til
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
