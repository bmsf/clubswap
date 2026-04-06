import { SelgUtstyrView } from '@/components/selg-utstyr-view'

type Annonse = {
  id: string
  kategori: string
  merke: string
  modell: string
  aarsmodell?: string | null
  skaft_modell?: string | null
  shaft_flex?: string | null
  haandighet?: string | null
  loft?: string | null
  skaft_materiale?: string | null
  tilstand: string
  skadebeskrivelse?: string | null
  pris: number
  selges_fra: string
  tilbyr_frakt: boolean
  bilder: string[]
}

export function RedigerAnnonseView({ annonse }: { annonse: Annonse }) {
  const kjenteMerker = [
    'TaylorMade',
    'Callaway',
    'Titleist',
    'Ping',
    'Cobra',
    'Cleveland',
    'Srixon',
    'Mizuno',
    'Wilson',
    'Odyssey',
    'Scotty Cameron',
    'PXG',
    'Honma',
  ]

  const merkeErKjent = kjenteMerker.includes(annonse.merke)

  return (
    <SelgUtstyrView
      annonseId={annonse.id}
      eksisterendeBilder={annonse.bilder ?? []}
      initialData={{
        kategori: annonse.kategori as never,
        merke: merkeErKjent ? annonse.merke : 'Annet',
        annetMerke: merkeErKjent ? undefined : annonse.merke,
        modell: annonse.modell,
        aarsmodell: annonse.aarsmodell ?? undefined,
        skaftModell: annonse.skaft_modell ?? undefined,
        shaftFlex: (annonse.shaft_flex as never) ?? undefined,
        haandighet: (annonse.haandighet as never) ?? undefined,
        loft: annonse.loft ?? undefined,
        skaftMateriale: (annonse.skaft_materiale as never) ?? undefined,
        tilstand: annonse.tilstand as never,
        skadebeskrivelse: annonse.skadebeskrivelse ?? undefined,
        pris: annonse.pris,
        selgesFra: annonse.selges_fra,
        tilbyrFrakt: annonse.tilbyr_frakt,
        bildeLater: false,
      }}
    />
  )
}
