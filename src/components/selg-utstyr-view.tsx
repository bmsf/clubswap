'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { SimpleSelect } from '@/components/ui/simple-select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  SparklesIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from '@heroicons/react/16/solid'
import { createClient } from '@/supabase/client'
import { publiserAnnonse, oppdaterAnnonse } from '@/app/(app)/selg/actions'

import {
  schema,
  type FormData,
  type Category,
  type Condition,
  type EquipmentAnalysis,
  type KolleItem,
  ALLE_STEG,
  CATEGORY_TO_DB,
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
  SHAFT_KATEGORI_MAP,
  createModeSchema,
} from './selg-utstyr/constants'
import {
  BildeOpplaster,
  type BildeEntry,
  fileToBase64,
  validerFiler,
} from './selg-utstyr/bilde-opplaster'
import { Felt, PillToggle, AiBadge } from './selg-utstyr/primitives'
import { Fremdrift } from './selg-utstyr/fremdrift'
import { UtstyrSok } from './selg-utstyr/utstyr-sok'
import { SkaftSokDb } from './selg-utstyr/skaft-sok-db'

// ── Animation ─────────────────────────────────────────────────────────────────

const contentVariants = {
  hidden: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0] as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -40,
    transition: { duration: 0.2, ease: [0.4, 0.0, 1.0, 1.0] as const },
  }),
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  annonseId?: string
  initialData?: Partial<FormData>
  initialKategori?: Category
  initialTilstand?: Condition
  eksisterendeBilder?: string[]
  modalModus?: boolean
  onSuccess?: () => void
}

export function SelgUtstyrView({
  annonseId,
  initialData,
  initialKategori,
  initialTilstand,
  eksisterendeBilder: initBilder = [],
  modalModus = false,
  onSuccess,
}: Props) {
  const router = useRouter()
  const redigerModus = !!annonseId

  const steg = redigerModus ? ALLE_STEG.slice(1) : ALLE_STEG.filter((s) => s.id !== 'kategori')

  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const [mode, setMode] = useState<'ai' | 'manual' | null>(redigerModus ? 'manual' : null)
  const [bilder, setBilder] = useState<BildeEntry[]>([])
  const [eksisterendeBilder, setEksisterendeBilder] = useState<string[]>(initBilder)
  const [analyserer, setAnalyserer] = useState(false)
  const [analysis, setAnalysis] = useState<EquipmentAnalysis | null>(null)
  const [aiFields, setAiFields] = useState<Set<string>>(new Set())

  // Edit mode: single category state (backward compat)
  const [kategori, setKategori] = useState<Category | null>(initialKategori ?? null)
  const [tilstand, setTilstand] = useState<Condition | null>(initialTilstand ?? null)

  // Create mode: single-club state
  const [koller, setKoller] = useState<KolleItem[]>([])
  const [aiKolleId, setAiKolleId] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    getValues,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(redigerModus ? schema : createModeSchema) as any,
    defaultValues: { tilbyrFrakt: false, selgesFra: '', ...initialData },
  })

  // ── Navigation ───────────────────────────────────────────────────────────

  function gaTil(i: number) {
    setDirection(i > currentStep ? 1 : -1)
    setCurrentStep(i)
    clearErrors()
  }

  function nextStep() {
    if (currentStep < steg.length - 1) gaTil(currentStep + 1)
  }
  function prevStep() {
    if (currentStep > 0) gaTil(currentStep - 1)
  }

  // ── Step validation ──────────────────────────────────────────────────────

  function isStegGyldig(): boolean {
    switch (steg[currentStep]?.id) {
      case 'metode':
        return mode !== null
      case 'kategori':
        return redigerModus ? kategori !== null : koller.length > 0
      case 'utstyr': {
        if (redigerModus) {
          const { merke, modell } = getValues()
          return merke?.trim() !== '' && modell?.trim() !== ''
        }
        return (
          koller.length > 0 &&
          koller.every(
            (k) =>
              k.confirmed &&
              k.merke.trim() !== '' &&
              k.modell.trim() !== '' &&
              (!HAR_HEADCOVER.has(k.kategori) || k.headcover !== undefined)
          )
        )
      }
      case 'bilder':
        return true
      case 'tilstand':
        return tilstand !== null
      case 'pris':
        return true
      default:
        return true
    }
  }

  // ── Club helpers ─────────────────────────────────────────────────────────

  function oppdaterKolle(id: string, felt: Partial<Omit<KolleItem, 'id'>>) {
    setKoller((prev) => prev.map((k) => (k.id === id ? { ...k, ...felt } : k)))
  }

  // ── Image helpers ────────────────────────────────────────────────────────

  function leggTilFiler(files: FileList | null) {
    if (!files) return
    const alle = Array.from(files)
    const feil = validerFiler(alle)
    if (feil) {
      toast.error(feil)
      return
    }
    const ledige = MAKS_ANTALL_BILDER - eksisterendeBilder.length - bilder.length
    const nye: BildeEntry[] = alle
      .slice(0, ledige)
      .map((file) => ({ file, url: URL.createObjectURL(file) }))
    setBilder((prev) => [...prev, ...nye])
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

  // ── AI analysis ──────────────────────────────────────────────────────────

  async function analyserBilder() {
    if (bilder.length === 0) return
    setAnalyserer(true)
    try {
      const fil = bilder[0].file
      const res = await fetch('/api/analyze-equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: await fileToBase64(fil), mediaType: fil.type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'API-kall feilet')
      setAnalysis(data)

      const filled = new Set<string>()

      if (data.category) {
        const kolleId = crypto.randomUUID()
        const nyKolle: KolleItem = {
          id: kolleId,
          kategori: data.category,
          merke: data.brand ?? '',
          modell: data.model ?? '',
          aarsmodell: data.year ? String(data.year) : undefined,
          hand: data.hand ?? undefined,
          loft: data.loft ? `${data.loft}°` : undefined,
          shaftFlex: data.shaft_flex ?? undefined,
          skaftType: data.shaft_type ?? undefined,
          headcover: data.includes_headcover ?? undefined,
          confirmed: true,
          manuell: false,
        }
        setKoller([nyKolle])
        setAiKolleId(kolleId)
        filled.add('kategori')
        if (data.brand) filled.add('merke')
        if (data.model) filled.add('modell')
        if (data.year) filled.add('aarsmodell')
        if (data.hand) filled.add('hand')
        if (data.loft) filled.add('loft')
        if (data.shaft_flex) filled.add('shaftFlex')
        if (data.shaft_type) filled.add('skaftType')
        if (data.includes_headcover !== null) filled.add('headcover')
      }
      if (data.condition_estimate) {
        setTilstand(data.condition_estimate)
        filled.add('tilstand')
      }
      setAiFields(filled)
    } catch (err) {
      toast.error(
        `Kunne ikke analysere bildet: ${err instanceof Error ? err.message : 'Ukjent feil'}`
      )
    } finally {
      setAnalyserer(false)
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function onSubmit(data: FormData) {
    if (!tilstand) {
      toast.error('Velg tilstandsgrad.')
      return
    }

    const supabase = createClient()
    const nyeBildeUrls: string[] = []
    for (const entry of bilder) {
      const ext = entry.file.name.split('.').pop() ?? 'jpg'
      const path = `${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('annonse-bilder')
        .upload(path, entry.file, { upsert: false })
      if (uploadError) {
        toast.error(`Bildeopplasting feilet: ${uploadError.message}`)
        return
      }
      const { data: urlData } = supabase.storage.from('annonse-bilder').getPublicUrl(path)
      nyeBildeUrls.push(urlData.publicUrl)
    }

    const bildeUrls = [...eksisterendeBilder, ...nyeBildeUrls]
    const tilstandLabel = TILSTANDER.find((t) => t.value === tilstand)?.label ?? tilstand

    // Edit mode: single listing update
    if (redigerModus) {
      if (!kategori) {
        toast.error('Velg en kategori.')
        return
      }
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
        bilder: bildeUrls,
      }
      const result = await oppdaterAnnonse(
        annonseId!,
        payload as Parameters<typeof oppdaterAnnonse>[1]
      )
      if ('feil' in result) {
        toast.error(result.feil)
        return
      }
      toast.success('Annonsen er oppdatert!')
      setTimeout(() => (onSuccess ? onSuccess() : router.push('/annonser')), 1200)
      return
    }

    // Create mode: one listing per club
    if (koller.length === 0) {
      toast.error('Legg til minst én kølle.')
      return
    }

    for (const kolle of koller) {
      const payload = {
        kategori: CATEGORY_TO_DB[kolle.kategori],
        merke: kolle.merke,
        modell: kolle.modell,
        aarsmodell: kolle.aarsmodell,
        haandighet:
          kolle.hand === 'right' ? 'Høyre' : kolle.hand === 'left' ? 'Venstre' : undefined,
        loft: kolle.loft,
        shaftFlex: kolle.shaftFlex,
        skaftMateriale:
          kolle.skaftType === 'steel'
            ? 'Stål'
            : kolle.skaftType === 'graphite'
              ? 'Grafitt'
              : undefined,
        tilstand: tilstandLabel,
        skadebeskrivelse: data.skadebeskrivelse,
        pris: data.pris,
        selgesFra: data.selgesFra,
        tilbyrFrakt: data.tilbyrFrakt,
        bilder: bildeUrls,
      }
      const result = await publiserAnnonse(payload as Parameters<typeof publiserAnnonse>[0])
      if ('feil' in result) {
        toast.error(result.feil)
        return
      }
    }

    toast.success(
      koller.length === 1 ? 'Annonsen er publisert!' : `${koller.length} annonser er publisert!`
    )
    setTimeout(() => router.push('/annonser'), 1200)
  }

  // ── Step content ─────────────────────────────────────────────────────────

  const bildeOpplasterProps = {
    bilder,
    eksisterendeBilder,
    onLeggTil: leggTilFiler,
    onFjern: fjernBilde,
    onFjernEksisterende: fjernEksisterende,
  }

  function renderStegInnhold() {
    switch (steg[currentStep]?.id) {
      case 'metode':
        return (
          <>
            <CardHeader>
              <CardTitle>Hvordan vil du legge ut?</CardTitle>
              <CardDescription>Velg metode for å registrere utstyret ditt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    {
                      key: 'ai' as const,
                      icon: SparklesIcon,
                      tittel: 'Skann med AI',
                      beskrivelse: 'Last opp bilde og la AI gjenkjenne utstyret automatisk',
                    },
                    {
                      key: 'manual' as const,
                      icon: PencilSquareIcon,
                      tittel: 'Fyll ut manuelt',
                      beskrivelse: 'Velg kategori og fyll ut feltene selv',
                    },
                  ] as const
                ).map(({ key, icon: Icon, tittel, beskrivelse }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMode(key)}
                    className={cn(
                      'flex cursor-pointer flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all',
                      mode === key
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        mode === key
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-semibold">{tittel}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">{beskrivelse}</p>
                    </div>
                  </button>
                ))}
              </div>

              {mode === 'ai' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="border-border mt-4 border-t pt-4">
                    <p className="text-foreground mb-3 text-sm font-medium">Last opp bilder</p>
                    <BildeOpplaster {...bildeOpplasterProps} />
                    {analysis?.confidence === 'low' && (
                      <div className="mt-4 mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        Vi er litt usikre på gjenkjenningen – sjekk at feltene stemmer.
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="primary"
                      onClick={analyserBilder}
                      disabled={bilder.length === 0 || analyserer}
                      className="mt-4 w-full gap-2"
                    >
                      {analyserer ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                          Gjenkjenner utstyr…
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-4 w-4" />
                          Analyser bilder med AI
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </>
        )

      case 'kategori':
        // Edit mode: single category picker (unchanged)
        if (redigerModus) {
          return (
            <>
              <CardHeader>
                <CardTitle>Kategori</CardTitle>
                <CardDescription>Velg hvilken type utstyr du selger</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Felt label="Kategori" required>
                  <SimpleSelect
                    value={kategori ?? ''}
                    onValueChange={(v) => setKategori(v as Category)}
                    placeholder="Velg kategori…"
                    options={KATEGORI_OPTIONS}
                    className="max-w-1/3"
                  />
                </Felt>
              </CardContent>
            </>
          )
        }

        // Create mode: single category picker
        return (
          <>
            <CardHeader>
              <CardTitle>Kategori</CardTitle>
              <CardDescription>Velg hvilken type utstyr du ønsker å selge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SimpleSelect
                value={koller[0]?.kategori ?? ''}
                onValueChange={(v) => {
                  const kat = v as Category
                  setKoller([
                    koller.length > 0
                      ? { ...koller[0], kategori: kat }
                      : { id: crypto.randomUUID(), kategori: kat, merke: '', modell: '' },
                  ])
                }}
                placeholder="Velg kategori…"
                options={KATEGORI_OPTIONS}
                className="max-w-xs"
              />
            </CardContent>
          </>
        )

      case 'utstyr':
        // Edit mode: old single-club form (unchanged)
        if (redigerModus) {
          return (
            <>
              <CardHeader>
                <CardTitle>Om utstyret</CardTitle>
                <CardDescription>Fyll inn detaljer om utstyret du selger</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Felt
                    label="Merke"
                    required
                    error={errors.merke?.message}
                    aiBadge={aiFields.has('merke')}
                  >
                    <Input {...register('merke')} placeholder="f.eks. TaylorMade" />
                  </Felt>

                  <Felt
                    label="Modell"
                    required
                    error={errors.modell?.message}
                    aiBadge={aiFields.has('modell')}
                  >
                    <Input {...register('modell')} placeholder="f.eks. Stealth 2" />
                  </Felt>

                  <div className="col-span-2">
                    <Felt
                      label="Årsmodell"
                      error={errors.aarsmodell?.message}
                      aiBadge={aiFields.has('aarsmodell')}
                    >
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

                  {kategori && HAR_SKAFT.has(kategori) && (
                    <>
                      <div className="col-span-2">
                        <Felt
                          label="Hånd"
                          required
                          error={errors.hand?.message}
                          aiBadge={aiFields.has('hand')}
                        >
                          <Controller
                            name="hand"
                            control={control}
                            render={({ field }) => (
                              <PillToggle
                                options={[
                                  { value: 'right', label: 'Høyre' },
                                  { value: 'left', label: 'Venstre' },
                                ]}
                                value={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                        </Felt>
                      </div>

                      {kategori && HAR_LOFT_DRIVER.has(kategori) && (
                        <div className="col-span-2">
                          <Felt
                            label="Loft"
                            required
                            error={errors.loft?.message}
                            aiBadge={aiFields.has('loft')}
                          >
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
                        <Felt
                          label="Shaft flex"
                          error={errors.shaftFlex?.message}
                          aiBadge={aiFields.has('shaftFlex')}
                        >
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
                        <Felt
                          label="Type skaft"
                          error={errors.skaftType?.message}
                          aiBadge={aiFields.has('skaftType')}
                        >
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

                  {kategori && HAR_HEADCOVER.has(kategori) && (
                    <div className="col-span-2">
                      <Felt
                        label="Original headcover"
                        error={errors.headcover?.message}
                        aiBadge={aiFields.has('headcover')}
                      >
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
                                field.value === true
                                  ? 'true'
                                  : field.value === false
                                    ? 'false'
                                    : null
                              }
                              onChange={(v) => field.onChange(v === 'true')}
                            />
                          )}
                        />
                      </Felt>
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          )
        }

        // Create mode: merged category + equipment details
        return (() => {
          const kolle = koller[0] ?? null
          const harSkaft = kolle ? HAR_SKAFT.has(kolle.kategori) : false
          const harHeadcover = kolle ? HAR_HEADCOVER.has(kolle.kategori) : false
          const harLoft = kolle ? HAR_LOFT_DRIVER.has(kolle.kategori) : false
          const label = kolle
            ? (KATEGORI_OPTIONS.find((o) => o.value === kolle.kategori)?.label ?? kolle.kategori)
            : ''
          const erAI = kolle?.id === aiKolleId

          return (
            <>
              <CardHeader>
                <CardTitle>Utstyr</CardTitle>
                <CardDescription>Velg hvilken type utstyr du ønsker å selge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SimpleSelect
                  value={kolle?.kategori ?? ''}
                  onValueChange={(v) => {
                    const kat = v as Category
                    setKoller([
                      kolle
                        ? {
                            id: kolle.id,
                            kategori: kat,
                            merke: '',
                            modell: '',
                            confirmed: false,
                            manuell: false,
                          }
                        : { id: crypto.randomUUID(), kategori: kat, merke: '', modell: '' },
                    ])
                  }}
                  placeholder="Velg kategori…"
                  options={KATEGORI_OPTIONS}
                  className="max-w-xs"
                />

                <AnimatePresence>
                  {kolle && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                      className="space-y-4"
                    >
                      <div className="border-border border-t" />

                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-semibold">{label}</span>
                        {erAI && <AiBadge />}
                      </div>

                      <div className="space-y-4">
                        {kolle.manuell ? (
                          <div className="grid grid-cols-2 gap-4">
                            <Felt label="Merke" required>
                              <Input
                                value={kolle.merke}
                                onChange={(e) => oppdaterKolle(kolle.id, { merke: e.target.value })}
                                placeholder="f.eks. TaylorMade"
                                autoFocus
                              />
                            </Felt>
                            <Felt label="Modell" required>
                              <Input
                                value={kolle.modell}
                                onChange={(e) =>
                                  oppdaterKolle(kolle.id, { modell: e.target.value })
                                }
                                placeholder={
                                  kolle.kategori === 'driver'
                                    ? 'f.eks. Stealth 2'
                                    : kolle.kategori === 'wedge'
                                      ? 'f.eks. SM9 56°'
                                      : 'f.eks. Apex Pro'
                                }
                              />
                            </Felt>
                          </div>
                        ) : (
                          <UtstyrSok
                            category={kolle.kategori}
                            placeholder={`Søk etter ${label.toLowerCase()}…`}
                            value={
                              kolle.confirmed
                                ? {
                                    id: '',
                                    brand: kolle.merke,
                                    model: kolle.modell,
                                    year: kolle.aarsmodell ? parseInt(kolle.aarsmodell) : undefined,
                                    category: kolle.kategori,
                                  }
                                : null
                            }
                            onChange={(val) => {
                              if (val) {
                                oppdaterKolle(kolle.id, {
                                  merke: val.brand,
                                  modell: val.model,
                                  aarsmodell: val.year ? String(val.year) : undefined,
                                  confirmed: true,
                                  manuell: false,
                                })
                              } else {
                                oppdaterKolle(kolle.id, {
                                  merke: '',
                                  modell: '',
                                  aarsmodell: undefined,
                                  confirmed: false,
                                  manuell: false,
                                })
                              }
                            }}
                            onManuell={() =>
                              oppdaterKolle(kolle.id, { confirmed: true, manuell: true })
                            }
                          />
                        )}

                        {kolle.confirmed && (
                          <div className="grid grid-cols-2 gap-4">
                            {kolle.manuell && (
                              <div className="col-span-2">
                                <Felt label="Årsmodell">
                                  <SimpleSelect
                                    value={kolle.aarsmodell ?? ''}
                                    onValueChange={(v) =>
                                      oppdaterKolle(kolle.id, { aarsmodell: v })
                                    }
                                    placeholder="Ukjent / ikke oppgitt"
                                    options={AARSMODELL_VALG}
                                    className="max-w-xs"
                                  />
                                </Felt>
                              </div>
                            )}

                            {harSkaft && (
                              <>
                                <div className="col-span-2">
                                  <Felt label="Hånd" required>
                                    <PillToggle
                                      options={[
                                        { value: 'right', label: 'Høyre' },
                                        { value: 'left', label: 'Venstre' },
                                      ]}
                                      value={kolle.hand ?? null}
                                      onChange={(v) => oppdaterKolle(kolle.id, { hand: v })}
                                    />
                                  </Felt>
                                </div>

                                {harLoft && (
                                  <div className="col-span-2">
                                    <Felt label="Loft">
                                      <PillToggle
                                        options={DRIVER_LOFT_OPTIONS.map((l) => ({
                                          value: l,
                                          label: l,
                                        }))}
                                        value={kolle.loft ?? null}
                                        onChange={(v) => oppdaterKolle(kolle.id, { loft: v })}
                                      />
                                    </Felt>
                                  </div>
                                )}

                                <div className="col-span-2">
                                  <Felt label="Skaftmodell">
                                    <SkaftSokDb
                                      category={SHAFT_KATEGORI_MAP[kolle.kategori] ?? 'iron'}
                                      placeholder="Søk etter skaft…"
                                      value={kolle.selectedSkaft ?? null}
                                      onChange={(val) =>
                                        oppdaterKolle(kolle.id, {
                                          selectedSkaft: val ?? undefined,
                                          skaftModell: val
                                            ? `${val.brand} ${val.model}`.trim()
                                            : undefined,
                                          shaftFlex: undefined,
                                        })
                                      }
                                    />
                                  </Felt>
                                </div>

                                {kolle.selectedSkaft && (
                                  <div className="col-span-2">
                                    <Felt label="Shaft flex">
                                      <PillToggle
                                        options={SHAFT_FLEX_OPTIONS}
                                        value={kolle.shaftFlex ?? null}
                                        onChange={(v) => oppdaterKolle(kolle.id, { shaftFlex: v })}
                                      />
                                    </Felt>
                                  </div>
                                )}
                              </>
                            )}

                            {harHeadcover && (
                              <div className="col-span-2">
                                <Felt label="Original headcover" required>
                                  <PillToggle
                                    options={[
                                      { value: 'true', label: 'Ja' },
                                      { value: 'false', label: 'Nei' },
                                    ]}
                                    value={
                                      kolle.headcover === true
                                        ? 'true'
                                        : kolle.headcover === false
                                          ? 'false'
                                          : null
                                    }
                                    onChange={(v) =>
                                      oppdaterKolle(kolle.id, { headcover: v === 'true' })
                                    }
                                  />
                                </Felt>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </>
          )
        })()

      case 'bilder':
        return (
          <>
            <CardHeader>
              <CardTitle>Bilder</CardTitle>
              <CardDescription>Annonser med bilder får langt flere henvendelser</CardDescription>
            </CardHeader>
            <CardContent>
              <BildeOpplaster {...bildeOpplasterProps} />
            </CardContent>
          </>
        )

      case 'tilstand':
        return (
          <>
            <CardHeader>
              <CardTitle>Tilstand</CardTitle>
              <CardDescription>Velg tilstandsgrad og beskriv eventuell slitasje</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 flex items-center gap-1.5">
                  Tilstandsgrad
                  <span className="text-red-500">*</span>
                  {aiFields.has('tilstand') && <AiBadge />}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {TILSTANDER.map((t, i) => (
                    <motion.button
                      key={t.value}
                      type="button"
                      onClick={() => setTilstand(t.value)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: 0.05 * i, duration: 0.25 },
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
                    </motion.button>
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
            </CardContent>
          </>
        )

      case 'pris':
        return (
          <>
            <CardHeader>
              <CardTitle>Pris og logistikk</CardTitle>
              <CardDescription>Sett pris og velg om du tilbyr frakt</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </>
        )

      default:
        return null
    }
  }

  const erSisteSteg = currentStep === steg.length - 1

  // ── Render ───────────────────────────────────────────────────────────────

  const formInnhold = (
    <>
      <Fremdrift steg={[...steg]} currentStep={currentStep} onGaTil={gaTil} />

      <form onSubmit={(e) => e.preventDefault()}>
        <Card className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderStegInnhold()}
            </motion.div>
          </AnimatePresence>

          <CardFooter className="border-border justify-between gap-3 border-t pt-5 pb-5">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="rounded-xl"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Tilbake
              </Button>
            </motion.div>

            <span className="text-muted-foreground font-mono text-xs">
              Steg {currentStep + 1} av {steg.length}
            </span>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              {erSisteSteg ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() =>
                    void handleSubmit(onSubmit, () => toast.error('Fyll inn alle påkrevde felt.'))()
                  }
                  disabled={!isStegGyldig() || isSubmitting}
                  className="rounded-xl"
                >
                  {isSubmitting ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      {redigerModus ? 'Lagrer…' : 'Publiserer…'}
                    </>
                  ) : (
                    <>
                      {redigerModus ? 'Lagre endringer' : 'Publiser annonse'}
                      <CheckIcon className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={nextStep}
                  disabled={!isStegGyldig()}
                  className="rounded-xl"
                >
                  Neste
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          </CardFooter>
        </Card>
      </form>
    </>
  )

  if (modalModus) return formInnhold

  return (
    <section className="px-20 py-12">
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          {redigerModus ? 'Rediger annonse' : 'Legg ut utstyr'}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {redigerModus
            ? 'Gjør endringer og lagre annonsen.'
            : 'Fyll ut skjemaet under for å legge ut en annonse – helt gratis.'}
        </p>
      </div>

      <div className="max-w-2xl">{formInnhold}</div>
    </section>
  )
}
