'use client'

import '@/bones/registry'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/supabase/client'
import { loggUt } from '@/app/(auth)/actions'
import { AuthModal } from '@/components/auth-modal'
import { useAuthModal } from '@/store/auth-modal'
import { BekreftSlettModal } from '@/components/annonse-kort-handlinger'
import { Button } from '@/components/ui/button'
import { Search, Heart, MessageSquare, Plus, User, Home, LogOut } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'

// ── Constants ─────────────────────────────────────────────────────────────────

const PROTECTED_ROUTES = ['/selg', '/annonser', '/lagrede', '/meldinger', '/profil']

const BOTTOM_NAV_ITEMS = [
  { icon: Home, label: 'Utforsk', href: '/' },
  { icon: Heart, label: 'Lagrede', href: '/lagrede' },
  { icon: Plus, label: 'Selg', href: '/selg', center: true },
  { icon: MessageSquare, label: 'Meldinger', href: '/meldinger' },
  { icon: User, label: 'Profil', href: '/profil' },
] as const

// ── Component ─────────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)
  const [profilMeny, setProfilMeny] = useState(false)
  const [headerSearch, setHeaderSearch] = useState('')
  const profilRef = useRef<HTMLDivElement>(null)

  const { openModal } = useAuthModal()

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

  // Open auth modal when middleware redirects with ?fra=
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

  // Close profile menu on outside click
  useEffect(() => {
    if (!profilMeny) return
    const handle = (e: MouseEvent) => {
      if (profilRef.current && !profilRef.current.contains(e.target as Node)) {
        setProfilMeny(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [profilMeny])

  function handleHeaderSearch(e: React.SyntheticEvent) {
    e.preventDefault()
    const q = headerSearch.trim()
    if (!q) return
    router.push(`/search/${encodeURIComponent(q)}`)
    setHeaderSearch('')
  }

  function handleNavClick(href: string) {
    if (PROTECTED_ROUTES.includes(href) && !user) {
      openModal('logg-inn', href)
    } else {
      router.push(href)
    }
  }

  const initials =
    (user?.user_metadata?.full_name as string | undefined)
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    '?'

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-950 antialiased">
      {/* ── Top navbar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-16 border-b border-neutral-950/10 bg-white text-neutral-950">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center gap-3 px-4 md:gap-4 md:px-6">
          {/* Brand */}
          <Link href="/" className="text-foreground shrink-0 text-sm font-semibold tracking-tight">
            Golftorget
          </Link>

          {/* Search */}
          <form onSubmit={handleHeaderSearch} className="flex-1">
            <div className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5">
              <Search className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Hva ser du etter?"
                className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </form>

          {/* Right: desktop only */}
          <div className="hidden shrink-0 items-center gap-1 md:flex">
            <button
              onClick={() => handleNavClick('/lagrede')}
              className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              aria-label="Lagrede"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleNavClick('/meldinger')}
              className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              aria-label="Meldinger"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
            <Button
              variant="primary"
              size="default"
              onClick={() => handleNavClick('/selg')}
              className="ml-1"
            >
              Ny annonse
            </Button>

            {user ? (
              <div className="relative ml-1" ref={profilRef}>
                <button
                  onClick={() => setProfilMeny(!profilMeny)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-950 transition-colors hover:bg-neutral-200"
                  aria-label="Profilmeny"
                >
                  {initials}
                </button>
                <AnimatePresence>
                  {profilMeny && (
                    <motion.div
                      className="absolute top-full right-0 mt-1.5 min-w-37 rounded-xl border border-neutral-950/10 bg-white p-1 shadow-lg"
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                    >
                      <button
                        onClick={() => handleNavClick('/profil')}
                        className="text-foreground hover:bg-muted flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-sm transition-colors"
                      >
                        <User className="h-4 w-4 shrink-0" />
                        Profil
                      </button>
                      <form action={loggUt}>
                        <button
                          type="submit"
                          className="text-foreground hover:bg-muted flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-sm transition-colors"
                        >
                          <LogOut className="h-4 w-4 shrink-0" />
                          Logg ut
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                variant="outline"
                size="default"
                onClick={() => openModal('logg-inn')}
                className="ml-1"
              >
                Logg inn
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <main className="flex-1 pb-16 md:pb-0">
        <div className="mx-auto min-h-screen max-w-7xl border-x border-neutral-950/10">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* ── Bottom nav (mobile only) ────────────────────────────────────────── */}
      <nav className="fixed right-0 bottom-0 left-0 z-40 flex bg-white text-neutral-950 md:hidden">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          const isCenter = 'center' in item && item.center

          return (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="flex flex-1 flex-col items-center justify-center py-2 transition-colors"
            >
              {isCenter ? (
                <div className="bg-primary-btn flex h-11 w-11 items-center justify-center rounded-full">
                  <Icon className="text-primary-btn-fg h-5 w-5" />
                </div>
              ) : (
                <>
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      active ? 'dark:text-foreground text-[#1A1A18]' : 'text-[#C0BDB6]'
                    )}
                  />
                  <span
                    className={cn(
                      'mt-0.5 text-[10px] font-medium',
                      active ? 'dark:text-foreground text-[#1A1A18]' : 'text-[#C0BDB6]'
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </nav>

      <AuthModal />
      <BekreftSlettModal />
    </div>
  )
}
