// Genererer idempotent seed-SQL for postnummer_steder fra Erik Bolstads frie datasett.
//
// Kilde (lastes ned manuelt ved oppdatering):
//   https://www.erikbolstad.no/postnummer-koordinatar/txt/postnummer.csv
//   lagret som supabase/seed/postnummer-kilde.csv (tab-separert, kolonner POSTNR … LAT LON)
//
// Kjør lokalt:  node scripts/generer-postnummer-seed.mjs
// Resultat:     supabase/seed/0017_seed_postnummer.sql  → limes inn i Supabase-dashboardet.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const rot = join(dirname(fileURLToPath(import.meta.url)), '..')
const KILDE = join(rot, 'supabase/seed/postnummer-kilde.csv')
const UT = join(rot, 'supabase/seed/0017_seed_postnummer.sql')
const BATCH = 500

const sql = (s) => `'${String(s).replace(/'/g, "''")}'`

const linjer = readFileSync(KILDE, 'utf8').split(/\r?\n/).filter(Boolean)
linjer.shift() // dropp header

const rader = []
for (const linje of linjer) {
  const k = linje.split('\t')
  const postnummer = k[0]?.trim()
  const poststed = k[1]?.trim()
  const lat = Number.parseFloat(k[9])
  const lng = Number.parseFloat(k[10])
  if (!postnummer || !poststed || Number.isNaN(lat) || Number.isNaN(lng)) continue
  rader.push(`  (${sql(postnummer)}, ${sql(poststed)}, ${lat}, ${lng})`)
}

// Hver blokk er én linje (ingen linjeskift inni) — trygt å lime/skrive inn i editorer
// som auto-indenterer på linjeskift.
const blokker = []
for (let i = 0; i < rader.length; i += BATCH) {
  blokker.push(
    'insert into postnummer_steder (postnummer, poststed, lat, lng) values ' +
      rader
        .slice(i, i + BATCH)
        .map((r) => r.trim())
        .join(', ') +
      ' on conflict (postnummer) do update set poststed = excluded.poststed, lat = excluded.lat, lng = excluded.lng;'
  )
}

const innhold =
  `-- Seed for postnummer_steder (${rader.length} postnummer). Generert av scripts/generer-postnummer-seed.mjs.\n` +
  `-- Idempotent (on conflict do update). Lim inn i Supabase-dashboardet etter migrasjon 0015.\n\n` +
  blokker.join('\n\n') +
  '\n'

writeFileSync(UT, innhold)
console.log(`Skrev ${rader.length} postnummer til ${UT} (${blokker.length} insert-blokker).`)
