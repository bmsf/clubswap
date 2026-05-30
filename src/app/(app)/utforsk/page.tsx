import { createClient } from '@/supabase/server'
import { UtforskClient } from '../utforsk-client'

interface Props {
  searchParams: Promise<{ kategori?: string | string[] }>
}

export default async function UtforskPage({ searchParams }: Props) {
  const { kategori } = await searchParams
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('annonser')
    .select(
      'id, merke, modell, tilstand, pris, selges_fra, bilder, opprettet_at, kategori, skaft_materiale, haandighet, loft, koller'
    )
    .eq('status', 'aktiv')
    .order('opprettet_at', { ascending: false })
    .limit(48)

  const initialKategori = kategori ? (Array.isArray(kategori) ? kategori : [kategori]) : undefined

  return <UtforskClient listings={listings ?? []} initialKategori={initialKategori} />
}
