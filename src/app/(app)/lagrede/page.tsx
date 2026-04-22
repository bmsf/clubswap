import { HeartIcon } from '@heroicons/react/16/solid'

export default function LagredeePage() {
  return (
    <section className="px-20 py-16">
      <div className="mb-10">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">Lagrede</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Annonser du har lagret for å følge med på.
        </p>
      </div>

      <div className="border-border flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed px-12 py-16 text-center">
        <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
          <HeartIcon className="text-muted-foreground h-5 w-5" />
        </div>
        <p className="text-foreground font-medium">Ingen lagrede annonser</p>
        <p className="text-muted-foreground text-sm">
          Trykk på hjertet på en annonse for å lagre den her.
        </p>
      </div>
    </section>
  )
}
