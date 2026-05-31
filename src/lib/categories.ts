// ── Kategori-taksonomi ──────────────────────────────────────────────────────────
//
// ÉN delt kilde til sannhet for hele kategori-systemet: brukt av opprett-wizarden
// (selg-utstyr-view), browse-filteret (utforsk-client) og header-søket
// (search-index). Tre nivåer: Hovedkategori → Gruppe → Leaf (underkategori).
//
// `annonser.kategori` lagrer leaf-slug-en (globalt unik). Filtrering på hoved-
// eller gruppe-nivå ekspanderer til leaf-slugs via helpere lenger ned.
//
// `profil` på en leaf bestemmer hvilke detaljfelt wizarden viser — rike golf-felt
// for køller/skaft, forenklet generisk skjema ellers. Sentralisert her.

export type DetaljProfil =
  | 'driver'
  | 'wood'
  | 'hybrid'
  | 'iron_set'
  | 'single_iron'
  | 'wedge'
  | 'putter'
  | 'chipper'
  | 'set'
  | 'shaft'
  | 'klaer'
  | 'sko'
  | 'generic'

export type Leaf = {
  slug: string
  label: string
  profil: DetaljProfil
  /** Kun for facet-grupper (f.eks. Skaft etter flex): verdi som matcher en
   *  annonse-kolonne (shaft_flex) i stedet for `kategori`. */
  facetValue?: string
}

export type Gruppe = {
  slug: string
  label: string
  /** Hvis satt filtrerer gruppas leaves på denne annonse-kolonnen, ikke `kategori`.
   *  Slike grupper er ikke valgbare som kategori i wizarden. */
  facet?: 'shaft_flex'
  leaves: Leaf[]
}

export type Hovedkategori = {
  slug: string
  label: string
  grupper: Gruppe[]
}

// ── Slugify ─────────────────────────────────────────────────────────────────────

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Rådata ──────────────────────────────────────────────────────────────────────

type LeafDef = { label: string; profil?: DetaljProfil; facetValue?: string }
type GruppeDef = { label: string; facet?: 'shaft_flex'; leaves: LeafDef[] }
type HovedDef = { slug: string; label: string; grupper: GruppeDef[] }

const L = (label: string, profil?: DetaljProfil): LeafDef => ({ label, profil })

const RAW: HovedDef[] = [
  {
    slug: 'golfkoller',
    label: 'Golfkøller',
    grupper: [
      {
        label: 'Herrekøller',
        leaves: [
          L('Drivere', 'driver'),
          L('Jernsett', 'iron_set'),
          L('Mini Drivere', 'driver'),
          L('Wooder', 'wood'),
          L('Hybrider', 'hybrid'),
          L('Utilityjern', 'single_iron'),
          L('Wedger', 'wedge'),
          L('Puttere', 'putter'),
          L('Chippere', 'chipper'),
          L('Løse jern', 'single_iron'),
          L('Demokøller', 'set'),
        ],
      },
      {
        label: 'Damekøller',
        leaves: [
          L('Drivere', 'driver'),
          L('Jernsett', 'iron_set'),
          L('Wooder', 'wood'),
          L('Hybrider', 'hybrid'),
          L('Wedger', 'wedge'),
          L('Puttere', 'putter'),
          L('Chippere', 'chipper'),
          L('Løse jern', 'single_iron'),
          L('Demokøller', 'set'),
        ],
      },
      {
        label: 'Komplette sett',
        leaves: [
          L('Helsett herre', 'set'),
          L('Halvsett herre', 'set'),
          L('Helsett dame', 'set'),
          L('Halvsett dame', 'set'),
        ],
      },
      {
        label: 'Junior',
        leaves: [L('Juniorsett', 'set'), L('Golfkøller', 'set')],
      },
    ],
  },
  {
    slug: 'klaer-sko',
    label: 'Klær & Sko',
    grupper: [
      {
        label: 'Herreklær',
        leaves: [
          L('Pique og T-Skjorter', 'klaer'),
          L('Gensere', 'klaer'),
          L('Hoodies', 'klaer'),
          L('Jakker', 'klaer'),
          L('Vester', 'klaer'),
          L('Bukser', 'klaer'),
          L('Shortser', 'klaer'),
          L('Logoklær', 'klaer'),
        ],
      },
      {
        label: 'Dameklær',
        leaves: [
          L('Pique og topper', 'klaer'),
          L('Gensere', 'klaer'),
          L('Jakker', 'klaer'),
          L('Vester', 'klaer'),
          L('Bukser', 'klaer'),
          L('Shortser', 'klaer'),
          L('Skjørt og kjoler', 'klaer'),
        ],
      },
      {
        label: 'Regntøy',
        leaves: [L('Herre', 'klaer'), L('Dame', 'klaer'), L('Regnhatter', 'klaer')],
      },
      {
        label: 'Golfsko',
        leaves: [L('Herresko', 'sko'), L('Damesko', 'sko'), L('Juniorsko', 'sko')],
      },
      {
        label: 'Øvrige klær',
        leaves: [
          L('Capser', 'klaer'),
          L('Sokker', 'klaer'),
          L('Belter', 'klaer'),
          L('Solbriller', 'generic'),
          L('Solhatter', 'klaer'),
          L('Regnhatter', 'klaer'),
          L('Luer og halser', 'klaer'),
          L('Votter', 'klaer'),
          L('Undertøy', 'klaer'),
          L('Øvrige klær', 'klaer'),
        ],
      },
    ],
  },
  {
    slug: 'baller-hansker',
    label: 'Baller & Hansker',
    grupper: [
      {
        label: 'Golfballer',
        leaves: [
          L('Golfballer'),
          L('Fargede golfballer'),
          L('Lakeballs'),
          L('Simulatorballer'),
          L('Logoballer'),
          L('Personlig Trykk'),
        ],
      },
      {
        label: 'Golfhansker',
        leaves: [
          L('Herrehansker'),
          L('Damehansker'),
          L('Juniorhansker'),
          L('Regnhansker'),
          L('Vinterhansker'),
        ],
      },
    ],
  },
  {
    slug: 'traller-bagger',
    label: 'Traller & Bagger',
    grupper: [
      {
        label: 'Golfbagger',
        leaves: [
          L('Bærebagger'),
          L('Trallebagger'),
          L('Pencil- og småbagger'),
          L('Reisebagger'),
          L('Sekker, vesker og bagger'),
          L('Logobagger'),
        ],
      },
      {
        label: 'Golftraller',
        leaves: [L('Golftraller'), L('Elektriske golftraller'), L('Juniortraller')],
      },
      {
        label: 'Tilbehør',
        leaves: [
          L('Tilbehør Golftraller'),
          L('Tilbehør Elektriske golftraller'),
          L('Regntrekk'),
          L('Reservedeler'),
        ],
      },
      {
        label: 'Golfbiler',
        leaves: [L('Elektriske golfbiler')],
      },
    ],
  },
  {
    slug: 'elektronikk',
    label: 'Elektronikk',
    grupper: [
      {
        label: 'Elektronikk',
        leaves: [
          L('Golfklokker'),
          L('Lasermålere'),
          L('Svinganalyse'),
          L('GPS'),
          L('Tilbehør elektronikk'),
        ],
      },
    ],
  },
  {
    slug: 'trening',
    label: 'Trening',
    grupper: [
      {
        label: 'Hjemmesimulator',
        leaves: [
          L('Golfsimulatorer'),
          L('Lerreter'),
          L('Golfmatter'),
          L('Projektorer'),
          L('Rangepegger'),
          L('Simulatorballer'),
        ],
      },
      {
        label: 'Trening',
        leaves: [
          L('Treningspakker'),
          L('Svingtrening'),
          L('Treningsnett'),
          L('Puttetrening'),
          L('Chippetrening'),
          L('Treningsballer'),
          L('Øvrige treningsprodukter'),
        ],
      },
    ],
  },
  {
    slug: 'tilbehor',
    label: 'Tilbehør',
    grupper: [
      {
        label: 'Golftilbehør',
        leaves: [
          L('Golfpegger'),
          L('Håndkler'),
          L('Paraplyer'),
          L('Køllebørster'),
          L('Headcovere'),
          L('Markører'),
          L('Greengaffler'),
          L('Banetilbehør'),
          L('Golfsnacks'),
          L('Sekker, vesker og bagger'),
          L('Øvrige tilbehør'),
          L('Logotilbehør'),
        ],
      },
      {
        label: 'Grep og kølletilbehør',
        leaves: [
          L('Køllegrep'),
          L('Puttergrep'),
          L('Golfskaft', 'shaft'),
          L('Greptape og tilbehør'),
          L('Skaftadaptere'),
          L('Lim og tilbehør'),
        ],
      },
    ],
  },
  {
    slug: 'shaft',
    label: 'Shafts',
    grupper: [
      {
        label: 'Skaft etter kølletype',
        leaves: [
          L('Driver-/treskaft', 'shaft'),
          L('Hybridskaft', 'shaft'),
          L('Jernskaft', 'shaft'),
          L('Putterskaft', 'shaft'),
          L('Skaftadaptere', 'shaft'),
          L('Øvrige skaft', 'shaft'),
        ],
      },
      {
        label: 'Skaft etter flex',
        facet: 'shaft_flex',
        leaves: [
          { label: 'Ladies (L)', facetValue: 'L' },
          { label: 'Senior / A-flex', facetValue: 'A' },
          { label: 'Regular (R)', facetValue: 'R' },
          { label: 'Stiff (S)', facetValue: 'S' },
          { label: 'Extra Stiff (X)', facetValue: 'X' },
        ],
      },
    ],
  },
]

// ── Bygg taksonomi med slugs ──────────────────────────────────────────────────

export const TAKSONOMI: Hovedkategori[] = RAW.map((hoved) => ({
  slug: hoved.slug,
  label: hoved.label,
  grupper: hoved.grupper.map((gruppe) => {
    const gruppeSlug = `${hoved.slug}-${slugify(gruppe.label)}`
    return {
      slug: gruppeSlug,
      label: gruppe.label,
      facet: gruppe.facet,
      leaves: gruppe.leaves.map((leaf) => ({
        slug: `${gruppeSlug}-${slugify(leaf.label)}`,
        label: leaf.label,
        profil: leaf.profil ?? 'generic',
        facetValue: leaf.facetValue,
      })),
    }
  }),
}))

export const HOVEDKATEGORIER = TAKSONOMI.map((h) => ({ slug: h.slug, label: h.label }))

// ── Oppslagsindekser ──────────────────────────────────────────────────────────

type LeafTreff = { hoved: Hovedkategori; gruppe: Gruppe; leaf: Leaf }

const LEAF_BY_SLUG = new Map<string, LeafTreff>()
const GROUP_BY_SLUG = new Map<string, { hoved: Hovedkategori; gruppe: Gruppe }>()
const MAIN_BY_SLUG = new Map<string, Hovedkategori>()

for (const hoved of TAKSONOMI) {
  MAIN_BY_SLUG.set(hoved.slug, hoved)
  for (const gruppe of hoved.grupper) {
    GROUP_BY_SLUG.set(gruppe.slug, { hoved, gruppe })
    for (const leaf of gruppe.leaves) {
      LEAF_BY_SLUG.set(leaf.slug, { hoved, gruppe, leaf })
    }
  }
}

// ── Flat liste (søk-indeks) ─────────────────────────────────────────────────────

export type FlatLeaf = {
  slug: string
  label: string
  hovedSlug: string
  hovedLabel: string
  gruppeLabel: string
  profil: DetaljProfil
  facet?: 'shaft_flex'
}

export const ALLE_LEAVES: FlatLeaf[] = TAKSONOMI.flatMap((hoved) =>
  hoved.grupper.flatMap((gruppe) =>
    gruppe.leaves.map((leaf) => ({
      slug: leaf.slug,
      label: leaf.label,
      hovedSlug: hoved.slug,
      hovedLabel: hoved.label,
      gruppeLabel: gruppe.label,
      profil: leaf.profil,
      facet: gruppe.facet,
    }))
  )
)

// ── Helpere ─────────────────────────────────────────────────────────────────────

/** Finn leaf-treff (hoved + gruppe + leaf) for en lagret kategori-slug. */
export function finnLeaf(slug: string | null | undefined): LeafTreff | null {
  if (!slug) return null
  return LEAF_BY_SLUG.get(slug) ?? null
}

/** Visningslabel for en slug (leaf, gruppe eller hoved). Null hvis ukjent. */
export function kategoriLabel(slug: string | null | undefined): string | null {
  if (!slug) return null
  return (
    LEAF_BY_SLUG.get(slug)?.leaf.label ??
    GROUP_BY_SLUG.get(slug)?.gruppe.label ??
    MAIN_BY_SLUG.get(slug)?.label ??
    null
  )
}

/** Detaljfelt-profil for en lagret kategori-slug (default 'generic'). */
export function detaljProfil(slug: string | null | undefined): DetaljProfil {
  return finnLeaf(slug)?.leaf.profil ?? 'generic'
}

/** Hovedkategori-slug for en lagret kategori-slug. */
export function hovedForSlug(slug: string | null | undefined): string | null {
  return finnLeaf(slug)?.hoved.slug ?? null
}

/**
 * Ekspander en valgt slug (hoved, gruppe eller leaf) til de lagrede kategori-
 * leaf-slug-ene den dekker. Facet-grupper/leaves gir tom liste (de filtrerer på
 * en annen kolonne — bruk `facetForSlug`).
 */
export function leafSlugsForSlug(slug: string): string[] {
  const main = MAIN_BY_SLUG.get(slug)
  if (main) {
    return main.grupper.filter((g) => !g.facet).flatMap((g) => g.leaves.map((l) => l.slug))
  }
  const group = GROUP_BY_SLUG.get(slug)
  if (group) {
    return group.gruppe.facet ? [] : group.gruppe.leaves.map((l) => l.slug)
  }
  const treff = LEAF_BY_SLUG.get(slug)
  if (treff) return treff.gruppe.facet ? [] : [treff.leaf.slug]
  return []
}

/** Hvis slug-en er en facet-leaf, returner { facet, value } for kolonnefiltrering. */
export function facetForSlug(slug: string): { facet: 'shaft_flex'; value: string } | null {
  const leaf = LEAF_BY_SLUG.get(slug)
  if (leaf?.gruppe.facet && leaf.leaf.facetValue) {
    return { facet: leaf.gruppe.facet, value: leaf.leaf.facetValue }
  }
  return null
}

/** Shaft-DB-kategori (golf_shafts) for en klubb-/skaft-profil — for SkaftVelger. */
export function shaftKategoriForProfil(profil: DetaljProfil): string | undefined {
  switch (profil) {
    case 'driver':
    case 'wood':
    case 'hybrid':
      return 'driver_fairway'
    case 'iron_set':
    case 'single_iron':
      return 'iron'
    case 'wedge':
      return 'wedge'
    case 'putter':
      return 'putter'
    default:
      return undefined
  }
}

// Prisanbefaling per hovedkategori (vises i pris-steget).
export const PRIS_ANBEFALING: Record<string, string> = {
  golfkoller: '300–4 000 kr',
  'klaer-sko': '100–1 500 kr',
  'baller-hansker': '50–500 kr',
  'traller-bagger': '200–5 000 kr',
  elektronikk: '500–5 000 kr',
  trening: '100–10 000 kr',
  tilbehor: '50–1 500 kr',
  shaft: '300–4 000 kr',
}

// ── Legacy-mapping: golf_equipment / AI-kategori → standard leaf-slug ────────────
// golf_equipment-tabellen og AI-analysen bruker engelske/korte kategorikoder.
// Map disse til en fornuftig standard-leaf i den nye taksonomien (Herrekøller-
// varianten der det finnes en kjønnsdeling). Brukeren kan endre etterpå.

const HERREKOLLER = 'golfkoller-herrekoller'
const SHAFT_TYPE = 'shaft-skaft-etter-kolletype'

const LEGACY_KATEGORI: Record<string, string> = {
  driver: `${HERREKOLLER}-drivere`,
  mini_driver: `${HERREKOLLER}-mini-drivere`,
  fairway: `${HERREKOLLER}-wooder`,
  fairway_wood: `${HERREKOLLER}-wooder`,
  wood: `${HERREKOLLER}-wooder`,
  hybrid: `${HERREKOLLER}-hybrider`,
  utility_iron: `${HERREKOLLER}-utilityjern`,
  iron: `${HERREKOLLER}-lose-jern`,
  single_iron: `${HERREKOLLER}-lose-jern`,
  'enkelt-jern': `${HERREKOLLER}-lose-jern`,
  enkelt_jern: `${HERREKOLLER}-lose-jern`,
  irons: `${HERREKOLLER}-jernsett`,
  iron_set: `${HERREKOLLER}-jernsett`,
  jernsett: `${HERREKOLLER}-jernsett`,
  wedge: `${HERREKOLLER}-wedger`,
  putter: `${HERREKOLLER}-puttere`,
  chipper: `${HERREKOLLER}-chippere`,
  bag: 'traller-bagger-golfbagger-trallebagger',
  golf_bag: 'traller-bagger-golfbagger-trallebagger',
  stand_bag: 'traller-bagger-golfbagger-baerebagger',
  cart_bag: 'traller-bagger-golfbagger-trallebagger',
  tour_bag: 'traller-bagger-golfbagger-trallebagger',
  shoes: 'klaer-sko-golfsko-herresko',
  golf_shoes: 'klaer-sko-golfsko-herresko',
  sko: 'klaer-sko-golfsko-herresko',
  klaer: 'klaer-sko-herreklaer-gensere',
  hansker: 'baller-hansker-golfhansker-herrehansker',
  baller: 'baller-hansker-golfballer-golfballer',
  rangefinder: 'elektronikk-elektronikk-lasermalere',
  gps: 'elektronikk-elektronikk-gps',
  elektronikk: 'elektronikk-elektronikk-golfklokker',
  shaft: `${SHAFT_TYPE}-driver-treskaft`,
  other: 'tilbehor-golftilbehor-ovrige-tilbehor',
  annet: 'tilbehor-golftilbehor-ovrige-tilbehor',
}

/** Map en golf_equipment-/AI-kategori til en standard leaf-slug (eller null). */
export function legacyKategoriTilLeaf(cat: string | null | undefined): string | null {
  if (!cat) return null
  if (LEAF_BY_SLUG.has(cat)) return cat
  return LEGACY_KATEGORI[cat] ?? null
}
