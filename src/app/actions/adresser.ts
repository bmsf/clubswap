'use server'

import { createClient } from '@/supabase/server'
import { geokodPostnummer } from './geokoding'

export type Adresse = {
  id: string
  full_address: string
  poststed: string
  er_standard: boolean
  navn: string | null
  land: string | null
  gateadresse: string | null
  gatenummer: string | null
  postnummer: string | null
  lat: number | null
  lng: number | null
}

const ADRESSE_KOLONNER =
  'id, full_address, poststed, er_standard, navn, land, gateadresse, gatenummer, postnummer, lat, lng'

export type NyAdresseInput = {
  navn?: string
  land?: string
  gateadresse: string
  gatenummer?: string
  postnummer: string
  poststed: string
}

/** Setter sammen «Gateadresse Gatenummer, Postnummer Poststed» til visningsstreng. */
function byggFullAdresse(i: NyAdresseInput): string {
  const gate = [i.gateadresse.trim(), i.gatenummer?.trim()].filter(Boolean).join(' ')
  const sted = [i.postnummer.trim(), i.poststed.trim()].filter(Boolean).join(' ')
  return [gate, sted].filter(Boolean).join(', ')
}

export async function hentAdresser(): Promise<Adresse[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('user_addresses')
    .select(ADRESSE_KOLONNER)
    .eq('bruker_id', user.id)
    .order('er_standard', { ascending: false })
    .order('created_at', { ascending: true })

  return (data ?? []) as Adresse[]
}

export async function leggTilAdresse(input: NyAdresseInput): Promise<Adresse | { feil: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { feil: 'Ikke innlogget' }

  if (!input.gateadresse.trim() || !input.postnummer.trim() || !input.poststed.trim()) {
    return { feil: 'Fyll inn gateadresse, postnummer og poststed.' }
  }

  // Geokod postnummer til sentroide (geog fylles av trigger). Null = ukjent postnummer.
  const koordinat = await geokodPostnummer(input.postnummer)

  const { data, error } = await supabase
    .from('user_addresses')
    .insert({
      bruker_id: user.id,
      full_address: byggFullAdresse(input),
      poststed: input.poststed.trim(),
      navn: input.navn?.trim() || null,
      land: input.land?.trim() || 'Norge',
      gateadresse: input.gateadresse.trim(),
      gatenummer: input.gatenummer?.trim() || null,
      postnummer: input.postnummer.trim(),
      lat: koordinat?.lat ?? null,
      lng: koordinat?.lng ?? null,
    })
    .select(ADRESSE_KOLONNER)
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

/** Setter én adresse som standard og nullstiller de andre for brukeren. */
export async function settStandardAdresse(id: string): Promise<{ feil?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { feil: 'Ikke innlogget' }

  const { error: nullstill } = await supabase
    .from('user_addresses')
    .update({ er_standard: false })
    .eq('bruker_id', user.id)
  if (nullstill) return { feil: nullstill.message }

  const { error } = await supabase
    .from('user_addresses')
    .update({ er_standard: true })
    .eq('id', id)
    .eq('bruker_id', user.id)

  if (error) return { feil: error.message }
  return {}
}
