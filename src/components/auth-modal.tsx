'use client'

import { useEffect, useRef, useActionState, useState } from 'react'
import { loggInn, registrer, loggInnMedGoogle } from '@/app/(auth)/actions'
import { useAuthModal } from '@/store/auth-modal'

export function AuthModal() {
  const { open, fane, redirectAfter, closeModal, openModal } = useAuthModal()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [epost, setEpost] = useState('')
  const [steg, setSteg] = useState<'epost' | 'detaljer'>('epost')

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSteg('epost')

      setEpost('')
    }
  }, [open])

  // Reset steg when switching between login/register
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSteg('epost')

    setEpost('')
  }, [fane])

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

  if (!open) return null

  const erRegistrering = fane === 'registrer'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

      <div
        ref={dialogRef}
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

        {/* Hoved-innhold */}
        <div className="flex flex-col items-center px-7 pt-8 pb-6">
          <h1 className="text-foreground mb-1 text-[1.1rem] font-bold">
            {erRegistrering ? 'Opprett konto' : 'Logg inn på Golftorget'}
          </h1>
          <p className="text-muted-foreground mb-6 text-center text-xs leading-relaxed">
            {erRegistrering
              ? 'Fyll inn informasjonen din for å komme i gang.'
              : 'Velkommen tilbake! Vennligst logg inn for å fortsette.'}
          </p>

          {steg === 'epost' ? (
            <Steg1
              redirectAfter={redirectAfter}
              epost={epost}
              setEpost={setEpost}
              onFortsett={() => setSteg('detaljer')}
              erRegistrering={erRegistrering}
            />
          ) : erRegistrering ? (
            <RegistrerSkjema
              epost={epost}
              redirectAfter={redirectAfter}
              tilbake={() => setSteg('epost')}
            />
          ) : (
            <LoggInnSkjema
              epost={epost}
              redirectAfter={redirectAfter}
              tilbake={() => setSteg('epost')}
            />
          )}
        </div>

        {/* Bunn-seksjon */}
        <div className="border-border border-t px-7 py-4 text-center text-sm">
          {erRegistrering ? (
            <p className="text-muted-foreground text-xs">
              Har du allerede konto?{' '}
              <button
                type="button"
                onClick={() => openModal('logg-inn', redirectAfter)}
                className="text-foreground cursor-pointer font-semibold hover:underline"
              >
                Logg inn
              </button>
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">
              Ingen konto?{' '}
              <button
                type="button"
                onClick={() => openModal('registrer', redirectAfter)}
                className="text-foreground cursor-pointer font-semibold hover:underline"
              >
                Registrer deg
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Steg 1: Google + e-post (identisk for logg inn og registrer) ──────────────

function Steg1({
  redirectAfter,
  epost,
  setEpost,
  onFortsett,
  erRegistrering,
}: {
  redirectAfter: string | null
  epost: string
  setEpost: (v: string) => void
  onFortsett: () => void
  erRegistrering: boolean
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      {/* Google */}
      <form className="w-full">
        {redirectAfter && <input type="hidden" name="fra" value={redirectAfter} />}
        <button
          type="submit"
          formAction={loggInnMedGoogle}
          formNoValidate
          className="border-border bg-background text-foreground hover:bg-muted flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border text-sm font-medium transition-colors"
        >
          <GoogleIcon />
          Google
        </button>
      </form>

      {/* Skillelinje */}
      <div className="relative flex w-full items-center gap-3">
        <div className="border-border h-px flex-1 border-t" />
        <span className="text-muted-foreground text-[11px]">eller</span>
        <div className="border-border h-px flex-1 border-t" />
      </div>

      {/* E-post + Fortsett */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="steg1-epost" className="text-foreground text-sm font-medium">
            E-postadresse
          </label>
          {erRegistrering && <span className="text-muted-foreground text-xs">Valgfritt</span>}
        </div>
        <input
          id="steg1-epost"
          type="email"
          autoComplete="email"
          required
          placeholder="deg@eksempel.no"
          value={epost}
          onChange={(e) => setEpost(e.target.value)}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary h-10 w-full rounded-xl border px-3.5 text-sm transition-colors outline-none"
        />
      </div>

      <FortsettKnapp
        onClick={(e) => {
          e.preventDefault()
          if (epost.trim()) onFortsett()
        }}
        label="Fortsett"
      />
    </div>
  )
}

// ── Steg 2: Logg inn ──────────────────────────────────────────────────────────

function LoggInnSkjema({
  epost,
  redirectAfter,
  tilbake,
}: {
  epost: string
  redirectAfter: string | null
  tilbake: () => void
}) {
  const [state, action, pending] = useActionState(loggInn, { feil: '' })

  return (
    <form action={action} className="flex w-full flex-col gap-3">
      {redirectAfter && <input type="hidden" name="fra" value={redirectAfter} />}
      <input type="hidden" name="epost" value={epost} />

      {/* E-post (skrivebeskyttet) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-foreground text-sm font-medium">E-postadresse</label>
        <div className="border-input bg-muted/40 text-foreground flex h-10 items-center justify-between rounded-xl border px-3.5 text-sm">
          <span className="truncate">{epost}</span>
          <button
            type="button"
            onClick={tilbake}
            className="text-muted-foreground hover:text-foreground ml-2 shrink-0 text-xs hover:underline"
          >
            Endre
          </button>
        </div>
      </div>

      {state?.feil && (
        <p className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border px-3 py-2 text-sm">
          {state.feil}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="modal-passord" className="text-foreground text-sm font-medium">
          Passord
        </label>
        <input
          id="modal-passord"
          name="passord"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          placeholder="••••••••"
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary h-10 w-full rounded-xl border px-3.5 text-sm transition-colors outline-none"
        />
      </div>

      <FortsettKnapp pending={pending} label="Logg inn" loadingLabel="Logger inn…" />
    </form>
  )
}

// ── Steg 2: Registrer ─────────────────────────────────────────────────────────

function RegistrerSkjema({
  epost,
  redirectAfter,
  tilbake,
}: {
  epost: string
  redirectAfter: string | null
  tilbake: () => void
}) {
  const [state, action, pending] = useActionState(registrer, { feil: '' })

  return (
    <form action={action} className="flex w-full flex-col gap-3">
      {redirectAfter && <input type="hidden" name="fra" value={redirectAfter} />}
      <input type="hidden" name="epost" value={epost} />

      {/* E-post (skrivebeskyttet) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-foreground text-sm font-medium">E-postadresse</label>
        <div className="border-input bg-muted/40 text-foreground flex h-10 items-center justify-between rounded-xl border px-3.5 text-sm">
          <span className="truncate">{epost}</span>
          <button
            type="button"
            onClick={tilbake}
            className="text-muted-foreground hover:text-foreground ml-2 shrink-0 text-xs hover:underline"
          >
            Endre
          </button>
        </div>
      </div>

      {state?.feil && (
        <p className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border px-3 py-2 text-sm">
          {state.feil}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="modal-navn" className="text-foreground text-sm font-medium">
          Navn
        </label>
        <input
          id="modal-navn"
          name="navn"
          type="text"
          autoComplete="name"
          required
          autoFocus
          placeholder="Ola Nordmann"
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary h-10 w-full rounded-xl border px-3.5 text-sm transition-colors outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="modal-reg-passord" className="text-foreground text-sm font-medium">
          Passord
        </label>
        <input
          id="modal-reg-passord"
          name="passord"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="••••••••"
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary h-10 w-full rounded-xl border px-3.5 text-sm transition-colors outline-none"
        />
        <p className="text-muted-foreground text-[11px]">Minst 6 tegn</p>
      </div>

      <FortsettKnapp pending={pending} label="Opprett konto" loadingLabel="Oppretter konto…" />
    </form>
  )
}

// ── Felles komponenter ────────────────────────────────────────────────────────

function FortsettKnapp({
  pending,
  label,
  loadingLabel,
  onClick,
}: {
  pending?: boolean
  label: string
  loadingLabel?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      disabled={pending}
      onClick={onClick}
      className="bg-foreground text-background hover:bg-foreground/90 mt-0.5 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
    >
      {pending && loadingLabel ? (
        loadingLabel
      ) : (
        <>
          {label}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </>
      )}
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
