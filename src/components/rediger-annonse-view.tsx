'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { MapPinIcon, ArchiveBoxIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/16/solid'
import { createClient } from '@/supabase/client'
import { oppdaterAnnonse } from '@/app/(app)/selg/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { SimpleSelect } from '@/components/ui/simple-select'
import { cn } from '@/lib/utils'
import {
  schema,
  type FormData,
  type Category,
  type Condition,
  TILSTANDER,
  KATEGORI_OPTIONS,
  AARSMODELL_VALG,
  DRIVER_LOFT_OPTIONS,
  SHAFT_FLEX_OPTIONS,
  SKAFT_TYPE_OPTIONS,
  HAR_SKAFT,
  HAR_HEADCOVER,
  HAR_LOFT_DRIVER,
  MAKS_ANTALL_BILDER,
  CATEGORY_TO_DB,
} from '@/components/selg-utstyr/constants'
import { Felt, PillToggle } from '@/components/selg-utstyr/primitives'
import {
  BildeOpplaster,
  validerFiler,
  type BildeEntry,
} from '@/components/selg-utstyr/bilde-opplaster'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Annonse = {
  id: string
  kategori: string
  merke: string
  modell: string
  aarsmodell?: string | null
  shaft_flex?: string | null
  haandighet?: string | null
  loft?: string | null
  skaft_materiale?: string | null
  tilstand: string
  skadebeskrivelse?: string | null
  pris: number
  selges_fra: string
  tilbyr_frakt: boolean
  bilder: string[]
}

const KJENTE_MERKER = [
  'TaylorMade',
  'Callaway',
  'Titleist',
  'Ping',
  'Cobra',
  'Cleveland',
  'Srixon',
  'Mizuno',
  'Wilson',
  'Odyssey',
  'Scotty Cameron',
  'PXG',
  'Honma',
]

const TILSTAND_KLASSE: Record<string, string> = {
  Ny: 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950',
  'Meget god':
    'text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950',
  God: 'text-primary border-primary/30 bg-primary/8',
  Akseptabel:
    'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950',
}

function mapAnnonseToForm(a: Annonse): {
  defaultValues: Partial<FormData>
  kategori: Category | null
  tilstand: Condition | null
} {
  const merkeErKjent = KJENTE_MERKER.includes(a.merke)
  const kategori =
    (Object.entries(CATEGORY_TO_DB).find(([, v]) => v === a.kategori)?.[0] as Category) ?? null
  const tilstand = TILSTANDER.find((t) => t.label === a.tilstand)?.value ?? null

  return {
    defaultValues: {
      merke: merkeErKjent ? a.merke : 'Annet',
      modell: a.modell,
      aarsmodell: a.aarsmodell ?? undefined,
      hand: a.haandighet === 'Høyre' ? 'right' : a.haandighet === 'Venstre' ? 'left' : undefined,
      loft: a.loft ?? undefined,
      shaftFlex: (a.shaft_flex as FormData['shaftFlex']) ?? undefined,
      skaftType:
        a.skaft_materiale === 'Stål'
          ? 'steel'
          : a.skaft_materiale === 'Grafitt'
            ? 'graphite'
            : undefined,
      skadebeskrivelse: a.skadebeskrivelse ?? undefined,
      pris: a.pris,
      selgesFra: a.selges_fra,
      tilbyrFrakt: a.tilbyr_frakt,
    },
    kategori,
    tilstand,
  }
}

// ── Section card ──────────────────────────────────────────────────────────────

function Seksjon({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border-border overflow-hidden rounded-2xl border">
      <div className="border-border border-b px-6 py-4">
        <h2 className="text-foreground text-sm font-semibold">{tittel}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ── Live preview ──────────────────────────────────────────────────────────────

function Forhandsvisning({
  merke,
  modell,
  pris,
  selgesFra,
  tilstand,
  forsideBilde,
}: {
  merke: string
  modell: string
  pris: number | string
  selgesFra: string
  tilstand: Condition | null
  forsideBilde: string | null
}) {
  const tilstandData = TILSTANDER.find((t) => t.value === tilstand) ?? null
  const prisNum = Number(pris)
  const prisFormatert = prisNum > 0 ? prisNum.toLocaleString('nb-NO') + ' kr' : '–'

  return (
    <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
      {/* Image */}
      <div className="bg-muted relative aspect-4/3 overflow-hidden">
        {forsideBilde ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={forsideBilde} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ArchiveBoxIcon className="text-muted-foreground/30 h-12 w-12" />
          </div>
        )}
        {tilstandData && (
          <span
            className={cn(
              'absolute top-2 left-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
              TILSTAND_KLASSE[tilstandData.label]
            )}
          >
            {tilstandData.label}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-4">
        <p className="text-foreground truncate font-medium">
          {merke || modell ? (
            `${merke} ${modell}`.trim()
          ) : (
            <span className="text-muted-foreground">Merke og modell</span>
          )}
        </p>
        <p
          className={cn(
            'font-mono text-base font-semibold',
            pris ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {prisFormatert}
        </p>
        {selgesFra && (
          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            <MapPinIcon className="h-3 w-3" />
            {selgesFra}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function RedigerAnnonseView({ annonse }: { annonse: Annonse }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    defaultValues,
    kategori: initKategori,
    tilstand: initTilstand,
  } = mapAnnonseToForm(annonse)

  const [kategori, setKategori] = useState<Category | null>(initKategori)
  const [tilstand, setTilstand] = useState<Condition | null>(initTilstand)
  const [bilder, setBilder] = useState<BildeEntry[]>([])
  const [eksisterendeBilder, setEksisterendeBilder] = useState<string[]>(annonse.bilder ?? [])

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { tilbyrFrakt: false, selgesFra: '', ...defaultValues },
  })

  const watched = useWatch({ control })
  const forsideBilde = eksisterendeBilder[0] ?? bilder[0]?.url ?? null

  // ── Image helpers ─────────────────────────────────────────────────────────

  function leggTilFiler(files: FileList | null) {
    if (!files) return
    const alle = Array.from(files)
    const feil = validerFiler(alle)
    if (feil) {
      toast.error(feil)
      return
    }
    const ledige = MAKS_ANTALL_BILDER - eksisterendeBilder.length - bilder.length
    setBilder((prev) => [
      ...prev,
      ...alle.slice(0, ledige).map((file) => ({ file, url: URL.createObjectURL(file) })),
    ])
  }

  function fjernBilde(i: number) {
    setBilder((prev) => {
      URL.revokeObjectURL(prev[i].url)
      return prev.filter((_, idx) => idx !== i)
    })
  }

  function fjernEksisterende(i: number) {
    setEksisterendeBilder((prev) => prev.filter((_, idx) => idx !== i))
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function onSubmit(data: FormData) {
    if (!tilstand) {
      toast.error('Velg tilstandsgrad.')
      return
    }
    if (!kategori) {
      toast.error('Velg kategori.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const nyeBildeUrls: string[] = []

      for (const entry of bilder) {
        const ext = entry.file.name.split('.').pop() ?? 'jpg'
        const path = `${crypto.randomUUID()}.${ext}`
        const { error } = await supabase.storage
          .from('annonse-bilder')
          .upload(path, entry.file, { upsert: false })
        if (error) {
          toast.error(`Bildeopplasting feilet: ${error.message}`)
          return
        }
        const { data: urlData } = supabase.storage.from('annonse-bilder').getPublicUrl(path)
        nyeBildeUrls.push(urlData.publicUrl)
      }

      const tilstandLabel = TILSTANDER.find((t) => t.value === tilstand)?.label ?? tilstand
      const payload = {
        kategori: CATEGORY_TO_DB[kategori],
        merke: data.merke,
        modell: data.modell,
        aarsmodell: data.aarsmodell,
        haandighet: data.hand === 'right' ? 'Høyre' : data.hand === 'left' ? 'Venstre' : undefined,
        loft: data.loft,
        shaftFlex: data.shaftFlex,
        skaftMateriale:
          data.skaftType === 'steel'
            ? 'Stål'
            : data.skaftType === 'graphite'
              ? 'Grafitt'
              : undefined,
        tilstand: tilstandLabel,
        skadebeskrivelse: data.skadebeskrivelse,
        pris: data.pris,
        selgesFra: data.selgesFra,
        tilbyrFrakt: data.tilbyrFrakt,
        bilder: [...eksisterendeBilder, ...nyeBildeUrls],
      }

      const result = await oppdaterAnnonse(
        annonse.id,
        payload as Parameters<typeof oppdaterAnnonse>[1]
      )
      if ('feil' in result) {
        toast.error(result.feil)
        return
      }
      toast.success('Annonsen er oppdatert!')
      router.push('/annonser')
    })
  }

  const harSkaft = kategori ? HAR_SKAFT.has(kategori) : false
  const harHeadcover = kategori ? HAR_HEADCOVER.has(kategori) : false
  const harLoft = kategori ? HAR_LOFT_DRIVER.has(kategori) : false

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-[1fr_340px] gap-8 px-12 py-8">
      {/* ── Left: form ──────────────────────────────────────────────────────── */}
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5 pb-8">
        {/* Bilder */}
        <Seksjon tittel="Bilder">
          <BildeOpplaster
            bilder={bilder}
            eksisterendeBilder={eksisterendeBilder}
            onLeggTil={leggTilFiler}
            onFjern={fjernBilde}
            onFjernEksisterende={fjernEksisterende}
          />
        </Seksjon>

        {/* Kategori og utstyr */}
        <Seksjon tittel="Om utstyret">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Felt label="Kategori" required>
                <SimpleSelect
                  value={kategori ?? ''}
                  onValueChange={(v) => setKategori(v as Category)}
                  placeholder="Velg kategori…"
                  options={KATEGORI_OPTIONS}
                />
              </Felt>
            </div>

            <Felt label="Merke" required error={errors.merke?.message}>
              <Input {...register('merke')} placeholder="f.eks. TaylorMade" />
            </Felt>

            <Felt label="Modell" required error={errors.modell?.message}>
              <Input {...register('modell')} placeholder="f.eks. Stealth 2" />
            </Felt>

            <div className="col-span-2">
              <Felt label="Årsmodell" error={errors.aarsmodell?.message}>
                <Controller
                  name="aarsmodell"
                  control={control}
                  render={({ field }) => (
                    <SimpleSelect
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      placeholder="Ukjent / ikke oppgitt"
                      options={AARSMODELL_VALG}
                    />
                  )}
                />
              </Felt>
            </div>

            {harSkaft && (
              <>
                <div className="col-span-2">
                  <Felt label="Hånd" error={errors.hand?.message}>
                    <Controller
                      name="hand"
                      control={control}
                      render={({ field }) => (
                        <PillToggle
                          options={[
                            { value: 'right', label: 'Høyre' },
                            { value: 'left', label: 'Venstre' },
                          ]}
                          value={field.value ?? null}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Felt>
                </div>

                {harLoft && (
                  <div className="col-span-2">
                    <Felt label="Loft" error={errors.loft?.message}>
                      <Controller
                        name="loft"
                        control={control}
                        render={({ field }) => (
                          <PillToggle
                            options={DRIVER_LOFT_OPTIONS.map((l) => ({ value: l, label: l }))}
                            value={field.value ?? null}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </Felt>
                  </div>
                )}

                <div className="col-span-2">
                  <Felt label="Shaft flex" error={errors.shaftFlex?.message}>
                    <Controller
                      name="shaftFlex"
                      control={control}
                      render={({ field }) => (
                        <PillToggle
                          options={SHAFT_FLEX_OPTIONS}
                          value={field.value ?? null}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Felt>
                </div>

                <div className="col-span-2">
                  <Felt label="Type skaft" error={errors.skaftType?.message}>
                    <Controller
                      name="skaftType"
                      control={control}
                      render={({ field }) => (
                        <PillToggle
                          options={SKAFT_TYPE_OPTIONS}
                          value={field.value ?? null}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Felt>
                </div>
              </>
            )}

            {harHeadcover && (
              <div className="col-span-2">
                <Felt label="Original headcover" error={errors.headcover?.message}>
                  <Controller
                    name="headcover"
                    control={control}
                    render={({ field }) => (
                      <PillToggle
                        options={[
                          { value: 'true', label: 'Ja' },
                          { value: 'false', label: 'Nei' },
                        ]}
                        value={
                          field.value === true ? 'true' : field.value === false ? 'false' : null
                        }
                        onChange={(v) => field.onChange(v === 'true')}
                      />
                    )}
                  />
                </Felt>
              </div>
            )}
          </div>
        </Seksjon>

        {/* Tilstand */}
        <Seksjon tittel="Tilstand">
          <div className="space-y-4">
            <div>
              <p className="text-foreground mb-3 text-sm font-medium">
                Tilstandsgrad <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {TILSTANDER.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTilstand(t.value)}
                    className={cn(
                      'flex cursor-pointer flex-col items-start rounded-xl border px-4 py-3 text-left transition-all',
                      tilstand === t.value
                        ? `${t.klasse} ring-primary ring-2 ring-offset-1`
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                        t.klasse
                      )}
                    >
                      {t.label}
                    </span>
                    <span className="text-muted-foreground mt-1.5 text-xs">{t.beskrivelse}</span>
                  </button>
                ))}
              </div>
            </div>

            <Felt
              label="Beskrivelse av slitasje (valgfritt)"
              error={errors.skadebeskrivelse?.message}
            >
              <Textarea
                {...register('skadebeskrivelse')}
                placeholder="Beskriv eventuelle riper, dents, slitt grep eller andre merker..."
                rows={3}
              />
            </Felt>
          </div>
        </Seksjon>

        {/* Pris og logistikk */}
        <Seksjon tittel="Pris og logistikk">
          <div className="grid grid-cols-2 gap-4">
            <Felt label="Pris (NOK)" required error={errors.pris?.message}>
              <div className="relative">
                <Input
                  {...register('pris')}
                  type="number"
                  min={0}
                  placeholder="f.eks. 2490"
                  className="pr-10"
                />
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm">
                  kr
                </span>
              </div>
            </Felt>

            <Felt label="Selges fra" required error={errors.selgesFra?.message}>
              <Input {...register('selgesFra')} placeholder="f.eks. Oslo" />
            </Felt>

            <div className="col-span-2">
              <Controller
                name="tilbyrFrakt"
                control={control}
                render={({ field }) => (
                  <label className="flex cursor-pointer items-start gap-3">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-foreground text-sm font-medium">Tilbyr frakt</span>
                      <p className="text-muted-foreground text-xs">
                        Du og kjøper avtaler fraktpris direkte i meldinger.
                      </p>
                    </div>
                  </label>
                )}
              />
            </div>
          </div>
        </Seksjon>

        {/* Save button */}
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full rounded-xl"
          onClick={() =>
            void handleSubmit(onSubmit, () => toast.error('Fyll inn alle påkrevde felt.'))()
          }
          disabled={isPending}
        >
          {isPending ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              Lagrer…
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4" />
              Lagre endringer
            </>
          )}
        </Button>
      </form>

      {/* ── Right: sticky preview ────────────────────────────────────────────── */}
      <div className="sticky top-8 flex flex-col gap-4 self-start">
        <div className="bg-card border-border overflow-hidden rounded-2xl border">
          <div className="border-border border-b px-5 py-4">
            <h2 className="text-foreground text-sm font-semibold">Forhåndsvisning</h2>
            <p className="text-muted-foreground mt-0.5 text-xs">Slik ser annonsen ut for kjøpere</p>
          </div>
          <div className="p-4">
            <Forhandsvisning
              merke={watched.merke ?? ''}
              modell={watched.modell ?? ''}
              pris={watched.pris ?? 0}
              selgesFra={watched.selgesFra ?? ''}
              tilstand={tilstand}
              forsideBilde={forsideBilde}
            />
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border px-5 py-4">
          <p className="text-foreground mb-3 text-sm font-semibold">Tips for god annonse</p>
          <ul className="text-muted-foreground space-y-2 text-xs">
            {[
              'Last opp minst 3 tydelige bilder fra ulike vinkler',
              'Fyll ut alle detaljer for å nå flere kjøpere',
              'Sett en realistisk pris basert på alder og tilstand',
              'Beskriv eventuell slitasje ærlig og nøyaktig',
            ].map((tips) => (
              <li key={tips} className="flex items-start gap-2">
                <CheckIcon className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
                {tips}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
