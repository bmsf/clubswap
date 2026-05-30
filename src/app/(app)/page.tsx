import Link from 'next/link'
import { createClient } from '@/supabase/server'
import { ChevronRight } from 'lucide-react'

const KATEGORIER: { label: string; key: string; dbValues: string[]; staticImage?: string }[] = [
  {
    label: 'Golfkøller',
    key: 'golfkoller',
    dbValues: ['driver', 'fairway_wood', 'hybrid', 'jernsett', 'enkelt-jern', 'wedge', 'putter'],
    staticImage: 'https://golf.com/wp-content/uploads/2022/10/driver.jpg',
  },
  {
    label: 'Klær & Sko',
    key: 'klaer_sko',
    dbValues: ['sko', 'klaer'],
    staticImage: 'https://i.pinimg.com/736x/93/54/33/9354337027776ef3a12c0b67b6ea1040.jpg',
  },
  {
    label: 'Baller',
    key: 'baller',
    dbValues: ['baller'],
    staticImage:
      'https://i0.wp.com/golfalot.com/wp-content/uploads/2025/01/Screenshot-2025-01-13-130700-edited.png?resize=817%2C454&ssl=1',
  },
  {
    label: 'Bagger',
    key: 'bagger',
    dbValues: ['bag'],
    staticImage:
      'https://www.titleist.eu/on/demandware.static/-/Library-Sites-TitleistSharedLibrary/default/dw2dbae93f/images/p1-module/26GolfBags-PLP-Mobile.jpg',
  },
  {
    label: 'Annet',
    key: 'annet',
    dbValues: ['annet', 'rangefinder', 'elektronikk'],
    staticImage: 'https://cdn.mos.cms.futurecdn.net/GSr9dZL2cjpvSEUnjiv4wJ.jpg',
  },
]

export default async function LandingPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('annonser')
    .select('kategori, bilder')
    .eq('status', 'aktiv')
    .not('bilder', 'is', null)
    .order('opprettet_at', { ascending: false })
    .limit(100)

  // Map each landing category to the first image found among its DB values
  const dbImageMap = new Map<string, string>()
  for (const row of data ?? []) {
    if (!row.kategori || dbImageMap.has(row.kategori)) continue
    const bilder = row.bilder as unknown[]
    if (Array.isArray(bilder) && bilder.length > 0) {
      dbImageMap.set(row.kategori, bilder[0] as string)
    }
  }

  function imageFor(values: string[]): string | undefined {
    for (const v of values) {
      const img = dbImageMap.get(v)
      if (img) return img
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Velg kategori</h1>
        <Link
          href="/utforsk"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
        >
          Se alle annonser
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {KATEGORIER.map(({ label, key, dbValues, staticImage }) => {
          const img = staticImage ?? imageFor(dbValues)
          return (
            <Link
              key={key}
              href={`/utforsk?kategori=${key}`}
              className="group relative aspect-3/4 overflow-hidden rounded-lg"
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img}
                  alt={label}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
              ) : (
                <div className="from-muted to-muted/60 absolute inset-0 bg-linear-to-br" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              <span className="text-primary-foreground absolute right-0 bottom-4 left-0 text-center text-lg font-bold drop-shadow">
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
