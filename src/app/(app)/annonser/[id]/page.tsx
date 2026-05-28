import { notFound } from 'next/navigation'
import { createClient } from '@/supabase/server'
import { ProductDetailPage } from '@/components/ui/product-detail-page'

export default async function AnnonseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: annonse } = await supabase
    .from('annonser')
    .select(
      'id, bruker_id, kategori, merke, modell, aarsmodell, skaft_modell, shaft_flex, haandighet, loft, skaft_materiale, tilstand, beskrivelse, skadebeskrivelse, pris, selges_fra, tilbyr_frakt, bilder'
    )
    .eq('id', id)
    .single()

  if (!annonse) notFound()

  const { data: profil } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url, location_city')
    .eq('id', annonse.bruker_id)
    .single()

  const seller = {
    id: profil?.id ?? annonse.bruker_id,
    name: profil?.full_name ?? '',
    username: profil?.username ?? 'ukjent',
    avatarUrl: profil?.avatar_url ?? null,
    locationCity: profil?.location_city ?? null,
  }

  return (
    <ProductDetailPage
      id={annonse.id}
      title={`${annonse.merke} ${annonse.modell}`}
      merke={annonse.merke}
      modell={annonse.modell}
      kategori={annonse.kategori}
      tilstand={annonse.tilstand}
      pris={annonse.pris}
      selgesFra={annonse.selges_fra}
      tilbyrFrakt={annonse.tilbyr_frakt}
      bilder={Array.isArray(annonse.bilder) ? (annonse.bilder as string[]) : []}
      beskrivelse={annonse.beskrivelse}
      skadebeskrivelse={annonse.skadebeskrivelse}
      aarsmodell={annonse.aarsmodell}
      shaftFlex={annonse.shaft_flex}
      skaftMateriale={annonse.skaft_materiale}
      loft={annonse.loft}
      haandighet={annonse.haandighet}
      skaftModell={annonse.skaft_modell}
      seller={seller}
    />
  )
}
