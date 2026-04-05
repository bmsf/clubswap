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
- **Geist** — typografi (sans + mono)
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
- **Fargepalett:** varm pergament/krem bakgrunn (`#f0eadb`), mørk tekst (`#1d1d1d`), oransje primary (`rgb(255,112,56)`)
- **Dark mode:** mørk bakgrunn (`#1c1c1c`), varm tan tekst (`#d1c2a5`)
- **Radius:** `--radius: 0.625rem` (skaler med sm/md/lg/xl/2xl/3xl/4xl)
- **Font:** Geist Sans / Geist Mono
- **CSS-variabler:** alle farger via HSL CSS-variabler i `globals.css`
- **Helpers:** `.surface` (hvitt kort med border+skygge), `.pill` (avrundet badge)
- **Kondisjonsbadges:** Ny (grønn), Meget god (blå), God (primary/oransje), Akseptabel (gul)
- Bakgrunn: radial gradient fra `--bg-gradient-center` til `--bg-gradient-edge`

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
