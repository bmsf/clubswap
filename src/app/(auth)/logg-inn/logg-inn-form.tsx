'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { loggInn, loggInnMedGoogle } from '../actions'

const initialState = { feil: '' }

export function LoggInnForm() {
  const [state, action, pending] = useActionState(loggInn, initialState)
  const searchParams = useSearchParams()
  const bekreftet = searchParams.get('bekreftet')

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="mb-2">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Logg inn</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Ingen konto?{' '}
          <Link href="/registrer" className="text-primary hover:underline">
            Registrer deg gratis
          </Link>
        </p>
      </div>

      {bekreftet && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
          Konto bekreftet! Du kan nå logge inn.
        </p>
      )}

      {state?.feil && (
        <p className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border px-3 py-2 text-sm">
          {state.feil}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="epost" className="text-foreground text-sm font-medium">
          E-post
        </label>
        <input
          id="epost"
          name="epost"
          type="email"
          autoComplete="email"
          required
          placeholder="deg@eksempel.no"
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/40 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="passord" className="text-foreground text-sm font-medium">
          Passord
        </label>
        <input
          id="passord"
          name="passord"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/40 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
        />
      </div>

      <Button type="submit" variant="primary" className="mt-1 w-full" disabled={pending}>
        {pending ? 'Logger inn…' : 'Logg inn'}
      </Button>

      <div className="relative flex items-center gap-3 py-1">
        <div className="border-border h-px flex-1 border-t" />
        <span className="text-muted-foreground text-xs">eller</span>
        <div className="border-border h-px flex-1 border-t" />
      </div>

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
        Fortsett med Google
      </button>
    </form>
  )
}
