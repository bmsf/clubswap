'use client'

import { useState, useTransition } from 'react'
import { MapPinIcon, TrashIcon, PlusIcon } from '@heroicons/react/16/solid'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  leggTilAdresse,
  slettAdresse,
  settStandardAdresse,
  type Adresse,
} from '@/app/actions/adresser'

function FeltBoks({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  maxLength,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  inputMode?: 'numeric' | 'text'
  maxLength?: number
}) {
  return (
    <label className="bg-muted block rounded-xl px-4 py-2.5">
      <span className="text-muted-foreground block text-xs">{label}</span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className="placeholder:text-muted-foreground h-auto w-full rounded-none border-0 bg-transparent p-0 shadow-none"
      />
    </label>
  )
}

export function AdresserKlient({ initialeAdresser }: { initialeAdresser: Adresse[] }) {
  const [adresser, setAdresser] = useState<Adresse[]>(initialeAdresser)
  const [visNyForm, setVisNyForm] = useState(false)
  const [navn, setNavn] = useState('')
  const [gateadresse, setGateadresse] = useState('')
  const [gatenummer, setGatenummer] = useState('')
  const [postnummer, setPostnummer] = useState('')
  const [poststed, setPoststed] = useState('')
  const [feil, setFeil] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const nyGyldig = gateadresse.trim() && postnummer.trim() && poststed.trim()

  function nullstill() {
    setNavn('')
    setGateadresse('')
    setGatenummer('')
    setPostnummer('')
    setPoststed('')
    setFeil(null)
  }

  function leggTil() {
    if (!nyGyldig) return
    setFeil(null)
    startTransition(async () => {
      const result = await leggTilAdresse({
        navn: navn.trim() || undefined,
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
      nullstill()
      setVisNyForm(false)
    })
  }

  function fjern(id: string) {
    startTransition(async () => {
      await slettAdresse(id)
      setAdresser((prev) => prev.filter((a) => a.id !== id))
    })
  }

  function settStandard(id: string) {
    startTransition(async () => {
      const res = await settStandardAdresse(id)
      if (res.feil) return
      setAdresser((prev) => prev.map((a) => ({ ...a, er_standard: a.id === id })))
    })
  }

  return (
    <div className="space-y-4">
      {adresser.length === 0 && !visNyForm && (
        <p className="text-muted-foreground text-sm">Ingen lagrede adresser ennå.</p>
      )}

      {adresser.length > 0 && (
        <div className="border-border divide-border divide-y overflow-hidden rounded-2xl border">
          {adresser.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3.5">
              <MapPinIcon className="text-muted-foreground size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                {a.navn && (
                  <p className="text-foreground truncate text-sm font-semibold">{a.navn}</p>
                )}
                <p
                  className={cn(
                    'truncate text-sm',
                    a.navn ? 'text-muted-foreground' : 'text-foreground font-medium'
                  )}
                >
                  {a.full_address}
                </p>
              </div>
              {a.er_standard ? (
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold">
                  Standard
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => settStandard(a.id)}
                  disabled={isPending}
                  className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2 disabled:opacity-50"
                >
                  Sett som standard
                </button>
              )}
              <button
                type="button"
                onClick={() => fjern(a.id)}
                disabled={isPending}
                className="text-muted-foreground hover:text-destructive rounded-lg p-1.5 transition-colors disabled:opacity-50"
                aria-label="Slett adresse"
              >
                <TrashIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {visNyForm ? (
        <div className="border-border space-y-3 rounded-2xl border p-4">
          <FeltBoks label="Navn" value={navn} onChange={setNavn} placeholder="Navn (valgfritt)" />
          <div className="grid grid-cols-2 gap-3">
            <FeltBoks
              label="Gateadresse"
              value={gateadresse}
              onChange={setGateadresse}
              placeholder="Gateadresse"
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
              maxLength={4}
            />
            <FeltBoks
              label="Poststed"
              value={poststed}
              onChange={setPoststed}
              placeholder="Poststed"
            />
          </div>
          {feil && <p className="text-destructive text-xs">{feil}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={leggTil}
              disabled={!nyGyldig || isPending}
              className="bg-foreground text-background flex-1 rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              Legg til
            </button>
            <button
              type="button"
              onClick={() => {
                setVisNyForm(false)
                nullstill()
              }}
              className="border-border rounded-lg border px-4 py-2.5 text-sm"
            >
              Avbryt
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setVisNyForm(true)}
          className="border-border hover:border-foreground/40 flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors"
        >
          <PlusIcon className="size-4" />
          Legg til ny adresse
        </button>
      )}
    </div>
  )
}
