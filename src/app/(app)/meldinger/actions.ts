'use server'

import { createClient } from '@/supabase/server'

export type Melding = {
  id: string
  listing_id: string
  sender_id: string
  recipient_id: string
  body: string
  read_at: string | null
  created_at: string
}

export async function sendMelding(input: {
  listingId: string
  recipientId: string
  body: string
}): Promise<{ feil: string } | { melding: Melding }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { feil: 'Du må være innlogget for å sende meldinger.' }

  const body = input.body.trim()
  if (!body) return { feil: 'Skriv en melding først.' }
  if (input.recipientId === user.id) return { feil: 'Du kan ikke sende melding til deg selv.' }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      listing_id: input.listingId,
      sender_id: user.id,
      recipient_id: input.recipientId,
      body,
    })
    .select('id, listing_id, sender_id, recipient_id, body, read_at, created_at')
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    return { feil: `Kunne ikke sende meldingen: ${error.message}` }
  }

  return { melding: data as Melding }
}

export async function slettSamtale(
  listingId: string,
  motpartId: string
): Promise<{ feil: string } | { ok: true }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { feil: 'Du må være innlogget.' }

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('listing_id', listingId)
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${motpartId}),and(sender_id.eq.${motpartId},recipient_id.eq.${user.id})`
    )

  if (error) {
    console.error('Supabase delete error:', error)
    return { feil: `Kunne ikke slette samtalen: ${error.message}` }
  }

  return { ok: true }
}

export async function markerSamtaleLest(
  listingId: string,
  motpartId: string
): Promise<{ feil: string } | { ok: true }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { feil: 'Du må være innlogget.' }

  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('listing_id', listingId)
    .eq('sender_id', motpartId)
    .eq('recipient_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('Supabase update error:', error)
    return { feil: error.message }
  }

  return { ok: true }
}
