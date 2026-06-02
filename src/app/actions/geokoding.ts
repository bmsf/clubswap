'use server'

import { createClient } from '@/supabase/server'

export type Koordinat = { lat: number; lng: number }

/**
 * Slår opp sentroide-koordinater for et norsk postnummer i postnummer_steder.
 * Returnerer null hvis postnummeret ikke finnes (annonsen blir da uten posisjon).
 * Eneste kilde til geokoding — brukes av både adresse- og publiseringsflyt.
 */
export async function geokodPostnummer(postnummer: string): Promise<Koordinat | null> {
  const renset = postnummer.trim()
  if (!renset) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('postnummer_steder')
    .select('lat, lng')
    .eq('postnummer', renset)
    .maybeSingle()

  if (!data) return null
  return { lat: data.lat as number, lng: data.lng as number }
}

/** Offentlig wrapper for klientside-bruk (postnummer-fallback i nærhetsfilteret). */
export async function geokodPostnummerOffentlig(postnummer: string): Promise<Koordinat | null> {
  return geokodPostnummer(postnummer)
}
