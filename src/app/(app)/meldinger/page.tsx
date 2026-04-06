import { Mail } from 'lucide-react'

export default function MeldingerPage() {
  return (
    <section className="px-20 py-16">
      <div className="mb-10">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">Meldinger</h1>
        <p className="text-muted-foreground mt-2 text-sm">Samtaler med kjøpere og selgere.</p>
      </div>

      <div className="border-border flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed px-12 py-16 text-center">
        <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
          <Mail className="text-muted-foreground h-5 w-5" />
        </div>
        <p className="text-foreground font-medium">Ingen meldinger</p>
        <p className="text-muted-foreground text-sm">
          Meldinger fra kjøpere og selgere vil vises her.
        </p>
      </div>
    </section>
  )
}
