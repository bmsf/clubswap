'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
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
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  PhotoIcon,
} from '@heroicons/react/16/solid'
import { createClient } from '@/supabase/client'
import { publiserAnnonse, oppdaterAnnonse } from '@/app/(app)/selg/actions'

import {
  schema,
  type FormData,
  type Category,
  type Condition,
  ALLE_STEG_CREATE,
  ALLE_STEG_REDIGER,
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
  type UiKategori,
  type NyTilstand,
  UI_KATEGORI_OPTIONS,
  UNDERKATEGORI_OPTIONS,
  uiKategoriTilDb,
  kategoriTilUiKategori,
  NY_TILSTANDER,
  PRIS_ANBEFALINGER,
  GOLF_MERKER,
  NY_FLEX_OPTIONS,
  HOSEL_OPTIONS,
  JERN_KOLLER_OPTIONS,
  SKAFT_MATERIALE_OPTIONS,
  SKAFT_LENGDE_OPTIONS,
  HAND_OPTIONS,
  loftOptionerForDb,
  formaterKoller,
} from './selg-utstyr/constants'
import {
  BildeOpplaster,
  type BildeEntry,
  fileToBase64,
  validerFiler,
} from './selg-utstyr/bilde-opplaster'
import { Felt, PillToggle, AiBadge } from './selg-utstyr/primitives'
import { Fremdrift } from './selg-utstyr/fremdrift'
import { ModellVelger, type ValgtModell } from './selg-utstyr/modell-velger'
import { SkaftVelger, type ValgtSkaft } from './selg-utstyr/skaft-velger'
import { AdresseVelger } from './selg-utstyr/adresse-velger'
import { type Adresse } from '@/app/actions/adresser'

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

const fieldVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
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

// Wizard nav-knapper: samme stil som root Button, men større padding
const NAV_KNAPP_KLASSE = 'px-[calc(--spacing(5)-1px)] py-[calc(--spacing(2.5)-1px)]'

// Suksess-overlegg ved publisering — success-check (transitions.dev)
function PubliseringSuksess() {
  const pathRef = useRef<SVGPathElement>(null)
  const [state, setState] = useState<'out' | 'in'>('out')

  useEffect(() => {
    const path = pathRef.current
    if (path) {
      const len = Math.ceil(path.getTotalLength())
      path.style.strokeDasharray = String(len)
      path.style.strokeDashoffset = String(len)
    }
    // Neste frame: flip til «in» så strek-tegningen starter fra offset
    const id = requestAnimationFrame(() => setState('in'))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="bg-card/95 absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
      <span className="t-success-check" data-state={state} aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" className="size-16">
          <path
            ref={pathRef}
            d="M13 24.5 L21 32 L35 16"
            stroke="#16a34a"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="text-foreground text-base font-semibold">Annonsen er publisert!</p>
    </div>
  )
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

  const steg = redigerModus ? [...ALLE_STEG_REDIGER] : [...ALLE_STEG_CREATE]

  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)

  // ── Shared state ──────────────────────────────────────────────────────────

  const [mode, setMode] = useState<'ai' | 'manual' | null>(redigerModus ? 'manual' : null)
  const [bilder, setBilder] = useState<BildeEntry[]>([])
  const [eksisterendeBilder, setEksisterendeBilder] = useState<string[]>(initBilder)
  const [analyserer, setAnalyserer] = useState(false)
  const [aiFields, setAiFields] = useState<Set<string>>(new Set())

  // ── Edit mode state ───────────────────────────────────────────────────────

  const [kategori, setKategori] = useState<Category | null>(initialKategori ?? null)
  const [tilstand, setTilstand] = useState<Condition | null>(initialTilstand ?? null)

  // ── New create mode state ─────────────────────────────────────────────────

  const [listemetode, setListemetode] = useState<'selg' | 'bytt'>('selg')
  const [uiKategori, setUiKategori] = useState<UiKategori | null>(null)
  const [underkategori, setUnderkategori] = useState<string | null>(null)
  const [tittel, setTittel] = useState('')
  const [merke, setMerke] = useState('')
  const [merkeOpen, setMerkeOpen] = useState(false)
  const [valgtModell, setValgtModell] = useState<ValgtModell | null>(null)
  const [manuellModell, setManuellModell] = useState(false)
  const [flex, setFlex] = useState<string | null>(null)
  const [skaftValg, setSkaftValg] = useState<'uten' | 'ukjent' | 'kjent'>('ukjent')
  const [valgtSkaft, setValgtSkaft] = useState<ValgtSkaft | null>(null)
  const [valgteKoller, setValgteKoller] = useState<string[]>([])
  const [loft, setLoft] = useState('')
  const [headcover, setHeadcover] = useState<boolean | null>(null)
  const [nyHaandighet, setNyHaandighet] = useState<'right' | 'left' | null>(null)
  const [nySkaftMateriale, setNySkaftMateriale] = useState<'graphite' | 'steel' | null>(null)
  const [skaftLengde, setSkaftLengde] = useState('')
  const [skaftLengdeCustom, setSkaftLengdeCustom] = useState('')
  const [nyAarsmodell, setNyAarsmodell] = useState('')
  const [putterLengde, setPutterLengde] = useState('')
  const [hoselType, setHoselType] = useState<string | null>(null)
  const [skoStorrelse, setSkoStorrelse] = useState('')
  const [piggType, setPiggType] = useState<'soft' | 'fast' | null>(null)
  const [nyTilstand, setNyTilstand] = useState<NyTilstand | null>(null)
  const [beskrivelse, setBeskrivelse] = useState('')
  const [adresseCreate, setAdresseCreate] = useState<Adresse | null>(null)
  const [pris, setPris] = useState('')
  const [kanSendes, setKanSendes] = useState(false)
  const [kanMotes, setKanMotes] = useState(false)
  const [isSubmittingNy, setIsSubmittingNy] = useState(false)
  const [publisert, setPublisert] = useState(false)

  // ── Navigation guard ──────────────────────────────────────────────────────
  const [pendingNavHref, setPendingNavHref] = useState<string | null>(null)
  // Settes når draft-gjenoppretting er ferdig, slik at vi kan ta en baseline.
  const [restoreComplete, setRestoreComplete] = useState(false)
  // Baseline = skjematilstanden slik den var ved innlasting (gjenopprettet utkast
  // eller tomme defaults). Brukes til å skille faktisk input fra gjenoppretting.
  const [baseline, setBaseline] = useState<string | null>(null)

  // Vis valideringsfeil etter første «Neste»-forsøk på et steg
  const [visFeil, setVisFeil] = useState(false)

  // ── React Hook Form (edit mode) ───────────────────────────────────────────

  const {
    register,
    control,
    handleSubmit,
    getValues,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { tilbyrFrakt: false, selgesFra: '', ...initialData },
  })

  // ── localStorage: restore draft on mount ─────────────────────────────────

  useEffect(() => {
    if (redigerModus) return
    try {
      const saved = localStorage.getItem('golftorget_listing_draft')
      if (!saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRestoreComplete(true)
        return
      }
      const d = JSON.parse(saved) as Record<string, unknown>
      if (d.mode === 'manual' || d.mode === 'ai') setMode(d.mode)
      if (d.listemetode === 'selg' || d.listemetode === 'bytt') setListemetode(d.listemetode)
      if (typeof d.uiKategori === 'string') setUiKategori(d.uiKategori as UiKategori)
      if (d.underkategori === null || typeof d.underkategori === 'string')
        setUnderkategori(d.underkategori as string | null)
      if (typeof d.tittel === 'string') setTittel(d.tittel)
      if (typeof d.merke === 'string') setMerke(d.merke)
      if (d.flex === null || typeof d.flex === 'string') setFlex(d.flex as string | null)
      if (d.skaftValg === 'uten' || d.skaftValg === 'ukjent' || d.skaftValg === 'kjent')
        setSkaftValg(d.skaftValg)
      if (d.valgtSkaft && typeof d.valgtSkaft === 'object')
        setValgtSkaft(d.valgtSkaft as ValgtSkaft)
      if (Array.isArray(d.valgteKoller)) setValgteKoller(d.valgteKoller as string[])
      if (typeof d.loft === 'string') setLoft(d.loft)
      if (typeof d.headcover === 'boolean' || d.headcover === null)
        setHeadcover(d.headcover as boolean | null)
      if (d.nyHaandighet === 'right' || d.nyHaandighet === 'left' || d.nyHaandighet === null)
        setNyHaandighet(d.nyHaandighet as 'right' | 'left' | null)
      if (
        d.nySkaftMateriale === 'graphite' ||
        d.nySkaftMateriale === 'steel' ||
        d.nySkaftMateriale === null
      )
        setNySkaftMateriale(d.nySkaftMateriale as 'graphite' | 'steel' | null)
      if (typeof d.skaftLengde === 'string') setSkaftLengde(d.skaftLengde)
      if (typeof d.skaftLengdeCustom === 'string') setSkaftLengdeCustom(d.skaftLengdeCustom)
      if (typeof d.nyAarsmodell === 'string') setNyAarsmodell(d.nyAarsmodell)
      if (typeof d.putterLengde === 'string') setPutterLengde(d.putterLengde)
      if (d.hoselType === null || typeof d.hoselType === 'string')
        setHoselType(d.hoselType as string | null)
      if (typeof d.skoStorrelse === 'string') setSkoStorrelse(d.skoStorrelse)
      if (d.piggType === 'soft' || d.piggType === 'fast' || d.piggType === null)
        setPiggType(d.piggType as 'soft' | 'fast' | null)
      const validTilstander: NyTilstand[] = ['ny', 'utmerket', 'god', 'akseptabel']
      if (validTilstander.includes(d.nyTilstand as NyTilstand))
        setNyTilstand(d.nyTilstand as NyTilstand)
      if (typeof d.pris === 'string') setPris(d.pris)
      if (typeof d.kanSendes === 'boolean') setKanSendes(d.kanSendes)
      if (typeof d.kanMotes === 'boolean') setKanMotes(d.kanMotes)
      if (typeof d.beskrivelse === 'string') setBeskrivelse(d.beskrivelse)
      if (d.adresseCreate && typeof d.adresseCreate === 'object')
        setAdresseCreate(d.adresseCreate as Adresse)
    } catch {
      // ignore
    }
    setRestoreComplete(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Draft snapshot (persisted + used for dirty detection) ─────────────────

  const draftSnapshot = useMemo(
    () => ({
      mode,
      listemetode,
      uiKategori,
      underkategori,
      tittel,
      merke,
      flex,
      skaftValg,
      valgtSkaft,
      valgteKoller,
      loft,
      headcover,
      nyHaandighet,
      nySkaftMateriale,
      skaftLengde,
      skaftLengdeCustom,
      nyAarsmodell,
      putterLengde,
      hoselType,
      skoStorrelse,
      piggType,
      nyTilstand,
      beskrivelse,
      adresseCreate,
      pris,
      kanSendes,
      kanMotes,
    }),
    [
      mode,
      listemetode,
      uiKategori,
      underkategori,
      tittel,
      merke,
      flex,
      skaftValg,
      valgtSkaft,
      valgteKoller,
      loft,
      headcover,
      nyHaandighet,
      nySkaftMateriale,
      skaftLengde,
      skaftLengdeCustom,
      nyAarsmodell,
      putterLengde,
      hoselType,
      skoStorrelse,
      piggType,
      nyTilstand,
      beskrivelse,
      adresseCreate,
      pris,
      kanSendes,
      kanMotes,
    ]
  )
  const draftString = useMemo(() => JSON.stringify(draftSnapshot), [draftSnapshot])
  // Dirty comparison ignores `mode` — picking AI/manual on steg 1 is ikke «data».
  // `mode: undefined` → JSON.stringify dropper nøkkelen, så metodevalg teller ikke.
  const dirtyString = useMemo(
    () => JSON.stringify({ ...draftSnapshot, mode: undefined }),
    [draftSnapshot]
  )

  // ── localStorage: save on every change ───────────────────────────────────

  useEffect(() => {
    if (redigerModus) return
    localStorage.setItem('golftorget_listing_draft', draftString)
  }, [redigerModus, draftString])

  // ── Dirty-tracking: protect only after faktisk input denne økten ──────────

  // Ta baseline på første render etter at gjenoppretting er ferdig (da ligger
  // de gjenopprettede verdiene i dirtyString).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (restoreComplete && baseline === null) setBaseline(dirtyString)
  }, [restoreComplete, baseline, dirtyString])

  // valgtModell og bilder gjenopprettes aldri → ikke-tom verdi = input denne økten.
  const hasInteractedThisSession =
    baseline !== null && (dirtyString !== baseline || valgtModell !== null || bilder.length > 0)
  const hasUnsavedProgress = !redigerModus && hasInteractedThisSession

  // ── Navigation guard effects ──────────────────────────────────────────────

  useEffect(() => {
    if (!hasUnsavedProgress) return

    // Browser refresh / tab close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    // In-app link clicks — capture phase so we run before Next.js
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href') ?? ''
      // Ignore hash-only, external, and same-page links
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto'))
        return
      if (href === window.location.pathname) return
      e.preventDefault()
      e.stopPropagation()
      setPendingNavHref(href)
    }
    document.addEventListener('click', handleClick, true)

    // Back / forward button
    const handlePopState = () => {
      // Push the current state back so the URL doesn't change yet
      history.pushState(null, '', window.location.href)
      setPendingNavHref('__back__')
    }
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [hasUnsavedProgress])

  function confirmLeave() {
    localStorage.removeItem('golftorget_listing_draft')
    const href = pendingNavHref
    setPendingNavHref(null)
    if (href === '__back__') {
      history.back()
    } else if (href) {
      router.push(href)
    }
  }

  function saveDraftAndLeave() {
    // Draft is already auto-saved to localStorage; just navigate
    const href = pendingNavHref
    setPendingNavHref(null)
    if (href === '__back__') {
      history.back()
    } else if (href) {
      router.push(href)
    }
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  function gaTil(i: number) {
    setDirection(i > currentStep ? 1 : -1)
    setCurrentStep(i)
    setVisFeil(false)
    clearErrors()
  }

  // Vis feil: rull til første feilfelt og spill av en «rystelse» (transitions.dev)
  function visFeilOgRyst() {
    setVisFeil(true)
    requestAnimationFrame(() => {
      const felt = document.querySelectorAll<HTMLElement>('[data-feil="true"]')
      felt.forEach((el) => {
        el.classList.remove('t-felt-shake')
        void el.offsetWidth // tving reflow så animasjonen starter på nytt
        el.classList.add('t-felt-shake')
        setTimeout(() => el.classList.remove('t-felt-shake'), 320)
      })
      felt[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  function nextStep() {
    // Create-modus: valider gjeldende steg og vis inline-feil i stedet for å låse knappen
    if (!redigerModus) {
      const feil = validerSteg(steg[currentStep]?.id ?? '')
      if (Object.keys(feil).length > 0) {
        visFeilOgRyst()
        return
      }
    }
    if (!redigerModus && steg[currentStep]?.id === 'metode' && mode === 'ai') {
      const detaljerIdx = steg.findIndex((s) => s.id === 'detaljer')
      gaTil(detaljerIdx >= 0 ? detaljerIdx : currentStep + 1)
    } else if (!redigerModus && steg[currentStep]?.id === 'metode' && mode === 'manual') {
      setUiKategori(null)
      setUnderkategori(null)
      setTittel('')
      gaTil(currentStep + 1)
    } else if (currentStep < steg.length - 1) {
      gaTil(currentStep + 1)
    }
  }

  function prevStep() {
    if (!redigerModus && steg[currentStep]?.id === 'detaljer' && mode === 'ai') {
      const metodeIdx = steg.findIndex((s) => s.id === 'metode')
      gaTil(metodeIdx >= 0 ? metodeIdx : currentStep - 1)
    } else if (currentStep > 0) {
      gaTil(currentStep - 1)
    }
  }

  // ── Step validation ──────────────────────────────────────────────────────

  function isStegGyldig(): boolean {
    if (redigerModus) {
      switch (steg[currentStep]?.id) {
        case 'kategori':
          return kategori !== null
        case 'utstyr': {
          const { merke: m, modell } = getValues()
          return (m?.trim() ?? '') !== '' && (modell?.trim() ?? '') !== ''
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
    switch (steg[currentStep]?.id as string) {
      case 'metode':
        return mode !== null
      case 'kategori':
        return valgtModell !== null || (uiKategori !== null && tittel.trim().length >= 3)
      case 'intro':
        return tittel.trim().length >= 3 && uiKategori !== null
      case 'detaljer': {
        if (!nyTilstand) return false
        const harSkaft =
          uiKategori === 'jernshaft' || uiKategori === 'trekker' || uiKategori === 'wedge'
        const harHand = harSkaft || uiKategori === 'putter'
        const dbKat = uiKategori ? uiKategoriTilDb(uiKategori, underkategori) : null
        const loftKreves = dbKat ? loftOptionerForDb(dbKat) !== null : false
        if (harSkaft && skaftValg !== 'uten' && (!nySkaftMateriale || !flex)) return false
        if (harHand && !nyHaandighet) return false
        if (loftKreves && !loft) return false
        return true
      }
      case 'pris':
        return true
      default:
        return true
    }
  }

  // Create-modus: returnerer { feltnøkkel: melding } for manglende påkrevde felt
  function validerSteg(stepId: string): Record<string, string> {
    const f: Record<string, string> = {}
    switch (stepId) {
      case 'metode':
        if (!mode) f.metode = 'Velg hvordan du vil opprette annonsen'
        break
      case 'kategori':
        if (valgtModell) break
        if (manuellModell) {
          if (!uiKategori && !underkategori) f.kategori = 'Velg kategori'
          if (tittel.trim().length < 3) f.tittel = 'Fyll inn tittel (minst 3 tegn)'
          if (!merke.trim()) f.merke = 'Fyll inn merke'
        } else {
          f.modell = 'Søk og velg en modell, eller gå til manuell registrering'
        }
        break
      case 'detaljer': {
        if (tittel.trim().length < 3) f.tittel = 'Fyll inn tittel'
        if (!merke.trim()) f.merke = 'Fyll inn merke'
        const harSkaft =
          uiKategori === 'jernshaft' || uiKategori === 'trekker' || uiKategori === 'wedge'
        const harHand = harSkaft || uiKategori === 'putter'
        const dbKat = uiKategori ? uiKategoriTilDb(uiKategori, underkategori) : null
        const loftKreves = dbKat ? loftOptionerForDb(dbKat) !== null : false
        if (harHand && !nyHaandighet) f.handighet = 'Velg håndighet'
        if (loftKreves && !loft) f.loft = 'Velg loft / type'
        if (harSkaft && skaftValg !== 'uten' && !nySkaftMateriale)
          f.skaftmateriale = 'Velg skaftmateriale'
        if (harSkaft && skaftValg !== 'uten' && !flex) f.flex = 'Velg flex'
        if (!nyTilstand) f.tilstand = 'Velg tilstand'
        break
      }
      case 'pris':
        if (!pris || parseInt(pris) <= 0) f.pris = 'Fyll inn en gyldig pris'
        break
    }
    return f
  }

  // Aktive feil for et steg (kun etter første «Neste»-forsøk)
  function feilFor(stepId: string): Record<string, string> {
    return visFeil ? validerSteg(stepId) : {}
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

  // ── Model selection (model-database-driven flow) ─────────────────────────

  // DB categories that map directly to UiKategori (no Category type equivalent)
  const DIRECT_UI_MAP: Partial<Record<string, { ui: UiKategori; underkat: string | null }>> = {
    baller: { ui: 'baller', underkat: null },
  }

  // Normalise DB category strings from golf_equipment to the canonical Category type
  function normaliserKategori(cat: string): Parameters<typeof kategoriTilUiKategori>[0] {
    const map: Record<string, Parameters<typeof kategoriTilUiKategori>[0]> = {
      iron: 'iron_set',
      irons: 'iron_set',
      jernsett: 'iron_set',
      fairway: 'fairway_wood',
      bag: 'golf_bag',
      stand_bag: 'golf_bag',
      cart_bag: 'golf_bag',
      shoes: 'golf_shoes',
      sko: 'golf_shoes',
      annet: 'other',
    }
    return (map[cat] ?? cat) as Parameters<typeof kategoriTilUiKategori>[0]
  }

  function velgModell(modell: ValgtModell | null) {
    setValgtModell(modell)
    if (!modell) return
    const direct = DIRECT_UI_MAP[modell.category]
    if (direct) {
      setUiKategori(direct.ui)
      setUnderkategori(direct.underkat)
    } else {
      const mapped = kategoriTilUiKategori(normaliserKategori(modell.category))
      if (mapped) {
        setUiKategori(mapped.ui)
        setUnderkategori(mapped.underkat)
      }
    }
    setMerke(modell.brand)
    setTittel(`${modell.brand} ${modell.model}`)
  }

  async function analyserNy(file: File) {
    setAnalyserer(true)
    try {
      const res = await fetch('/api/analyze-equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: await fileToBase64(file), mediaType: file.type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'API-kall feilet')

      const filled = new Set<string>()

      if (data.category) {
        const { ui, underkat } = kategoriTilUiKategori(data.category as Category)
        setUiKategori(ui)
        setUnderkategori(underkat)
        filled.add('kategori')
      }
      if (data.brand) {
        setMerke(data.brand as string)
        filled.add('merke')
      }
      if (data.model) {
        const suggested = data.brand
          ? `${data.brand as string} ${data.model as string}`.trim()
          : (data.model as string)
        setTittel(suggested)
        filled.add('tittel')
      }
      if (data.condition_estimate) {
        const condMap: Record<string, NyTilstand> = {
          ny: 'ny',
          meget_god: 'utmerket',
          god: 'god',
          akseptabel: 'akseptabel',
        }
        const mapped = condMap[data.condition_estimate as string]
        if (mapped) {
          setNyTilstand(mapped)
          filled.add('tilstand')
        }
      }
      if (data.shaft_flex) {
        setFlex(data.shaft_flex as string)
        filled.add('flex')
      }
      if (data.shaft_type) {
        setSkaftValg('kjent')
      }
      if (data.loft) {
        setLoft(String(data.loft as number))
        filled.add('loft')
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

  // ── New create mode submit ────────────────────────────────────────────────

  // Publiser-knapp: vis inline pris-feil i stedet for å låse knappen
  function forsokPubliser() {
    const feil = validerSteg('pris')
    if (Object.keys(feil).length > 0) {
      visFeilOgRyst()
      return
    }
    void submitNy()
  }

  async function submitNy() {
    if (!uiKategori) {
      toast.error('Velg kategori.')
      return
    }
    if (!nyTilstand) {
      toast.error('Velg tilstand i Detaljer-steget.')
      return
    }
    if (!pris || parseInt(pris) <= 0) {
      toast.error('Fyll inn pris.')
      return
    }

    setIsSubmittingNy(true)
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
        setIsSubmittingNy(false)
        return
      }
      const { data: urlData } = supabase.storage.from('annonse-bilder').getPublicUrl(path)
      nyeBildeUrls.push(urlData.publicUrl)
    }

    const skaftLengdeVerdi =
      skaftValg !== 'uten'
        ? skaftLengde === 'custom'
          ? skaftLengdeCustom.trim() || undefined
          : skaftLengde || undefined
        : undefined

    const payload = {
      kategori: uiKategoriTilDb(uiKategori, underkategori),
      merke: valgtModell ? valgtModell.brand : merke || 'Ukjent',
      modell: valgtModell ? valgtModell.model : tittel || merke || 'Ukjent',
      tilstand: nyTilstand,
      beskrivelse: beskrivelse.trim() || undefined,
      pris: parseInt(pris),
      selgesFra: adresseCreate?.poststed ?? '',
      tilbyrFrakt: kanSendes,
      bilder: nyeBildeUrls,
      ...(skaftValg !== 'uten' && flex ? { shaftFlex: flex } : {}),
      ...(skaftValg === 'kjent' && valgtSkaft
        ? { skaftMerke: valgtSkaft.brand, skaftModell: valgtSkaft.model }
        : {}),
      ...(skaftLengdeVerdi ? { skaftLengde: skaftLengdeVerdi } : {}),
      ...(loft ? { loft } : {}),
      ...(headcover !== null ? { headcover } : {}),
      ...(valgteKoller.length > 0 ? { koller: valgteKoller } : {}),
      ...(nyHaandighet ? { haandighet: nyHaandighet } : {}),
      ...(nySkaftMateriale ? { skaftMateriale: nySkaftMateriale } : {}),
      ...(uiKategori === 'baller' && nyAarsmodell ? { aarsmodell: nyAarsmodell } : {}),
      ...(putterLengde ? { putterLengde } : {}),
      ...(hoselType ? { hoselType } : {}),
      ...(skoStorrelse ? { skoStorrelse } : {}),
      ...(piggType ? { piggType } : {}),
      kanMotes,
    }

    try {
      const result = await publiserAnnonse(payload)
      if ('feil' in result) {
        toast.error(result.feil)
        return
      }
      localStorage.removeItem('golftorget_listing_draft')
      setPublisert(true) // viser suksess-animasjon før omdirigering
      setTimeout(() => router.push('/annonser'), 1700)
    } finally {
      setIsSubmittingNy(false)
    }
  }

  // ── Edit mode submit ──────────────────────────────────────────────────────

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
    // Lagre tilstand som kode (konsistent med ny-flyten): meget_god → utmerket
    const tilstandKode = tilstand === 'meget_god' ? 'utmerket' : (tilstand ?? undefined)

    if (!kategori) {
      toast.error('Velg en kategori.')
      return
    }

    const payload = {
      kategori: CATEGORY_TO_DB[kategori],
      merke: data.merke,
      modell: data.modell,
      aarsmodell: data.aarsmodell,
      haandighet: data.hand === 'right' ? 'right' : data.hand === 'left' ? 'left' : undefined,
      loft: data.loft,
      shaftFlex: data.shaftFlex,
      skaftMateriale:
        data.skaftType === 'steel'
          ? 'steel'
          : data.skaftType === 'graphite'
            ? 'graphite'
            : undefined,
      tilstand: tilstandKode,
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
  }

  // ── Create mode phase renderers ───────────────────────────────────────────

  const bildeOpplasterProps = {
    bilder,
    eksisterendeBilder,
    onLeggTil: leggTilFiler,
    onFjern: fjernBilde,
    onFjernEksisterende: fjernEksisterende,
  }

  const TITTEL_MAKS = 60

  function renderMetodeFase() {
    return (
      <>
        <CardHeader>
          <CardTitle>Hvordan vil du opprette annonsen?</CardTitle>
          <CardDescription>Velg om du vil la AI hjelpe deg eller fylle inn selv</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={cn(
              'w-full cursor-pointer rounded-2xl border-2 p-5 text-left transition-all',
              mode === 'ai'
                ? 'border-foreground bg-foreground/5'
                : 'hover:border-foreground/40 border-border'
            )}
          >
            <div className="flex items-start gap-4">
              <div className="bg-muted dark:bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl">
                <SparklesIcon className="text-muted-foreground dark:text-muted-foreground size-5" />
              </div>
              <div>
                <p className="font-semibold">Bruk AI</p>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  Last opp et bilde og la AI fylle ut detaljer automatisk
                </p>
              </div>
              {mode === 'ai' && <CheckIcon className="text-foreground ml-auto size-5 shrink-0" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('manual')}
            className={cn(
              'w-full cursor-pointer rounded-2xl border-2 p-5 text-left transition-all',
              mode === 'manual'
                ? 'border-foreground bg-foreground/5'
                : 'hover:border-foreground/40 border-border'
            )}
          >
            <div className="flex items-start gap-4">
              <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl">
                <PhotoIcon className="text-muted-foreground size-5" />
              </div>
              <div>
                <p className="font-semibold">Fyll inn manuelt</p>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  Fyll ut alle felt selv, trinn for trinn
                </p>
              </div>
              {mode === 'manual' && (
                <CheckIcon className="text-foreground ml-auto size-5 shrink-0" />
              )}
            </div>
          </button>
        </CardContent>
      </>
    )
  }

  const KATEGORI_CREATE_OPTIONS = [
    { value: 'driver', label: 'Driver' },
    { value: 'fairway', label: 'Fairway wood' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'jernsett', label: 'Jernsett' },
    { value: 'enkelt_jern', label: 'Enkelt jern' },
    { value: 'wedge', label: 'Wedge' },
    { value: 'putter', label: 'Putter' },
    { value: 'bag', label: 'Bag' },
    { value: 'sko', label: 'Sko' },
    { value: 'annet', label: 'Annet' },
  ] as const

  type KategoriCreateValue = (typeof KATEGORI_CREATE_OPTIONS)[number]['value']

  const KATEGORI_CREATE_TO_UI: Record<KategoriCreateValue, UiKategori> = {
    driver: 'trekker',
    fairway: 'trekker',
    hybrid: 'trekker',
    jernsett: 'jernshaft',
    enkelt_jern: 'jernshaft',
    wedge: 'wedge',
    putter: 'putter',
    bag: 'bag',
    sko: 'sko',
    annet: 'annet',
  }

  function renderKategoriFase() {
    const selectedKat = KATEGORI_CREATE_OPTIONS.find((o) => o.value === underkategori)?.value ?? ''
    const aktiveFeil = feilFor('kategori')

    const TITTEL_MAKS_KAT = 60

    return (
      <>
        <CardHeader>
          <CardTitle>Hva selger du?</CardTitle>
          <CardDescription>
            Søk etter modell og velg kategori. <span className="text-destructive">*</span> = påkrevd
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            {!manuellModell ? (
              <motion.div
                key="modell-sok"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div data-feil={aktiveFeil.modell ? 'true' : undefined}>
                  <ModellVelger
                    value={valgtModell}
                    onChange={velgModell}
                    onManuell={() => {
                      setValgtModell(null)
                      setManuellModell(true)
                    }}
                  />
                </div>
                {aktiveFeil.modell && (
                  <p className="text-destructive mt-2 text-xs">{aktiveFeil.modell}</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="manuell"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Manuell registrering</p>
                  <button
                    type="button"
                    onClick={() => setManuellModell(false)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer text-xs underline underline-offset-2 transition-colors"
                  >
                    Søk i modellbase
                  </button>
                </div>

                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5">
                    Kategori<span className="text-destructive">*</span>
                  </Label>
                  {(aktiveFeil.kategori || aktiveFeil.modell) && (
                    <p className="text-destructive mb-1.5 text-xs">
                      {aktiveFeil.kategori ?? aktiveFeil.modell}
                    </p>
                  )}
                  <div data-feil={aktiveFeil.kategori || aktiveFeil.modell ? 'true' : undefined}>
                    <SimpleSelect
                      value={selectedKat}
                      onValueChange={(v) => {
                        const kat = v as KategoriCreateValue
                        setUiKategori(KATEGORI_CREATE_TO_UI[kat])
                        setUnderkategori(kat)
                      }}
                      placeholder="Velg kategori"
                      options={[...KATEGORI_CREATE_OPTIONS]}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {uiKategori !== null && (
                    <motion.div
                      key="tittel"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="space-y-1"
                    >
                      <Label className="flex items-center gap-1.5">
                        Tittel<span className="text-destructive">*</span>
                      </Label>
                      {aktiveFeil.tittel && (
                        <p className="text-destructive text-xs">{aktiveFeil.tittel}</p>
                      )}
                      <Input
                        value={tittel}
                        onChange={(e) => setTittel(e.target.value.slice(0, TITTEL_MAKS_KAT))}
                        placeholder="f.eks. TaylorMade Stealth 2 Driver"
                        autoFocus
                        data-feil={aktiveFeil.tittel ? 'true' : undefined}
                      />
                      <p className="text-muted-foreground text-xs">
                        {tittel.length}/{TITTEL_MAKS_KAT} tegn
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {tittel.trim().length >= 3 && (
                    <motion.div
                      key="merke"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="space-y-1"
                    >
                      <Label className="flex items-center gap-1.5">
                        Merke<span className="text-destructive">*</span>
                      </Label>
                      {aktiveFeil.merke && (
                        <p className="text-destructive text-xs">{aktiveFeil.merke}</p>
                      )}
                      <div className="relative" data-feil={aktiveFeil.merke ? 'true' : undefined}>
                        <Input
                          value={merke}
                          onChange={(e) => setMerke(e.target.value)}
                          onFocus={() => setMerkeOpen(true)}
                          onBlur={() => setTimeout(() => setMerkeOpen(false), 150)}
                          placeholder="Søk etter merke…"
                        />
                        <AnimatePresence>
                          {merkeOpen &&
                            GOLF_MERKER.filter(
                              (m) =>
                                merke.trim() === '' || m.toLowerCase().includes(merke.toLowerCase())
                            ).length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="border-border bg-card absolute top-full right-0 left-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border shadow-lg"
                              >
                                {GOLF_MERKER.filter(
                                  (m) =>
                                    merke.trim() === '' ||
                                    m.toLowerCase().includes(merke.toLowerCase())
                                ).map((m) => (
                                  <button
                                    key={m}
                                    type="button"
                                    onMouseDown={() => {
                                      setMerke(m)
                                      setMerkeOpen(false)
                                    }}
                                    className="hover:bg-muted flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm transition-colors"
                                  >
                                    {m}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </>
    )
  }

  function renderIntroFase() {
    const harUnderkat = uiKategori !== null && (UNDERKATEGORI_OPTIONS[uiKategori]?.length ?? 0) > 0

    return (
      <>
        <CardHeader>
          <CardTitle>Hva skal du selge?</CardTitle>
        </CardHeader>
        <CardContent className="divide-border space-y-0 divide-y px-6">
          {/* Tittel */}
          <div className="pb-6">
            <div className="bg-muted rounded-2xl px-4 py-3">
              <p className="text-muted-foreground mb-1 text-xs">Tittel</p>
              <input
                value={tittel}
                onChange={(e) => setTittel(e.target.value.slice(0, TITTEL_MAKS))}
                placeholder="f.eks. TaylorMade Stealth 2 Driver"
                className="text-foreground placeholder:text-muted-foreground/60 w-full bg-transparent text-base outline-none"
                autoFocus
              />
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              {tittel.length}/{TITTEL_MAKS} tegn
            </p>
          </div>

          {/* Kategori */}
          <div className="space-y-4 pt-6">
            <h2 className="text-xl font-semibold">Kategori</h2>
            <SimpleSelect
              value={uiKategori ?? ''}
              onValueChange={(v) => {
                setUiKategori(v as UiKategori)
                setUnderkategori(null)
              }}
              placeholder="Hovedkategori"
              options={UI_KATEGORI_OPTIONS}
            />

            <AnimatePresence>
              {harUnderkat && (
                <motion.div
                  key={uiKategori}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <SimpleSelect
                    value={underkategori ?? ''}
                    onValueChange={setUnderkategori}
                    placeholder="Underkategori"
                    options={UNDERKATEGORI_OPTIONS[uiKategori!]}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </>
    )
  }

  function tittelPlaceholder(): string {
    if (!uiKategori) return 'f.eks. Titleist T200 Jern'
    const katLabel = UI_KATEGORI_OPTIONS.find((o) => o.value === uiKategori)?.label ?? ''
    if (merke) return `${merke} ${katLabel}`
    return `f.eks. ${katLabel}`
  }

  function renderDetaljerFase() {
    const showMerke = tittel.trim().length > 0
    const showCatFields = merke.trim().length > 0
    const showTilstand = merke.trim().length > 0
    const showBilder = merke.trim().length > 0
    const showBeskrivelse = nyTilstand !== null

    // Skaftfelt (materiale, flex, lengde) for køller med skaft
    const harSkaftFields =
      uiKategori === 'jernshaft' || uiKategori === 'trekker' || uiKategori === 'wedge'
    const erPutter = uiKategori === 'putter'
    const erSko = uiKategori === 'sko'
    const erPiggsko = underkategori === 'piggsko'
    // Kun ekte jernsett (ikke hybrid/enkeltjern) skal velge hvilke køller som inngår
    const erJernsett =
      uiKategori === 'jernshaft' && (underkategori === 'jernsett' || underkategori === null)
    // Håndighet er relevant for alle køller
    const harHaandighet = harSkaftFields || uiKategori === 'putter'
    // Loft-/type-valg basert på løst db-kategori (driver/fairway/hybrid/wedge)
    const dbKat = uiKategori ? uiKategoriTilDb(uiKategori, underkategori) : null
    const loftOpts = dbKat ? loftOptionerForDb(dbKat) : null
    const aktiveFeil = feilFor('detaljer')

    const filteredMerker = GOLF_MERKER.filter(
      (m) => merke.trim() === '' || m.toLowerCase().includes(merke.toLowerCase())
    )

    if (analyserer) {
      return (
        <>
          <CardHeader>
            <CardTitle>Detaljer</CardTitle>
            <CardDescription>Fyll inn informasjon om utstyret</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <SparklesIcon className="text-muted-foreground size-4 animate-pulse" />
                <span className="text-muted-foreground dark:text-muted-foreground animate-pulse text-sm font-medium">
                  AI analyserer bildet…
                </span>
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="bg-muted h-3 w-24 animate-pulse rounded" />
                  <div className="bg-muted h-11 w-full animate-pulse rounded-xl" />
                </div>
              ))}
            </div>
          </CardContent>
        </>
      )
    }

    return (
      <>
        <CardHeader>
          <CardTitle>Detaljer</CardTitle>
          <CardDescription>
            Fyll inn informasjon om utstyret. <span className="text-destructive">*</span> = påkrevd
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* 1. Tittel */}
          <Felt label="Tittel" required error={aktiveFeil.tittel} aiBadge={aiFields.has('tittel')}>
            <Input
              value={tittel}
              onChange={(e) => setTittel(e.target.value)}
              placeholder={tittelPlaceholder()}
            />
          </Felt>

          {/* 2. Merke */}
          <AnimatePresence>
            {showMerke && (
              <motion.div
                key="merke"
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Felt
                  label="Merke"
                  required
                  error={aktiveFeil.merke}
                  aiBadge={aiFields.has('merke')}
                >
                  <div className="relative">
                    <Input
                      value={merke}
                      onChange={(e) => setMerke(e.target.value)}
                      onFocus={() => setMerkeOpen(true)}
                      onBlur={() => setTimeout(() => setMerkeOpen(false), 150)}
                      placeholder="Søk etter merke…"
                    />
                    <AnimatePresence>
                      {merkeOpen && filteredMerker.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.12 }}
                          className="border-border bg-card absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-xl border shadow-lg"
                        >
                          {filteredMerker.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onMouseDown={() => {
                                setMerke(m)
                                setMerkeOpen(false)
                              }}
                              className="hover:bg-muted flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm transition-colors"
                            >
                              {m}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Felt>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2b. Felles felt: årsmodell + håndighet */}
          <AnimatePresence>
            {showCatFields && (
              <motion.div
                key="felles-felt"
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                {uiKategori === 'baller' && (
                  <Felt label="Årsmodell" aiBadge={aiFields.has('aarsmodell')}>
                    <SimpleSelect
                      value={nyAarsmodell}
                      onValueChange={setNyAarsmodell}
                      placeholder="Velg årsmodell…"
                      options={AARSMODELL_VALG}
                      className=""
                    />
                  </Felt>
                )}
                {harHaandighet && (
                  <Felt label="Håndighet" required error={aktiveFeil.handighet}>
                    <PillToggle
                      options={HAND_OPTIONS}
                      value={nyHaandighet}
                      onChange={(v) => setNyHaandighet(v as 'right' | 'left' | null)}
                    />
                  </Felt>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. Category-specific fields */}
          <AnimatePresence>
            {showCatFields && harSkaftFields && (
              <motion.div
                key="skaft-fields"
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                {loftOpts && (
                  <Felt
                    label="Loft / type"
                    required
                    error={aktiveFeil.loft}
                    aiBadge={aiFields.has('loft')}
                  >
                    <SimpleSelect
                      value={loft}
                      onValueChange={setLoft}
                      placeholder="Velg loft / type…"
                      options={loftOpts}
                      className=""
                    />
                  </Felt>
                )}
                {(dbKat === 'driver' || dbKat === 'fairway_wood' || dbKat === 'hybrid') && (
                  <Felt label="Original headcover">
                    <PillToggle
                      options={[
                        { value: 'true', label: 'Ja' },
                        { value: 'false', label: 'Nei' },
                      ]}
                      value={headcover === true ? 'true' : headcover === false ? 'false' : null}
                      onChange={(v) => setHeadcover(v === null ? null : v === 'true')}
                    />
                  </Felt>
                )}
                {erJernsett && (
                  <Felt label="Hvilke køller inngår?">
                    <div className="flex flex-wrap gap-1.5">
                      {JERN_KOLLER_OPTIONS.map((k) => {
                        const valgt = valgteKoller.includes(k.value)
                        return (
                          <button
                            key={k.value}
                            type="button"
                            onClick={() =>
                              setValgteKoller((prev) =>
                                prev.includes(k.value)
                                  ? prev.filter((v) => v !== k.value)
                                  : [...prev, k.value]
                              )
                            }
                            className={cn(
                              'flex size-9 cursor-pointer items-center justify-center rounded-full border text-sm font-medium transition-all',
                              valgt
                                ? 'border-foreground bg-foreground text-background'
                                : 'hover:border-foreground/40 border-border'
                            )}
                          >
                            {k.label}
                          </button>
                        )
                      })}
                    </div>
                    {valgteKoller.length > 0 && (
                      <p className="text-muted-foreground mt-2 text-xs">
                        Inkluderer: {formaterKoller(valgteKoller)} · {valgteKoller.length} køller
                      </p>
                    )}
                  </Felt>
                )}

                {/* Skaft — gruppert delpanel */}
                <div className="border-border space-y-4 rounded-xl border p-4">
                  <div>
                    <Label className="mb-2 block">Skaft</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { v: 'uten', label: 'Uten skaft' },
                          { v: 'ukjent', label: 'Ukjent modell' },
                          { v: 'kjent', label: 'Velg skaftmodell' },
                        ] as const
                      ).map((o) => (
                        <button
                          key={o.v}
                          type="button"
                          onClick={() => {
                            setSkaftValg(o.v)
                            if (o.v !== 'kjent') setValgtSkaft(null)
                          }}
                          className={cn(
                            'cursor-pointer rounded-lg border px-2 py-2 text-xs font-medium transition-all',
                            skaftValg === o.v
                              ? 'border-foreground bg-foreground text-background'
                              : 'hover:border-foreground/40 border-border bg-card'
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      Velg «Uten skaft» hvis du selger kun hodet.
                    </p>
                  </div>

                  {skaftValg !== 'uten' && (
                    <>
                      <Felt label="Skaftmateriale" required error={aktiveFeil.skaftmateriale}>
                        <PillToggle
                          options={SKAFT_MATERIALE_OPTIONS}
                          value={nySkaftMateriale}
                          onChange={(v) => setNySkaftMateriale(v as 'graphite' | 'steel' | null)}
                        />
                      </Felt>

                      <div className="grid grid-cols-2 gap-3">
                        <Felt label="Flex" required error={aktiveFeil.flex}>
                          <SimpleSelect
                            value={flex ?? ''}
                            onValueChange={setFlex}
                            placeholder="Velg flex…"
                            options={NY_FLEX_OPTIONS}
                            className=""
                          />
                        </Felt>

                        <Felt label="Skaftlengde">
                          <SimpleSelect
                            value={skaftLengde}
                            onValueChange={setSkaftLengde}
                            placeholder="Valgfritt…"
                            options={SKAFT_LENGDE_OPTIONS}
                            className=""
                          />
                        </Felt>
                      </div>
                      {skaftLengde === 'custom' && (
                        <Input
                          value={skaftLengdeCustom}
                          onChange={(e) => setSkaftLengdeCustom(e.target.value)}
                          placeholder={'Egendefinert lengde, f.eks. -2,5" eller 46"'}
                        />
                      )}

                      <AnimatePresence>
                        {skaftValg === 'kjent' && (
                          <motion.div
                            key="skaft-velger"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18 }}
                            className="space-y-1.5"
                          >
                            <Label>Skaftmodell</Label>
                            <SkaftVelger
                              value={valgtSkaft}
                              onChange={setValgtSkaft}
                              shaftCategory={
                                uiKategori === 'trekker'
                                  ? 'driver_fairway'
                                  : uiKategori === 'wedge'
                                    ? 'wedge'
                                    : uiKategori === 'jernshaft'
                                      ? 'iron'
                                      : undefined
                              }
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showCatFields && erPutter && (
              <motion.div
                key="putter-fields"
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <Felt label="Lengde (cm)">
                  <Input
                    type="number"
                    value={putterLengde}
                    onChange={(e) => setPutterLengde(e.target.value)}
                    placeholder="f.eks. 86"
                    min={50}
                    max={120}
                    className=""
                  />
                </Felt>
                <Felt label="Hosel-type">
                  <SimpleSelect
                    value={hoselType ?? ''}
                    onValueChange={setHoselType}
                    placeholder="Velg hosel-type…"
                    options={HOSEL_OPTIONS}
                    className=""
                  />
                </Felt>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showCatFields && erSko && (
              <motion.div
                key="sko-fields"
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <Felt label="Størrelse EU">
                  <Input
                    type="number"
                    value={skoStorrelse}
                    onChange={(e) => setSkoStorrelse(e.target.value)}
                    placeholder="f.eks. 42"
                    min={30}
                    max={55}
                    className="max-w-25"
                  />
                </Felt>
                {erPiggsko && (
                  <Felt label="Piggtype">
                    <PillToggle
                      options={[
                        { value: 'soft', label: 'Soft' },
                        { value: 'fast', label: 'Fast' },
                      ]}
                      value={piggType}
                      onChange={setPiggType}
                    />
                  </Felt>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. Tilstand */}
          <AnimatePresence>
            {showTilstand && (
              <motion.div
                key="tilstand"
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div
                  className={cn(
                    'space-y-2',
                    aiFields.has('tilstand') && 'border-border border-l-2 pl-3'
                  )}
                >
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Label>Tilstand</Label>
                    <span className="text-destructive">*</span>
                    {aiFields.has('tilstand') && <AiBadge />}
                  </div>
                  {aktiveFeil.tilstand && (
                    <p className="text-destructive mb-1.5 text-xs">{aktiveFeil.tilstand}</p>
                  )}
                  <div
                    className="flex flex-col gap-2"
                    data-feil={aktiveFeil.tilstand ? 'true' : undefined}
                  >
                    {NY_TILSTANDER.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setNyTilstand(t.value)}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
                          nyTilstand === t.value
                            ? `${t.klasse} ring-2 ring-current ring-offset-1`
                            : 'hover:border-foreground/40 border-border'
                        )}
                      >
                        <span className={cn('size-2.5 shrink-0 rounded-full', t.dotKlasse)} />
                        <span className="flex flex-col">
                          <span className="text-sm font-medium">{t.label}</span>
                          <span
                            className={cn(
                              'text-xs',
                              nyTilstand === t.value ? 'opacity-80' : 'text-muted-foreground'
                            )}
                          >
                            {t.beskrivelse}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5. Bilder */}
          <AnimatePresence>
            {showBilder && (
              <motion.div
                key="bilder"
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="border-border border-t pt-5">
                  <p className="text-foreground mb-3 text-sm font-medium">Bilder</p>
                  <BildeOpplaster {...bildeOpplasterProps} />
                  <p className="text-muted-foreground mt-2 text-xs">
                    Maks {MAKS_ANTALL_BILDER} bilder · Første bilde blir forsidebilde
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 6. Beskrivelse */}
          <AnimatePresence>
            {showBeskrivelse && (
              <motion.div
                key="beskrivelse"
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="border-border space-y-1 border-t pt-5">
                  <div className="flex items-center justify-between">
                    <Label>Beskrivelse</Label>
                    <span className="text-muted-foreground text-xs">Valgfritt</span>
                  </div>
                  <Textarea
                    value={beskrivelse}
                    onChange={(e) => setBeskrivelse(e.target.value.slice(0, 1000))}
                    placeholder="Beskriv tilstanden nærmere, inkluderte tilbehør, evt. skader osv."
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-muted-foreground text-right text-xs">
                    {beskrivelse.length}/1000
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </>
    )
  }

  function renderPrisFase() {
    const aktiveFeil = feilFor('pris')
    return (
      <>
        <CardHeader>
          <CardTitle>Pris og publisering</CardTitle>
          <CardDescription>Sett en pris og publiser annonsen din</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <Felt label="Pris" required error={aktiveFeil.pris}>
              <div className="relative">
                <Input
                  type="number"
                  value={pris}
                  onChange={(e) => setPris(e.target.value)}
                  placeholder="Pris"
                  className="pr-14"
                  min={0}
                />
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm">
                  NOK
                </span>
              </div>
              {uiKategori && (
                <p className="text-muted-foreground mt-1.5 text-xs">
                  Typisk: {PRIS_ANBEFALINGER[uiKategori]}
                </p>
              )}
            </Felt>

            <Felt label="Sted">
              <AdresseVelger value={adresseCreate} onChange={setAdresseCreate} />
            </Felt>

            <div className="border-border flex items-center justify-between rounded-xl border px-4 py-3.5">
              <div>
                <p className="text-sm font-medium">Kan sendes</p>
                <p className="text-muted-foreground text-xs">Varen kan sendes til kjøper</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={kanSendes}
                onClick={() => setKanSendes(!kanSendes)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                  kanSendes ? 'bg-foreground' : 'bg-muted-foreground/30'
                )}
              >
                <span
                  className={cn(
                    'bg-card pointer-events-none inline-block size-5 transform rounded-full shadow-lg transition-transform',
                    kanSendes ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            <div className="border-border flex items-center justify-between rounded-xl border px-4 py-3.5">
              <div>
                <p className="text-sm font-medium">Kan møtes</p>
                <p className="text-muted-foreground text-xs">Møt kjøper for overlevering</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={kanMotes}
                onClick={() => setKanMotes(!kanMotes)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                  kanMotes ? 'bg-foreground' : 'bg-muted-foreground/30'
                )}
              >
                <span
                  className={cn(
                    'bg-card pointer-events-none inline-block size-5 transform rounded-full shadow-lg transition-transform',
                    kanMotes ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </>
    )
  }

  // ── Edit mode phase renderers ─────────────────────────────────────────────

  function renderEditKategori() {
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
              className=""
            />
          </Felt>
        </CardContent>
      </>
    )
  }

  function renderEditUtstyr() {
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
        </CardContent>
      </>
    )
  }

  function renderEditBilder() {
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
  }

  function renderEditTilstand() {
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
              <span className="text-destructive">*</span>
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
                      ? `${t.klasse} ring-foreground ring-2 ring-offset-1`
                      : 'hover:border-foreground/40 border-border'
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
  }

  function renderEditPris() {
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
  }

  // ── Step router ───────────────────────────────────────────────────────────

  function renderStegInnhold() {
    if (redigerModus) {
      switch (steg[currentStep]?.id) {
        case 'kategori':
          return renderEditKategori()
        case 'utstyr':
          return renderEditUtstyr()
        case 'bilder':
          return renderEditBilder()
        case 'tilstand':
          return renderEditTilstand()
        case 'pris':
          return renderEditPris()
        default:
          return null
      }
    }
    switch (steg[currentStep]?.id as string) {
      case 'metode':
        return renderMetodeFase()
      case 'kategori':
        return renderKategoriFase()
      case 'intro':
        return renderIntroFase()
      case 'detaljer':
        return renderDetaljerFase()
      case 'pris':
        return renderPrisFase()
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
        <Card className="border-border bg-card relative overflow-hidden">
          {publisert && <PubliseringSuksess />}
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
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className={NAV_KNAPP_KLASSE}
              >
                <ChevronLeftIcon className="size-4" />
                Tilbake
              </Button>
            </div>

            <div>
              {erSisteSteg ? (
                redigerModus ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() =>
                      void handleSubmit(onSubmit, () =>
                        toast.error('Fyll inn alle påkrevde felt.')
                      )()
                    }
                    disabled={!isStegGyldig() || isSubmitting}
                    className={NAV_KNAPP_KLASSE}
                  >
                    {isSubmitting ? (
                      <>
                        <ArrowPathIcon className="size-4 animate-spin" />
                        Lagrer…
                      </>
                    ) : (
                      <>
                        Lagre endringer
                        <CheckIcon className="size-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={forsokPubliser}
                    disabled={isSubmittingNy}
                    className={NAV_KNAPP_KLASSE}
                  >
                    {isSubmittingNy ? (
                      <>
                        <ArrowPathIcon className="size-4 animate-spin" />
                        Publiserer…
                      </>
                    ) : (
                      <>
                        Legg ut annonse
                        <CheckIcon className="size-4" />
                      </>
                    )}
                  </Button>
                )
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={nextStep}
                  disabled={redigerModus && !isStegGyldig()}
                  className={NAV_KNAPP_KLASSE}
                >
                  Neste
                  <ChevronRightIcon className="size-4" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </>
  )

  if (modalModus) return formInnhold

  return (
    <section className="flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-xl">
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

        {formInnhold}

        <p className="text-muted-foreground mt-4 text-center text-sm">
          Steg {currentStep + 1} av {steg.length}: {steg[currentStep]?.tittel}
        </p>
      </div>

      {/* Leave-page dialog */}
      {pendingNavHref !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setPendingNavHref(null)}
          />
          <div className="border-border bg-card relative z-10 w-[min(92vw,420px)] overflow-hidden rounded-2xl border shadow-2xl">
            <button
              type="button"
              onClick={() => setPendingNavHref(null)}
              className="text-muted-foreground hover:text-foreground absolute top-3.5 right-3.5 flex size-7 items-center justify-center rounded-full transition-colors"
              aria-label="Lukk"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M1 1l11 11M12 1L1 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="flex flex-col items-center px-7 pt-8 pb-6">
              <p className="text-foreground mb-1 text-[1.1rem] font-bold">Forlat siden?</p>
              <p className="text-muted-foreground mb-6 text-center text-xs leading-relaxed">
                Du har startet en annonse. Vil du lagre utkastet slik at du kan fortsette senere,
                eller forlate uten å lagre?
              </p>
              <Button
                onClick={saveDraftAndLeave}
                className="bg-foreground text-background hover:bg-foreground/90 mb-2 h-10 w-full rounded-xl font-semibold"
              >
                Lagre utkast og forlat
              </Button>
              <Button
                variant="outline"
                onClick={confirmLeave}
                className="bg-background text-foreground hover:bg-muted border-border h-10 w-full rounded-xl border"
              >
                Forlat uten å lagre
              </Button>
            </div>
            <div className="border-border border-t px-7 py-4 text-center">
              <button
                type="button"
                onClick={() => setPendingNavHref(null)}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Bli på siden
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
