import { UserIcon } from '@heroicons/react/16/solid'

export default function ProfilPage() {
  return (
    <section className="px-20 py-16">
      <div className="mb-10">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">Profil</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Administrer kontoen din og dine innstillinger.
        </p>
      </div>

      <div className="border-border flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed px-12 py-16 text-center">
        <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
          <UserIcon className="text-muted-foreground h-5 w-5" />
        </div>
        <p className="text-foreground font-medium">Profilside kommer snart</p>
        <p className="text-muted-foreground text-sm">
          Her vil du kunne redigere profilen din, se statistikk og administrere kontoen.
        </p>
      </div>
    </section>
  )
}
