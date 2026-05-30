# ClubSwap — instruksjonsfil

## Prosjektbeskrivelse
- C2C-markedsplass for kjøp og salg av brukte golfkøller i Norge/Norden
- Målgruppe: norske golfspillere
- All brukervendt tekst på **norsk**

## Tech stack
- **Next.js 16** (App Router) — React 19
- **TypeScript 5** — strict mode
- **Tailwind CSS v4** — all styling, ingen inline styles
- **shadcn/ui** — komponentbibliotek (`@radix-ui/react-slot`, `class-variance-authority`)
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) — database, auth, storage
- **TanStack Query v5** — server state / data fetching
- **Zustand v5** — client state
- **React Hook Form + Zod v4** — skjemaer og validering
- **UploadThing** — bildeopplasting
- **Framer Motion** — animasjoner
- **Mona Sans** — sans-serif for all UI-tekst · **Geist Mono** — monospace for data (tidsstempler, stier, metrikkverdier, akse-labels)
- **Sonner** — toasts
- **next-themes** — dark mode

## Mappestruktur
```
src/
  app/          # Next.js App Router — ruter, layout, page.tsx
  components/   # Delte komponenter
    ui/         # shadcn-komponenter (button, osv.)
  hooks/        # Custom React hooks
  lib/          # Hjelpefunksjoner (utils.ts, osv.)
  store/        # Zustand stores
  supabase/     # Supabase-klient og hjelpere
  types/        # Delte TypeScript-typer
```

## Design-system
- **Fargepalett:** standard **shadcn neutral**, helt monokromt — hvit bakgrunn (`oklch(1 0 0)`), near-black tekst/primary, grå `muted`/`border`. Eneste aksentfarge er `destructive` (rød) for sletting. Ingen oransje/pergament/fargede badges (utgått fra gammelt design).
- **Farge-tokens:** definert som **oklch** CSS-variabler i `globals.css` (`:root` + `.dark`), mappet i `@theme inline` via `var(--x)` (ikke `hsl()`-wrappet).
- **Bruk semantiske tokens i komponenter** — `bg-card`, `text-foreground`, `border-border`, `bg-muted`, `bg-primary`/`text-primary-foreground`, `bg-destructive`. Ikke bruk rå palett-utilities (`neutral-*`, `bg-white`, `text-amber-*` osv.). Unntak: `bg-black/NN`-scrims over bilder.
- **Dark mode:** tokens finnes (`.dark`-blokk), men er **inaktiv** (ingen `next-themes`/provider).
- **Radius:** `--radius: 0.625rem` (skaler med sm/md/lg/xl/2xl/3xl/4xl)
- **Font:** Mona Sans (default sans, all UI-tekst) / Geist Mono for data-verdier — tidsstempler, endepunkt-stier, metrikkverdier, akse-labels, priser, tellere. Bruk `font-mono`, `tabular-nums` eller `.font-data`-klassen; `time`/`code`/`kbd`/`samp` får Geist Mono automatisk
- **Helpers:** `.surface` (kort med border+skygge), `.pill` (avrundet badge)
- **Kondisjonsbadges:** monokrome — alle nøytrale grå pills (`bg-muted text-muted-foreground`)

## Kommandoer
```bash
npm run dev        # Start dev-server
npm run build      # Produksjonsbygg
npm run start      # Start produksjonsserver
npm run lint       # ESLint
npm run format     # Prettier
npm run typecheck  # tsc --noEmit
```

## Konvensjoner og regler
- **TypeScript strict** — ingen `any`, eksplisitte typer
- **Tailwind for all styling** — ingen inline styles, ingen CSS-moduler
- **Norsk i all UI-tekst** — labels, feilmeldinger, plassholdere, navigasjon
- **Priser alltid i NOK** — format: `toLocaleString('nb-NO') + ' kr'`
- **Ikke endre autentiseringslogikk** uten eksplisitt instruksjon
- **shadcn for alle komponenter** — importer fra `@/components/ui/`, kjør `npx shadcn add <komponent>` ved behov
- **Server components som standard** — bruk `'use client'` kun når nødvendig (hooks, event handlers, browser-APIer)
- **Ikoner:** Lucide React (`lucide-react`) — ikke inline SVG-er i nye komponenter
- **Animasjoner:** Framer Motion for side-/element-transitions
- **Skjemaer:** React Hook Form + Zod — aldri ukontrollerte inputs
- **Data fetching:** TanStack Query for klient-side, `async` server components for server-side
- Pre-commit hooks via Husky + lint-staged (ESLint + Prettier kjøres automatisk)
