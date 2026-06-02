'use server'

import { createClient } from '@/supabase/server'
import { geokodPostnummer } from '@/app/actions/geokoding'

export type AnnonseInput = {
  kategori: string
  merke: string
  annetMerke?: string
  modell: string
  aarsmodell?: string
  skaftMerke?: string
  skaftModell?: string
  shaftFlex?: string
  haandighet?: string
  loft?: string
  headcover?: boolean
  skaftMateriale?: string
  skaftLengde?: string
  koller?: string[]
  putterLengde?: string
  hoselType?: string
  skoStorrelse?: string
  storrelse?: string
  piggType?: string
  kanMotes?: boolean
  tilstand: string
  beskrivelse?: string
  skadebeskrivelse?: string
  pris: number
  selgesFra?: string
  beliggenhet?: 'generell' | 'noyaktig'
  postnummer?: string
  lat?: number | null
  lng?: number | null
  tilbyrFrakt: boolean
  bilder: string[]
}

/** Henter koordinater fra valgt adresse hvis tilgjengelig, ellers geokoder postnummer. */
async function utledKoordinater(
  input: Pick<AnnonseInput, 'lat' | 'lng' | 'postnummer'>
): Promise<{ lat: number | null; lng: number | null }> {
  if (typeof input.lat === 'number' && typeof input.lng === 'number') {
    return { lat: input.lat, lng: input.lng }
  }
  if (input.postnummer) {
    const k = await geokodPostnummer(input.postnummer)
    if (k) return { lat: k.lat, lng: k.lng }
  }
  return { lat: null, lng: null }
}

export async function publiserAnnonse(
  input: AnnonseInput
): Promise<{ feil: string } | { id: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { feil: 'Du må være innlogget for å legge ut annonse.' }
  }

  const merke = input.merke === 'Annet' && input.annetMerke ? input.annetMerke : input.merke
  const { lat, lng } = await utledKoordinater(input)

  const { data, error } = await supabase
    .from('annonser')
    .insert({
      bruker_id: user.id,
      kategori: input.kategori,
      merke,
      modell: input.modell,
      aarsmodell: input.aarsmodell ?? null,
      skaft_merke: input.skaftMerke ?? null,
      skaft_modell: input.skaftModell ?? null,
      shaft_flex: input.shaftFlex ?? null,
      haandighet: input.haandighet ?? null,
      loft: input.loft ?? null,
      includes_headcover: input.headcover ?? null,
      skaft_materiale: input.skaftMateriale ?? null,
      skaft_lengde: input.skaftLengde ?? null,
      koller: input.koller ?? null,
      putter_lengde: input.putterLengde ?? null,
      hosel_type: input.hoselType ?? null,
      sko_storrelse: input.skoStorrelse ?? null,
      storrelse: input.storrelse ?? null,
      pigg_type: input.piggType ?? null,
      kan_motes: input.kanMotes ?? null,
      tilstand: input.tilstand,
      beskrivelse: input.beskrivelse ?? null,
      skadebeskrivelse: input.skadebeskrivelse ?? null,
      pris: input.pris,
      selges_fra: input.selgesFra ?? '',
      beliggenhet_presisjon: input.beliggenhet ?? 'generell',
      lat,
      lng,
      tilbyr_frakt: input.tilbyrFrakt,
      bilder: input.bilder,
      status: 'aktiv',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    return { feil: `Kunne ikke lagre annonsen: ${error.message}` }
  }

  return { id: data.id }
}

export async function oppdaterAnnonse(
  id: string,
  input: AnnonseInput
): Promise<{ feil: string } | { id: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { feil: 'Du må være innlogget.' }

  const merke = input.merke === 'Annet' && input.annetMerke ? input.annetMerke : input.merke

  // Posisjon/beliggenhet oppdateres kun når redigeringsflyten faktisk sender det,
  // ellers beholdes eksisterende verdier (unngår å nullstille koordinater ved redigering).
  const harPosisjon =
    typeof input.lat === 'number' || typeof input.lng === 'number' || !!input.postnummer
  const posisjonsfelt = harPosisjon ? await utledKoordinater(input) : null

  const { error } = await supabase
    .from('annonser')
    .update({
      kategori: input.kategori,
      merke,
      modell: input.modell,
      aarsmodell: input.aarsmodell ?? null,
      skaft_merke: input.skaftMerke ?? null,
      skaft_modell: input.skaftModell ?? null,
      shaft_flex: input.shaftFlex ?? null,
      haandighet: input.haandighet ?? null,
      loft: input.loft ?? null,
      includes_headcover: input.headcover ?? null,
      skaft_materiale: input.skaftMateriale ?? null,
      skaft_lengde: input.skaftLengde ?? null,
      koller: input.koller ?? null,
      putter_lengde: input.putterLengde ?? null,
      hosel_type: input.hoselType ?? null,
      sko_storrelse: input.skoStorrelse ?? null,
      storrelse: input.storrelse ?? null,
      pigg_type: input.piggType ?? null,
      kan_motes: input.kanMotes ?? null,
      tilstand: input.tilstand,
      beskrivelse: input.beskrivelse ?? null,
      skadebeskrivelse: input.skadebeskrivelse ?? null,
      pris: input.pris,
      selges_fra: input.selgesFra ?? '',
      ...(input.beliggenhet ? { beliggenhet_presisjon: input.beliggenhet } : {}),
      ...(posisjonsfelt ? { lat: posisjonsfelt.lat, lng: posisjonsfelt.lng } : {}),
      tilbyr_frakt: input.tilbyrFrakt,
      bilder: input.bilder,
    })
    .eq('id', id)
    .eq('bruker_id', user.id)

  if (error) {
    console.error('Supabase update error:', error)
    return { feil: `Kunne ikke oppdatere annonsen: ${error.message}` }
  }

  return { id }
}

export async function markerSomSolgt(id: string): Promise<{ feil: string } | { ok: true }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { feil: 'Du må være innlogget.' }

  const { error } = await supabase
    .from('annonser')
    .update({ status: 'solgt' })
    .eq('id', id)
    .eq('bruker_id', user.id)

  if (error) {
    console.error('Supabase update error:', error)
    return { feil: `Kunne ikke markere annonsen som solgt: ${error.message}` }
  }

  return { ok: true }
}

export async function markerSomAktiv(id: string): Promise<{ feil: string } | { ok: true }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { feil: 'Du må være innlogget.' }

  const { error } = await supabase
    .from('annonser')
    .update({ status: 'aktiv' })
    .eq('id', id)
    .eq('bruker_id', user.id)

  if (error) {
    console.error('Supabase update error:', error)
    return { feil: `Kunne ikke aktivere annonsen: ${error.message}` }
  }

  return { ok: true }
}

export async function slettAnnonse(id: string): Promise<{ feil: string } | { ok: true }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { feil: 'Du må være innlogget.' }

  const { error } = await supabase.from('annonser').delete().eq('id', id).eq('bruker_id', user.id)

  if (error) {
    console.error('Supabase delete error:', error)
    return { feil: `Kunne ikke slette annonsen: ${error.message}` }
  }

  return { ok: true }
}
