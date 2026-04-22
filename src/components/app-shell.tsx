'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/supabase/client'
import { loggUt } from '@/app/(auth)/actions'
import { AuthModal } from '@/components/auth-modal'
import { useAuthModal } from '@/store/auth-modal'
import { BekreftSlettModal } from '@/components/annonse-kort-handlinger'
import type { User } from '@supabase/supabase-js'
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  HomeIcon,
  TagIcon,
  PlusIcon,
  UserIcon,
  EnvelopeIcon,
  HeartIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/16/solid'

const PROTECTED_ROUTES = ['/selg', '/annonser', '/lagrede', '/meldinger', '/profil']

// ── Data ──────────────────────────────────────────────────────────────────────

const ROUTE_LABEL: Record<string, string> = {
  '/': 'Utforsk',
  '/annonser': 'Mine annonser',
  '/selg': 'Ny annonse',
  '/lagrede': 'Lagrede',
  '/meldinger': 'Meldinger',
  '/profil': 'Profil',
}

type Breadcrumb = { label: string; href?: string }

function getBreadcrumbs(pathname: string): Breadcrumb[] {
  if (/^\/annonser\/[^/]+\/rediger$/.test(pathname)) {
    return [{ label: 'Mine annonser', href: '/annonser' }, { label: 'Rediger annonse' }]
  }
  const label = ROUTE_LABEL[pathname]
  return label ? [{ label }] : [{ label: 'ClubSwap' }]
}

const navItems = [
  { icon: <HomeIcon className="h-4 w-4" />, label: 'Utforsk', href: '/' },
  { icon: <TagIcon className="h-4 w-4" />, label: 'Mine annonser', href: '/annonser' },
  { icon: <PlusIcon className="h-4 w-4" />, label: 'Ny annonse', href: '/selg' },
  { icon: <HeartIcon className="h-4 w-4" />, label: 'Lagrede', href: '/lagrede' },
  { icon: <EnvelopeIcon className="h-4 w-4" />, label: 'Meldinger', href: '/meldinger' },
  { icon: <UserIcon className="h-4 w-4" />, label: 'Profil', href: '/profil' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dark, setDark] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)
  const [unreadMessages] = useState<number>(0)
  const [profilMeny, setProfilMeny] = useState(false)

  const { openModal } = useAuthModal()

  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [dark])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setAuthLoaded(true)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Open auth modal when middleware redirects here with ?fra=
  useEffect(() => {
    if (!authLoaded) return
    const fra = searchParams.get('fra')
    if (fra && !user) {
      openModal('logg-inn', fra)
      router.replace('/')
    }
  }, [authLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close profile menu on navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfilMeny(false)
  }, [pathname])

  const W = sidebarOpen ? 240 : 60
  const breadcrumbs = getBreadcrumbs(pathname)

  function handleNavClick(href: string) {
    if (PROTECTED_ROUTES.includes(href) && !user) {
      openModal('logg-inn', href)
    } else {
      router.push(href)
    }
  }

  return (
    <div className="bg-background text-foreground flex h-screen overflow-hidden">
      {/* ── Left Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className="bg-background text-foreground flex shrink-0 flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: W }}
      >
        {/* Logo + toggle */}
        <div className="flex h-16 shrink-0 items-center justify-between px-3">
          <div className="flex min-w-0 items-center overflow-hidden">
            {sidebarOpen && (
              <span className="text-foreground text-sm font-semibold whitespace-nowrap">
                ClubSwap
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors"
            aria-label="Åpne/lukk meny"
          >
            <Bars3Icon className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        {sidebarOpen && (
          <div className="mb-4 shrink-0 px-3">
            <div className="bg-muted border-border text-muted-foreground flex h-9 items-center gap-2 rounded-lg border px-3 text-sm">
              <MagnifyingGlassIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">Søk</span>
              <span className="bg-background border-border rounded border px-1.5 py-0.5 font-mono text-xs">
                ⌘K
              </span>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2">
          {sidebarOpen && (
            <p className="text-muted-foreground mb-1 px-2 text-[11px] font-medium tracking-widest uppercase">
              Navigasjon
            </p>
          )}

          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={[
                  'flex h-9 w-full shrink-0 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors',
                  sidebarOpen ? '' : 'justify-center',
                  active ? 'bg-muted text-highlight font-medium' : 'text-highlight hover:bg-muted',
                ].join(' ')}
              >
                <span className="shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.label === 'Meldinger' && user && unreadMessages > 0 && (
                      <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                        {unreadMessages}
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>

        {/* Bottom: theme + settings + user */}
        <div className="border-border flex shrink-0 flex-col gap-0.5 border-t px-2 pt-3 pb-4">
          <button
            onClick={() => setDark(!dark)}
            className={[
              'text-highlight hover:bg-muted flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors',
              sidebarOpen ? '' : 'justify-center',
            ].join(' ')}
            aria-label="Bytt fargetema"
          >
            {dark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            {sidebarOpen && <span>{dark ? 'Lyst tema' : 'Mørkt tema'}</span>}
          </button>

          <button
            className={[
              'text-highlight hover:bg-muted flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors',
              sidebarOpen ? '' : 'justify-center',
            ].join(' ')}
          >
            <Cog6ToothIcon className="h-4 w-4" />
            {sidebarOpen && <span>Innstillinger</span>}
          </button>

          {user ? (
            <div className="relative mt-1">
              {profilMeny && (
                <div className="bg-background border-border absolute right-0 bottom-full left-0 mb-1 rounded-lg border p-1 shadow-lg">
                  <form action={loggUt}>
                    <button
                      type="submit"
                      className="text-highlight hover:bg-muted flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors"
                    >
                      <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                      {sidebarOpen && <span>Logg ut</span>}
                    </button>
                  </form>
                </div>
              )}
              <button
                onClick={() => setProfilMeny(!profilMeny)}
                className={[
                  'hover:bg-muted flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 transition-colors',
                  sidebarOpen ? '' : 'justify-center',
                ].join(' ')}
              >
                <div className="bg-muted text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                  {(user.user_metadata?.full_name as string | undefined)
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() ??
                    user.email?.[0]?.toUpperCase() ??
                    '?'}
                </div>
                {sidebarOpen && (
                  <div className="flex min-w-0 flex-col text-left">
                    <span className="text-highlight truncate text-sm leading-tight font-medium">
                      {(user.user_metadata?.full_name as string | undefined) ?? user.email}
                    </span>
                    <span className="text-highlight/50 text-xs leading-tight">Golfspiller</span>
                  </div>
                )}
              </button>
            </div>
          ) : (
            <div
              className={[
                'mt-1 flex flex-col gap-1.5 px-1',
                sidebarOpen ? '' : 'items-center',
              ].join(' ')}
            >
              {sidebarOpen ? (
                <>
                  <button
                    onClick={() => openModal('logg-inn')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-8 w-full cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition-colors"
                  >
                    Logg inn
                  </button>
                  <button
                    onClick={() => openModal('registrer')}
                    className="text-highlight hover:bg-muted flex h-8 w-full cursor-pointer items-center justify-center rounded-lg border text-sm transition-colors"
                  >
                    Registrer deg
                  </button>
                </>
              ) : (
                <button
                  onClick={() => openModal('logg-inn')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
                  aria-label="Logg inn"
                >
                  <UserIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden p-3">
        <main className="bg-card border-border flex flex-1 flex-col overflow-hidden rounded-2xl border">
          <header className="border-border flex h-16 shrink-0 items-center border-b px-20">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>ClubSwap</span>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="text-border">›</span>
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-foreground transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          </header>

          <motion.div
            key={pathname}
            className="flex-1 overflow-y-auto"
            style={{ scrollbarWidth: 'none' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      <AuthModal />
      <BekreftSlettModal />
    </div>
  )
}
