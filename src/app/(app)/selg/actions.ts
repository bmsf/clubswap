'use server'

import { createClient } from '@/supabase/server'

export type AnnonseInput = {
  kategori: string
  merke: string
  annetMerke?: string
  modell: string
  aarsmodell?: string
  skaftModell?: string
  shaftFlex?: string
  haandighet?: string
  loft?: string
  skaftMateriale?: string
  tilstand: string
  skadebeskrivelse?: string
  pris: number
  selgesFra: string
  tilbyrFrakt: boolean
  bilder: string[]
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

  const { data, error } = await supabase
    .from('annonser')
    .insert({
      bruker_id: user.id,
      kategori: input.kategori,
      merke,
      modell: input.modell,
      aarsmodell: input.aarsmodell ?? null,
      skaft_modell: input.skaftModell ?? null,
      shaft_flex: input.shaftFlex ?? null,
      haandighet: input.haandighet ?? null,
      loft: input.loft ?? null,
      skaft_materiale: input.skaftMateriale ?? null,
      tilstand: input.tilstand,
      skadebeskrivelse: input.skadebeskrivelse ?? null,
      pris: input.pris,
      selges_fra: input.selgesFra,
      tilbyr_frakt: input.tilbyrFrakt,
      bilder: input.bilder,
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

  const { error } = await supabase
    .from('annonser')
    .update({
      kategori: input.kategori,
      merke,
      modell: input.modell,
      aarsmodell: input.aarsmodell ?? null,
      skaft_modell: input.skaftModell ?? null,
      shaft_flex: input.shaftFlex ?? null,
      haandighet: input.haandighet ?? null,
      loft: input.loft ?? null,
      skaft_materiale: input.skaftMateriale ?? null,
      tilstand: input.tilstand,
      skadebeskrivelse: input.skadebeskrivelse ?? null,
      pris: input.pris,
      selges_fra: input.selgesFra,
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
