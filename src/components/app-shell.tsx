'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/supabase/client'
import { loggUt } from '@/app/(auth)/actions'
import { AuthModal } from '@/components/auth-modal'
import { useAuthModal } from '@/store/auth-modal'
import type { User } from '@supabase/supabase-js'

const PROTECTED_ROUTES = ['/selg', '/annonser', '/lagrede', '/meldinger', '/profil']

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconSidebarToggle() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconHome() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconTag() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function IconHeart() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconSun() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const ROUTE_LABEL: Record<string, string> = {
  '/': 'Utforsk',
  '/annonser': 'Mine annonser',
  '/selg': 'Selg en kølle',
  '/lagrede': 'Lagrede',
  '/meldinger': 'Meldinger',
  '/profil': 'Profil',
}

const navItems = [
  { icon: <IconHome />, label: 'Utforsk', href: '/' },
  { icon: <IconTag />, label: 'Mine annonser', href: '/annonser' },
  { icon: <IconPlus />, label: 'Selg en kølle', href: '/selg' },
  { icon: <IconHeart />, label: 'Lagrede', href: '/lagrede' },
  { icon: <IconMail />, label: 'Meldinger', href: '/meldinger' },
  { icon: <IconUser />, label: 'Profil', href: '/profil' },
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
  const breadcrumb = ROUTE_LABEL[pathname] ?? 'ClubSwap'

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
            <IconSidebarToggle />
          </button>
        </div>

        {/* Search */}
        {sidebarOpen && (
          <div className="mb-4 shrink-0 px-3">
            <div className="bg-muted border-border text-muted-foreground flex h-9 items-center gap-2 rounded-lg border px-3 text-sm">
              <IconSearch />
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
            {dark ? <IconSun /> : <IconMoon />}
            {sidebarOpen && <span>{dark ? 'Lyst tema' : 'Mørkt tema'}</span>}
          </button>

          <button
            className={[
              'text-highlight hover:bg-muted flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors',
              sidebarOpen ? '' : 'justify-center',
            ].join(' ')}
          >
            <IconSettings />
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
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
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
                  <IconUser />
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
              <span className="text-border">›</span>
              <span className="text-foreground font-medium">{breadcrumb}</span>
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
    </div>
  )
}
