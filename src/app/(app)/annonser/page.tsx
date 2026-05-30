import { createClient } from '@/supabase/server'
import { TagIcon } from '@heroicons/react/16/solid'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnnonseRad, type AnnonseRadData } from '@/components/annonse-rad'
import { AnnonseStatusFilter, type AnnonseTab } from '@/components/annonse-status-filter'

const TAB_TO_STATUS: Record<AnnonseTab, string> = {
  aktiv: 'aktiv',
  paabegynt: 'paabegynt',
  ferdig: 'solgt',
}

const TOM_TEKST: Record<AnnonseTab, string> = {
  aktiv: 'Annonser du legger ut vil dukke opp her.',
  paabegynt: 'Du har ingen påbegynte annonser ennå.',
  ferdig: 'Annonser du markerer som solgt havner her.',
}

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AnnonserPage({ searchParams }: Props) {
  const { status } = await searchParams
  const activeTab: AnnonseTab = status === 'paabegynt' || status === 'ferdig' ? status : 'aktiv'

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: annonser } = user
    ? await supabase
        .from('annonser')
        .select('id, merke, modell, tilstand, pris, selges_fra, bilder, opprettet_at, status')
        .eq('bruker_id', user.id)
        .order('opprettet_at', { ascending: false })
    : { data: [] }

  const alle = (annonser ?? []) as AnnonseRadData[]

  const counts = {
    aktiv: alle.filter((a) => a.status === 'aktiv').length,
    paabegynt: alle.filter((a) => a.status === 'paabegynt').length,
    ferdig: alle.filter((a) => a.status === 'solgt').length,
  }

  const synlige = alle.filter((a) => a.status === TAB_TO_STATUS[activeTab])

  return (
    <section className="px-4 py-12 md:px-12 lg:px-20">
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">Mine annonser</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Her finner du alle annonser du har lagt ut.
        </p>
      </div>

      {alle.length === 0 ? (
        <div className="border-border flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed px-12 py-16 text-center">
          <div className="bg-muted flex size-12 items-center justify-center rounded-full">
            <TagIcon className="text-muted-foreground size-5" />
          </div>
          <p className="text-foreground font-medium">Ingen annonser ennå</p>
          <p className="text-muted-foreground text-sm">Annonser du legger ut vil dukke opp her.</p>
          <Button asChild variant="primary">
            <Link href="/selg">Legg ut utstyr</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-2">
            <AnnonseStatusFilter active={activeTab} counts={counts} />
          </div>

          {synlige.length === 0 ? (
            <div className="text-muted-foreground py-16 text-center text-sm">
              {TOM_TEKST[activeTab]}
            </div>
          ) : (
            <div className="border-border border-t">
              {synlige.map((annonse) => (
                <AnnonseRad key={annonse.id} annonse={annonse} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
