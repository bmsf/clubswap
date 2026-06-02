'use client'

import { useState } from 'react'
import { SimpleSelect } from '@/components/ui/simple-select'
import { TAKSONOMI, HOVEDKATEGORIER, finnLeaf } from '@/lib/categories'

// 3-nivå kategori-velger (hoved → gruppe → leaf). Lagrer leaf-slug via onChange.
// Facet-grupper (Skaft etter flex) er ikke valgbare som kategori.

function gruppeOptionsFor(hovedSlug: string | null) {
  const hoved = TAKSONOMI.find((h) => h.slug === hovedSlug)
  return (hoved?.grupper ?? [])
    .filter((g) => !g.facet)
    .map((g) => ({ value: g.slug, label: g.label }))
}

function leafOptionsFor(gruppeSlug: string | null) {
  for (const h of TAKSONOMI) {
    const g = h.grupper.find((gr) => gr.slug === gruppeSlug)
    if (g) return g.leaves.map((l) => ({ value: l.slug, label: l.label }))
  }
  return []
}

export function KategoriVelger({
  value,
  onChange,
  harFeil,
}: {
  value: string | null
  onChange: (slug: string | null) => void
  /** Marker det første ufullstendige nivået som feil (kun den rister). */
  harFeil?: boolean
}) {
  // Når `value` er en gyldig leaf styrer den visningen. Mens man velger (value=null)
  // styrer lokalt override hvilken hoved/gruppe som vises.
  const [override, setOverride] = useState<{ hoved: string | null; gruppe: string | null }>({
    hoved: null,
    gruppe: null,
  })

  const treff = finnLeaf(value)
  const hoved = treff ? treff.hoved.slug : override.hoved
  const gruppe = treff ? treff.gruppe.slug : override.gruppe

  const grupper = gruppeOptionsFor(hoved)
  const leaves = leafOptionsFor(gruppe)

  // Kun det første ufullstendige nivået skal markeres/riste ved feil.
  const feilNivaa = !harFeil
    ? null
    : !hoved
      ? 'hoved'
      : grupper.length > 0 && !gruppe
        ? 'gruppe'
        : 'leaf'

  return (
    <div className="space-y-3">
      <div data-feil={feilNivaa === 'hoved' ? 'true' : undefined}>
        <SimpleSelect
          value={hoved ?? ''}
          onValueChange={(v) => {
            setOverride({ hoved: v, gruppe: null })
            onChange(null)
          }}
          placeholder="Hovedkategori"
          options={HOVEDKATEGORIER.map((h) => ({ value: h.slug, label: h.label }))}
        />
      </div>
      {hoved && grupper.length > 0 && (
        <div data-feil={feilNivaa === 'gruppe' ? 'true' : undefined}>
          <SimpleSelect
            value={gruppe ?? ''}
            onValueChange={(v) => {
              setOverride({ hoved, gruppe: v })
              onChange(null)
            }}
            placeholder="Underkategori"
            options={grupper}
          />
        </div>
      )}
      {gruppe && leaves.length > 0 && (
        <div data-feil={feilNivaa === 'leaf' ? 'true' : undefined}>
          <SimpleSelect
            value={value ?? ''}
            onValueChange={(v) => onChange(v)}
            placeholder="Underkategori"
            options={leaves}
          />
        </div>
      )}
    </div>
  )
}
