import { EnvelopeIcon } from '@heroicons/react/16/solid'
import { createClient } from '@/supabase/server'
import { SamtaleListe, type SamtaleListeItem } from '@/components/meldinger/samtale-liste'
import { InnboksListe, type InnboksItem } from '@/components/meldinger/innboks-liste'
import { MeldingTraad } from '@/components/meldinger/melding-traad'
import type { Melding } from '@/app/(app)/meldinger/actions'
import { cn } from '@/lib/utils'

type Profil = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
}
type Annonse = {
  id: string
  merke: string
  modell: string
  bilder: unknown
  status?: string | null
  bruker_id: string
}

function visningsnavn(p: Profil | null | undefined): string {
  return p?.full_name?.trim() || p?.username?.trim() || 'Bruker'
}
function annonseTittel(a: Annonse | null | undefined): string {
  return a ? `${a.merke} ${a.modell}`.trim() : 'Annonse'
}
function forsteBilde(bilder: unknown): string | undefined {
  return Array.isArray(bilder) && bilder.length > 0 ? (bilder[0] as string) : undefined
}

interface Props {
  searchParams: Promise<{ annonse?: string; med?: string }>
}

export default async function MeldingerPage({ searchParams }: Props) {
  const { annonse: annonseParam, med: medParam } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <section className="px-4 py-16 md:px-12">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">Meldinger</h1>
        <p className="text-muted-foreground mt-2 text-sm">Logg inn for å se meldingene dine.</p>
      </section>
    )
  }

  const { data: alleData } = await supabase
    .from('messages')
    .select('id, listing_id, sender_id, recipient_id, body, read_at, created_at')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const alle = (alleData ?? []) as Melding[]
  const motpartIdAv = (m: Melding) => (m.sender_id === user.id ? m.recipient_id : m.sender_id)

  const listingIds = [...new Set(alle.map((m) => m.listing_id))]
  const motpartIds = [...new Set(alle.map(motpartIdAv))]
  // ta også med en ev. ny samtale fra «Kontakt selger»
  if (annonseParam && !listingIds.includes(annonseParam)) listingIds.push(annonseParam)
  if (medParam && !motpartIds.includes(medParam)) motpartIds.push(medParam)

  const [{ data: annonser }, { data: profiler }] = await Promise.all([
    listingIds.length
      ? supabase
          .from('annonser')
          .select('id, merke, modell, bilder, status, bruker_id')
          .in('id', listingIds)
      : Promise.resolve({ data: [] as Annonse[] }),
    motpartIds.length
      ? supabase.from('profiles').select('id, full_name, username, avatar_url').in('id', motpartIds)
      : Promise.resolve({ data: [] as Profil[] }),
  ])

  const annonseMap = new Map((annonser ?? []).map((a) => [a.id, a as Annonse]))
  const profilMap = new Map((profiler ?? []).map((p) => [p.id, p as Profil]))

  // Samtaler (annonse + motpart). `alle` er nyeste først → første treff = siste melding.
  type Samtale = SamtaleListeItem & { _sisteAt: number; rolle: 'salg' | 'kjop' }
  const samtaleMap = new Map<string, Samtale>()
  for (const m of alle) {
    const mp = motpartIdAv(m)
    const key = `${m.listing_id}:${mp}`
    let s = samtaleMap.get(key)
    if (!s) {
      const a = annonseMap.get(m.listing_id)
      s = {
        key,
        listingId: m.listing_id,
        motpartId: mp,
        motpartNavn: visningsnavn(profilMap.get(mp)),
        motpartAvatar: profilMap.get(mp)?.avatar_url ?? null,
        annonseTittel: annonseTittel(a),
        annonseBilde: forsteBilde(a?.bilder),
        solgt: a?.status === 'solgt',
        sisteTekst: m.body,
        sistAktiv: m.created_at,
        ulest: 0,
        _sisteAt: new Date(m.created_at).getTime(),
        rolle: a?.bruker_id === user.id ? 'salg' : 'kjop',
      }
      samtaleMap.set(key, s)
    }
    if (m.recipient_id === user.id && !m.read_at) s.ulest += 1
  }

  const samtaler = [...samtaleMap.values()].sort((a, b) => b._sisteAt - a._sisteAt)

  // Innboks-elementer: salg = annonser (gruppert, drill-down), kjøp = flate samtaler.
  type SalgItem = Extract<InnboksItem, { type: 'salg' }> & { _sisteAt: number }
  type KjopItem = Extract<InnboksItem, { type: 'kjop' }> & { _sisteAt: number }
  const salgMap = new Map<string, SalgItem>()
  const kjopItems: KjopItem[] = []
  for (const s of samtaler) {
    if (s.rolle === 'salg') {
      let it = salgMap.get(s.listingId)
      if (!it) {
        it = {
          type: 'salg',
          listingId: s.listingId,
          tittel: s.annonseTittel,
          bilde: s.annonseBilde,
          solgt: s.solgt,
          antallSamtaler: 0,
          ulest: 0,
          sistAktiv: s.sistAktiv,
          _sisteAt: 0,
        }
        salgMap.set(s.listingId, it)
      }
      it.antallSamtaler += 1
      it.ulest += s.ulest
      const at = new Date(s.sistAktiv).getTime()
      if (at > it._sisteAt) {
        it._sisteAt = at
        it.sistAktiv = s.sistAktiv
      }
    } else {
      kjopItems.push({
        type: 'kjop',
        listingId: s.listingId,
        motpartId: s.motpartId,
        motpartNavn: s.motpartNavn,
        tittel: s.annonseTittel,
        bilde: s.annonseBilde,
        solgt: s.solgt,
        sisteTekst: s.sisteTekst,
        ulest: s.ulest,
        sistAktiv: s.sistAktiv,
        _sisteAt: new Date(s.sistAktiv).getTime(),
      })
    }
  }
  const innboksItems: InnboksItem[] = [...salgMap.values(), ...kjopItems].sort(
    (a, b) => b._sisteAt - a._sisteAt
  )

  // Drill-down kun når du selger (du eier annonsen).
  const valgtAnnonse = annonseParam ? annonseMap.get(annonseParam) : null
  const eierValgt = !!annonseParam && valgtAnnonse?.bruker_id === user.id
  const valgtAnnonseSamtaler = annonseParam
    ? samtaler.filter((s) => s.listingId === annonseParam)
    : []
  const drilledIn = eierValgt && valgtAnnonseSamtaler.length >= 1

  // Valgt tråd (høyre).
  let traad: {
    listingId: string
    motpartId: string
    motpartNavn: string
    motpartAvatar: string | null
    annonseId: string
    annonseTittel: string
    meldinger: Melding[]
  } | null = null

  if (annonseParam && medParam && medParam !== user.id) {
    const meldinger = alle
      .filter((m) => m.listing_id === annonseParam && motpartIdAv(m) === medParam)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    traad = {
      listingId: annonseParam,
      motpartId: medParam,
      motpartNavn: visningsnavn(profilMap.get(medParam)),
      motpartAvatar: profilMap.get(medParam)?.avatar_url ?? null,
      annonseId: annonseParam,
      annonseTittel: annonseTittel(annonseMap.get(annonseParam)),
      meldinger,
    }
  }

  const tilbakeUrl = drilledIn ? `/meldinger?annonse=${annonseParam}` : '/meldinger'

  if (samtaler.length === 0 && !traad) {
    return (
      <section className="px-4 py-16 md:px-12">
        <div className="mb-10">
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">Meldinger</h1>
          <p className="text-muted-foreground mt-2 text-sm">Samtaler med kjøpere og selgere.</p>
        </div>
        <div className="border-border flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed px-12 py-16 text-center">
          <div className="bg-muted flex size-12 items-center justify-center rounded-full">
            <EnvelopeIcon className="text-muted-foreground size-5" />
          </div>
          <p className="text-foreground font-medium">Ingen meldinger</p>
          <p className="text-muted-foreground text-sm">
            Meldinger fra kjøpere og selgere vil vises her.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="border-border flex h-[calc(100dvh-8rem)] border-b md:h-[calc(100dvh-4rem)]">
      {/* Venstre: innboks (salg/kjøp) eller samtaler innenfor en salgsannonse */}
      <aside
        className={cn(
          'border-border w-full md:w-90 md:shrink-0 md:border-r',
          traad && 'hidden md:block'
        )}
      >
        {drilledIn ? (
          <SamtaleListe
            annonse={{
              tittel: annonseTittel(valgtAnnonse),
              bilde: forsteBilde(valgtAnnonse?.bilder),
            }}
            samtaler={valgtAnnonseSamtaler}
            activeMed={medParam ?? null}
          />
        ) : (
          <InnboksListe
            items={innboksItems}
            activeListingId={annonseParam ?? null}
            activeMed={medParam ?? null}
          />
        )}
      </aside>

      {/* Høyre: tråd */}
      <div className={cn('min-w-0 flex-1', !traad && 'hidden md:flex')}>
        {traad ? (
          <MeldingTraad
            key={traad.listingId + traad.motpartId}
            listingId={traad.listingId}
            motpartId={traad.motpartId}
            motpartNavn={traad.motpartNavn}
            motpartAvatar={traad.motpartAvatar}
            annonseId={traad.annonseId}
            annonseTittel={traad.annonseTittel}
            currentUserId={user.id}
            initialMeldinger={traad.meldinger}
            tilbakeUrl={tilbakeUrl}
          />
        ) : (
          <div className="text-muted-foreground hidden h-full w-full flex-col items-center justify-center gap-2 text-sm md:flex">
            <EnvelopeIcon className="size-8 opacity-40" />
            <span>Velg en samtale</span>
          </div>
        )}
      </div>
    </section>
  )
}
