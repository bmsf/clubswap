import { createClient } from '@/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { RedigerAnnonseView } from '@/components/rediger-annonse-view'

export default async function RedigerAnnonseSide({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/logg-inn?fra=/annonser')

  const { data: annonse } = await supabase
    .from('annonser')
    .select('*')
    .eq('id', id)
    .eq('bruker_id', user.id)
    .single()

  if (!annonse) notFound()

  return <RedigerAnnonseView annonse={annonse} />
}
