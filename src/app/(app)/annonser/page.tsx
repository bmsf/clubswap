import { createClient } from '@/supabase/server'
import { TagIcon } from '@heroicons/react/16/solid'
import Link from 'next/link'
import { AnnonseKortHandlinger } from '@/components/annonse-kort-handlinger'
import { Button } from '@/components/ui/button'
import { ListingCard } from '@/components/ui/card-7'
import { ListingGrid } from '@/components/listing-grid'

export default async function AnnonserPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: annonser } = user
    ? await supabase
        .from('annonser')
        .select('id, merke, modell, tilstand, pris, selges_fra, bilder, opprettet_at')
        .eq('bruker_id', user.id)
        .order('opprettet_at', { ascending: false })
    : { data: [] }

  return (
    <section className="px-4 py-12 md:px-12 lg:px-20">
      <div className="mb-10">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">Mine annonser</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Her finner du alle annonser du har lagt ut.
        </p>
      </div>

      {!annonser || annonser.length === 0 ? (
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-950/10 px-12 py-16 text-center">
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
        <ListingGrid>
          {annonser.map((annonse) => {
            const bilde =
              Array.isArray(annonse.bilder) && annonse.bilder.length > 0
                ? (annonse.bilder[0] as string)
                : undefined

            return (
              <ListingCard
                key={annonse.id}
                flat
                name={annonse.modell}
                brand={annonse.merke}
                condition={annonse.tilstand ?? ''}
                price={annonse.pris}
                location={annonse.selges_fra}
                imageUrl={bilde}
                actions={<AnnonseKortHandlinger id={annonse.id} />}
              />
            )
          })}
        </ListingGrid>
      )}
    </section>
  )
}
