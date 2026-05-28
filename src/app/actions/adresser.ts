'use server'

import { createClient } from '@/supabase/server'

export type Adresse = {
  id: string
  full_address: string
  poststed: string
  er_standard: boolean
}

export async function hentAdresser(): Promise<Adresse[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('user_addresses')
    .select('id, full_address, poststed, er_standard')
    .eq('bruker_id', user.id)
    .order('er_standard', { ascending: false })
    .order('created_at', { ascending: true })

  return (data ?? []) as Adresse[]
}

export async function leggTilAdresse(
  full_address: string,
  poststed: string
): Promise<Adresse | { feil: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { feil: 'Ikke innlogget' }

  const { data, error } = await supabase
    .from('user_addresses')
    .insert({ bruker_id: user.id, full_address: full_address.trim(), poststed: poststed.trim() })
    .select('id, full_address, poststed, er_standard')
    .single()

  if (error) return { feil: error.message }
  return data as Adresse
}

export async function slettAdresse(id: string): Promise<{ feil?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { feil: 'Ikke innlogget' }

  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', id)
    .eq('bruker_id', user.id)

  if (error) return { feil: error.message }
  return {}
}
