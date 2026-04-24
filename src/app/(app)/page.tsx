import { createClient } from '@/supabase/server'
import { UtforskClient } from './utforsk-client'

export default async function UtforskPage() {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('annonser')
    .select('id, merke, modell, tilstand, pris, selges_fra, bilder, opprettet_at')
    .order('opprettet_at', { ascending: false })
    .limit(48)

  return <UtforskClient listings={listings ?? []} />
}
