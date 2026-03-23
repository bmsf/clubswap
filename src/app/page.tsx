import Link from 'next/link'
import { ArrowRight, Shield, Zap, Star, Check, MapPin, Clock, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/theme-toggle'

// ─── Data ─────────────────────────────────────────────────────────────────────

const BRANDS = [
  'Titleist',
  'Callaway',
  'TaylorMade',
  'Ping',
  'Mizuno',
  'Cleveland',
  'Cobra',
  'Wilson Staff',
]

const STATS = [
  { value: '45 000+', label: 'Registrerte brukere' },
  { value: '12 000+', label: 'Aktive annonser' },
  { value: '98 %', label: 'Fornøyde kjøpere' },
  { value: '4.8 / 5', label: 'Snittkarakter' },
]

const TESTIMONIALS = [
  {
    quote: 'Solgte hele køllesettet mitt på to dager. Aldri trodd det skulle gå så raskt!',
    name: 'Erik Johansen',
    meta: 'Hcp. 12 · Oslo',
    initials: 'EJ',
  },
  {
    quote: 'Fant en perle av en putter til halv pris. ClubSwap er gull verdt for alle golfere.',
    name: 'Marte Lindqvist',
    meta: 'Hcp. 24 · Bergen',
    initials: 'ML',
  },
  {
    quote: 'Enkelt, trygt og raskt. Anbefaler ClubSwap til alle golfvenner jeg kjenner.',
    name: 'Thomas Bakke',
    meta: 'Hcp. 8 · Trondheim',
    initials: 'TB',
  },
]

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link
      href="/"
      className="text-foreground flex items-center gap-2.5 text-lg font-bold tracking-tight"
    >
      <span className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
        <span className="h-3.5 w-3.5 rounded-full bg-white" />
      </span>
      ClubSwap
    </Link>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="border-border bg-background/95 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-7 md:flex">
          {['Kjøp', 'Selg', 'Merker', 'Om oss'].map((item) => (
            <Link
              key={item}
              href="#"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="#"
            className="text-muted-foreground hover:text-foreground hidden text-sm font-medium transition-colors sm:block"
          >
            Logg inn
          </Link>
          <Button size="sm">Legg ut annonse</Button>
        </div>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-start">
          {/* Headline */}
          <h1 className="text-foreground text-5xl leading-[1.08] font-[550] tracking-tighter sm:text-6xl lg:w-3/5 lg:text-7xl">
            Kjøp og selg golfutstyr med tillit.
          </h1>

          {/* Right column */}
          <div className="flex flex-col items-start gap-8 lg:w-2/5 lg:pt-2">
            <p className="text-muted-foreground text-lg leading-relaxed">
              Norges største markedsplass for brukt golfutstyr. Registrer deg gratis og nå tusenvis
              av golfere over hele landet.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg">Utforsk annonser</Button>
              <Button variant="outline" size="lg">
                Selg utstyr
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Logo Cloud ───────────────────────────────────────────────────────────────

function LogoCloud() {
  return (
    <section className="border-border bg-muted/40 border-y py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-muted-foreground mb-10 text-center text-xs font-semibold tracking-widest uppercase">
          Utstyr fra landets fremste merker
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
          {BRANDS.map((brand) => (
            <span
              key={brand}
              className="text-muted-foreground/40 hover:text-muted-foreground/70 cursor-default text-lg font-semibold transition-colors select-none"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section className="bg-background py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 text-center">
          <p className="text-primary mb-3 text-xs font-semibold tracking-widest uppercase">
            Hvorfor ClubSwap
          </p>
          <h2 className="text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Bygget for golfere
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl text-lg">
            Vi har gjort det enkelt å finne, kjøpe og selge golfutstyr på én plattform.
          </p>
        </div>

        {/* Feature 1 — Sell fast */}
        <div className="mb-24 grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="bg-primary/10 mb-6 flex h-12 w-12 items-center justify-center rounded-xl">
              <Zap className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-foreground mb-4 text-3xl font-bold tracking-tight">
              Selg utstyret ditt på minutter
            </h3>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
              Legg ut annonsen din på under to minutter. Ta et bilde, skriv en beskrivelse og sett
              prisen — vi tar oss av resten.
            </p>
            <ul className="space-y-4">
              {[
                'Enkel opplasting fra mobil eller PC',
                'Nå over 45 000 aktive kjøpere øyeblikkelig',
                'Gratis å legge ut — betal kun ved salg',
              ].map((item) => (
                <li key={item} className="text-foreground flex items-start gap-3 text-sm">
                  <span className="bg-primary/10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                    <Check className="text-primary h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Listing card mockup */}
          <div className="lg:pl-8">
            <div className="border-border bg-card rounded-2xl border p-6 shadow-xl">
              <div className="mb-5 flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-muted-foreground text-xs font-medium">
                  Ny annonse publisert
                </span>
              </div>
              <div className="bg-muted mb-5 flex aspect-4/3 items-center justify-center rounded-xl">
                <Package className="text-muted-foreground/20 h-14 w-14" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-primary/10 text-primary mb-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium">
                    Som ny
                  </span>
                  <h4 className="text-foreground font-semibold">Titleist T100 Jernett 4–PW</h4>
                  <p className="text-muted-foreground mt-1 text-sm">Stiff flex · Originale greps</p>
                </div>
                <p className="text-primary ml-4 shrink-0 text-xl font-bold">4 500 kr</p>
              </div>
              <div className="border-border text-muted-foreground mt-5 flex items-center gap-1.5 border-t pt-4 text-xs">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>Oslo</span>
                <span className="text-border mx-1.5">·</span>
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>Lagt ut for 2 minutter siden</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2 — Trade with trust */}
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Trust card mockup */}
          <div className="order-2 lg:order-1 lg:pr-8">
            <div className="border-border bg-card rounded-2xl border p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-4">
                <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                  <Shield className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-foreground font-semibold">Kjøperbeskyttelse</h4>
                  <p className="text-muted-foreground text-sm">Aktiv på alle transaksjoner</p>
                </div>
              </div>
              <div className="divide-border divide-y">
                {[
                  'Verifiserte brukerprofiler',
                  'Sikker betaling via Vipps',
                  '14 dagers åpent kjøp',
                  'Kundeservice på norsk',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 py-3.5">
                    <span className="bg-primary/10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      <Check className="text-primary h-3.5 w-3.5" />
                    </span>
                    <span className="text-foreground text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="bg-primary/10 mb-6 flex h-12 w-12 items-center justify-center rounded-xl">
              <Shield className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-foreground mb-4 text-3xl font-bold tracking-tight">
              Handle med full tillit
            </h3>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
              Tryggheten din er vår prioritet. Vi har bygget et system med verifiserte brukere,
              sikre betalingsløsninger og kjøperbeskyttelse på alle transaksjoner.
            </p>
            <ul className="space-y-4">
              {[
                'Alle brukere er ID-verifisert ved registrering',
                'Betalingen holdes trygt til varen er mottatt',
                'Meld fra om problemer — vi hjelper deg alltid',
              ].map((item) => (
                <li key={item} className="text-foreground flex items-start gap-3 text-sm">
                  <span className="bg-primary/10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                    <Check className="text-primary h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  return (
    <section className="bg-primary py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 text-center lg:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="mb-2 text-4xl font-bold text-white lg:text-5xl">{value}</p>
              <p className="text-sm leading-snug text-white/70">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  return (
    <section className="bg-background py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="text-primary mb-3 text-xs font-semibold tracking-widest uppercase">
            Tilbakemeldinger
          </p>
          <h2 className="text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Elsket av golfere
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl text-lg">
            Over 45 000 golfere stoler på ClubSwap for kjøp og salg av utstyr.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, meta, initials }) => (
            <div key={name} className="border-border bg-card flex flex-col rounded-2xl border p-8">
              <div className="mb-5 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="fill-primary text-primary h-4 w-4" />
                ))}
              </div>
              <p className="text-foreground mb-6 flex-1 leading-relaxed">&ldquo;{quote}&rdquo;</p>
              <div className="border-border flex items-center gap-3 border-t pt-6">
                <div className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <span className="text-primary-foreground text-xs font-bold">{initials}</span>
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">{name}</p>
                  <p className="text-muted-foreground text-xs">{meta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Section ──────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="bg-foreground py-24">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Klar til å finne din neste favorittkølle?
        </h2>
        <p className="mb-10 text-lg leading-relaxed text-white/70">
          Bli med over 45 000 golfere som allerede bruker ClubSwap. Det er gratis å registrere seg.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button className="text-foreground h-12 gap-2 bg-white px-8 text-base hover:bg-white/90">
            Registrer deg gratis
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-12 px-8 text-base text-white hover:bg-white/10 hover:text-white"
          >
            Se alle annonser
          </Button>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const cols = {
    Markedsplass: ['Kjøp utstyr', 'Selg utstyr', 'Alle merker', 'Kategorier', 'Nye annonser'],
    Selskap: ['Om oss', 'Karriere', 'Presse', 'Blogg'],
    Support: ['Kontakt oss', 'Vanlige spørsmål', 'Vilkår', 'Personvern'],
  }

  return (
    <footer className="border-border bg-muted/30 border-t">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-16 grid grid-cols-2 gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Logo />
            <p className="text-muted-foreground mt-4 max-w-50 text-sm leading-relaxed">
              Norges ledende markedsplass for kjøp og salg av brukt golfutstyr.
            </p>
          </div>

          {Object.entries(cols).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-foreground mb-4 text-sm font-semibold">{title}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-border flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            © 2025 ClubSwap. Alle rettigheter forbeholdt.
          </p>
          <div className="flex gap-6">
            {['Vilkår', 'Personvern', 'Cookies'].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <LogoCloud />
        <Features />
        <Stats />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
