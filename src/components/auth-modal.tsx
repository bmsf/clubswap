'use client'

import { useEffect, useId, useRef, useState, useActionState } from 'react'
import { loggInn, registrer, loggInnMedGoogle } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'

type Fane = 'logg-inn' | 'registrer'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  initialFane?: Fane
}

export function AuthModal({ open, onClose, initialFane = 'logg-inn' }: AuthModalProps) {
  const [fane, setFane] = useState<Fane>(initialFane)
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-card border-border relative z-10 w-[min(92vw,440px)] rounded-2xl border px-6 pt-12 pb-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground hover:bg-muted absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors"
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

        {/* Fane-velger */}
        <div className="bg-muted mb-5 grid grid-cols-2 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setFane('logg-inn')}
            className={[
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              fane === 'logg-inn'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground cursor-pointer',
            ].join(' ')}
          >
            Logg inn
          </button>
          <button
            type="button"
            onClick={() => setFane('registrer')}
            className={[
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              fane === 'registrer'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground cursor-pointer',
            ].join(' ')}
          >
            Registrer deg
          </button>
        </div>

        {fane === 'logg-inn' ? <LoggInnSkjema /> : <RegistrerSkjema />}
      </div>
    </div>
  )
}

function LoggInnSkjema() {
  const [state, action, pending] = useActionState(loggInn, { feil: '' })

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.feil && (
        <p className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border px-3 py-2 text-sm">
          {state.feil}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="modal-epost" className="text-foreground text-sm font-medium">
          E-post
        </label>
        <input
          id="modal-epost"
          name="epost"
          type="email"
          autoComplete="email"
          required
          placeholder="deg@eksempel.no"
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/40 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
        />
      </div>

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
          placeholder="••••••••"
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/40 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
        />
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending ? 'Logger inn…' : 'Logg inn'}
      </Button>

      <Divider />

      <GoogleKnapp label="Fortsett med Google" />
    </form>
  )
}

function RegistrerSkjema() {
  const [state, action, pending] = useActionState(registrer, { feil: '' })

  return (
    <form action={action} className="flex flex-col gap-4">
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
          placeholder="Ola Nordmann"
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/40 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="modal-reg-epost" className="text-foreground text-sm font-medium">
          E-post
        </label>
        <input
          id="modal-reg-epost"
          name="epost"
          type="email"
          autoComplete="email"
          required
          placeholder="deg@eksempel.no"
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/40 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
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
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/40 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
        />
        <p className="text-muted-foreground text-xs">Minst 6 tegn</p>
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending ? 'Oppretter konto…' : 'Opprett konto'}
      </Button>

      <Divider />

      <GoogleKnapp label="Registrer deg med Google" />

      <p className="text-muted-foreground text-center text-xs">
        Ved å registrere deg godtar du våre vilkår for bruk.
      </p>
    </form>
  )
}

function Divider() {
  return (
    <div className="relative flex items-center gap-3">
      <div className="border-border h-px flex-1 border-t" />
      <span className="text-muted-foreground text-xs">eller</span>
      <div className="border-border h-px flex-1 border-t" />
    </div>
  )
}

function GoogleKnapp({ label }: { label: string }) {
  return (
    <button
      type="submit"
      formAction={loggInnMedGoogle}
      formNoValidate
      className="border-input bg-background text-foreground hover:bg-muted flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border text-sm font-medium transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
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
      {label}
    </button>
  )
}
