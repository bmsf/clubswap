import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { Tag, Heart, MessageSquare, ChevronRight, LogOut } from 'lucide-react'
import { loggUt } from '@/app/(auth)/actions'

export default async function ProfilPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { count: antallAnnonser } = user
    ? await supabase
        .from('annonser')
        .select('id', { count: 'exact', head: true })
        .eq('bruker_id', user.id)
    : { count: null }

  const fulltNavn = user?.user_metadata?.full_name as string | undefined
  const navn = fulltNavn ?? user?.email ?? 'Min konto'
  const initialer =
    fulltNavn
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    '?'

  const rader = [
    { href: '/annonser', label: 'Mine annonser', icon: Tag, badge: antallAnnonser ?? undefined },
    { href: '/lagrede', label: 'Lagrede', icon: Heart },
    { href: '/meldinger', label: 'Meldinger', icon: MessageSquare },
  ]

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      {/* Identitet */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-lg font-semibold text-neutral-950">
          {initialer}
        </div>
        <div className="min-w-0">
          <h1 className="text-foreground truncate text-xl font-semibold tracking-tight">{navn}</h1>
          {user?.email && <p className="text-muted-foreground truncate text-sm">{user.email}</p>}
        </div>
      </div>

      {/* Konto-rader */}
      <div className="overflow-hidden rounded-2xl border border-neutral-950/10">
        {rader.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className="hover:bg-muted flex items-center justify-between gap-3 border-b border-neutral-950/10 px-4 py-3.5 transition-colors last:border-0"
          >
            <span className="flex items-center gap-3">
              <Icon className="text-muted-foreground size-4 shrink-0" />
              <span className="text-foreground text-sm">{label}</span>
            </span>
            <span className="flex items-center gap-2">
              {badge != null && badge > 0 && (
                <span className="text-muted-foreground text-xs tabular-nums">{badge}</span>
              )}
              <ChevronRight className="text-muted-foreground size-4 shrink-0" />
            </span>
          </Link>
        ))}
      </div>

      {/* Logg ut */}
      <form action={loggUt} className="mt-4">
        <button
          type="submit"
          className="hover:bg-muted flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-neutral-950/10 px-4 py-3.5 text-sm transition-colors"
        >
          <LogOut className="text-muted-foreground size-4 shrink-0" />
          <span className="text-foreground">Logg ut</span>
        </button>
      </form>
    </section>
  )
}
