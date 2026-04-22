import { createClient } from '@/supabase/server'
import { TagIcon, MapPinIcon, ArchiveBoxIcon } from '@heroicons/react/16/solid'
import Link from 'next/link'
import { AnnonseKortHandlinger } from '@/components/annonse-kort-handlinger'
import { Button } from '@/components/ui/button'

const TILSTAND_KLASSE: Record<string, string> = {
  Ny: 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950',
  'Meget god':
    'text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950',
  God: 'text-primary border-primary/30 bg-primary/8',
  Akseptabel:
    'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950',
}

export default async function AnnonserPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: annonser } = user
    ? await supabase
        .from('annonser')
        .select('id, merke, modell, tilstand, pris, selges_fra, bilder, kategori, opprettet_at')
        .eq('bruker_id', user.id)
        .order('opprettet_at', { ascending: false })
    : { data: [] }

  return (
    <section className="px-20 py-16">
      <div className="mb-10">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">Mine annonser</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Her finner du alle annonser du har lagt ut.
        </p>
      </div>

      {!annonser || annonser.length === 0 ? (
        <div className="border-border flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed px-12 py-16 text-center">
          <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
            <TagIcon className="text-muted-foreground h-5 w-5" />
          </div>
          <p className="text-foreground font-medium">Ingen annonser ennå</p>
          <p className="text-muted-foreground text-sm">Annonser du legger ut vil dukke opp her.</p>
          <Button asChild variant="primary">
            <Link href="/selg">Legg ut utstyr</Link>
          </Button>
        </div>
      ) : (
        <div className="grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {annonser.map((annonse) => {
            const forsideBilde =
              Array.isArray(annonse.bilder) && annonse.bilder.length > 0
                ? (annonse.bilder[0] as string)
                : null

            return (
              <div
                key={annonse.id}
                className="surface group flex flex-col overflow-hidden rounded-2xl transition-shadow hover:shadow-md"
              >
                <div className="bg-muted relative aspect-4/3 overflow-hidden">
                  {forsideBilde ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={forsideBilde}
                      alt={`${annonse.merke} ${annonse.modell}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ArchiveBoxIcon className="text-muted-foreground h-10 w-10" />
                    </div>
                  )}
                  {annonse.tilstand && (
                    <span
                      className={[
                        'absolute top-2 left-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                        TILSTAND_KLASSE[annonse.tilstand] ?? '',
                      ].join(' ')}
                    >
                      {annonse.tilstand}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <p className="text-foreground truncate font-medium">
                    {annonse.merke} {annonse.modell}
                  </p>
                  <p className="text-primary font-mono text-base font-semibold">
                    {annonse.pris.toLocaleString('nb-NO')} kr
                  </p>
                  {annonse.selges_fra && (
                    <p className="text-muted-foreground flex items-center gap-1 text-xs">
                      <MapPinIcon className="h-3 w-3" />
                      {annonse.selges_fra}
                    </p>
                  )}
                </div>

                <AnnonseKortHandlinger id={annonse.id} />
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
