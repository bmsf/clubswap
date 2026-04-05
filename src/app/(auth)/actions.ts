'use server'

import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function loggInn(_: unknown, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('epost') as string,
    password: formData.get('passord') as string,
  })

  if (error) {
    return { feil: 'Feil e-post eller passord.' }
  }

  redirect('/')
}

export async function registrer(_: unknown, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('epost') as string,
    password: formData.get('passord') as string,
    options: {
      data: { navn: formData.get('navn') as string },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { feil: 'Denne e-postadressen er allerede i bruk.' }
    }
    return { feil: 'Noe gikk galt. Prøv igjen.' }
  }

  redirect('/logg-inn?bekreftet=1')
}

export async function loggUt() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function loggInnMedGoogle() {
  const headersList = await headers()
  const origin = headersList.get('origin') ?? `https://${headersList.get('host')}`
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error || !data.url) {
    redirect('/logg-inn?feil=google')
  }

  redirect(data.url)
}
