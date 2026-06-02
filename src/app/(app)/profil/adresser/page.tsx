import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/supabase/server'
import { hentAdresser } from '@/app/actions/adresser'
import { AdresserKlient } from './adresser-klient'

export default async function AdresserSide() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/logg-inn?fra=/profil/adresser')

  const adresser = await hentAdresser()

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <Link
        href="/profil"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ChevronLeft className="size-4" />
        Tilbake
      </Link>
      <h1 className="text-foreground mb-1 text-xl font-semibold tracking-tight">Adresser</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Lagrede adresser du kan velge mellom når du legger ut en annonse.
      </p>
      <AdresserKlient initialeAdresser={adresser} />
    </section>
  )
}
