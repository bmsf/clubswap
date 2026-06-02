'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, LayoutGrid, Tag, Clock, ArrowRight, type LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  SEARCH_BRANDS,
  SEARCH_CATEGORIES,
  lesNyligeSok,
  leggTilNyligSok,
  tomNyligeSok,
} from '@/lib/search-index'

type Item = {
  key: string
  section?: string
  icon: LucideIcon
  primary: string
  secondary?: string
  onSelect: () => void
}

export function HeaderSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [browseTab, setBrowseTab] = useState<'kategorier' | 'merker'>('kategorier')
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(lesNyligeSok())
  }, [])

  // Speil aktivt søkeord (?sok) i input-feltet når man lander på resultatsiden.
  useEffect(() => {
    const sok = new URLSearchParams(window.location.search).get('sok') ?? ''
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(sok)
  }, [pathname])

  // Lukk på klikk utenfor.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const q = query.trim().toLowerCase()

  function close() {
    setOpen(false)
    setActiveIndex(-1)
  }
  function navigate(url: string, nyQuery: string) {
    close()
    setQuery(nyQuery)
    router.push(url)
  }
  function submitQuery(term: string) {
    const t = term.trim()
    if (!t) return
    setRecent(leggTilNyligSok(t))
    navigate(`/utforsk?sok=${encodeURIComponent(t)}`, t)
  }
  function clearRecent() {
    setRecent(tomNyligeSok())
  }

  // Bygg en flat liste i visningsrekkefølge — driver både rendering og piltaster.
  const items = useMemo<Item[]>(() => {
    const list: Item[] = []
    if (q) {
      list.push({
        key: 'query',
        icon: Search,
        primary: `Søk etter «${query.trim()}»`,
        secondary: 'Blant alle annonser',
        onSelect: () => submitQuery(query),
      })
      SEARCH_CATEGORIES.filter((c) => c.label.toLowerCase().includes(q))
        .slice(0, 5)
        .forEach((c) =>
          list.push({
            key: `kat-${c.kategori}`,
            section: 'Kategorier',
            icon: LayoutGrid,
            primary: c.label,
            secondary: c.parent,
            onSelect: () => navigate(`/utforsk?kategori=${c.kategori}`, ''),
          })
        )
      SEARCH_BRANDS.filter((b) => b.toLowerCase().includes(q))
        .slice(0, 5)
        .forEach((b) =>
          list.push({
            key: `merke-${b}`,
            section: 'Merker',
            icon: Tag,
            primary: b,
            secondary: 'Merkesøk',
            onSelect: () => submitQuery(b),
          })
        )
    } else {
      recent.forEach((r) =>
        list.push({
          key: `recent-${r}`,
          section: 'Nylig søkt',
          icon: Clock,
          primary: r,
          onSelect: () => submitQuery(r),
        })
      )
      if (browseTab === 'kategorier') {
        SEARCH_CATEGORIES.slice(0, 6).forEach((c) =>
          list.push({
            key: `pop-${c.kategori}`,
            section: 'browse',
            icon: LayoutGrid,
            primary: c.label,
            secondary: c.parent,
            onSelect: () => navigate(`/utforsk?kategori=${c.kategori}`, ''),
          })
        )
      } else {
        SEARCH_BRANDS.forEach((b) =>
          list.push({
            key: `pop-merke-${b}`,
            section: 'browse',
            icon: Tag,
            primary: b,
            secondary: 'Merkesøk',
            onSelect: () => submitQuery(b),
          })
        )
      }
      list.push({
        key: 'all',
        icon: ArrowRight,
        primary: 'Se alle annonser',
        onSelect: () => navigate('/utforsk', ''),
      })
    }
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, query, recent, browseTab])

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActiveIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && items[activeIndex]) {
        e.preventDefault()
        items[activeIndex].onSelect()
      }
      // ellers håndterer form-onSubmit råsøket
    } else if (e.key === 'Escape') {
      close()
    }
  }

  return (
    <div ref={wrapRef} className="relative flex-1">
      <div className="relative mx-auto w-full max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submitQuery(query)
          }}
        >
          <div className="flex w-full items-center gap-2 py-2.5">
            <Search className="text-muted-foreground size-3.5 shrink-0" />
            <Input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(-1)
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Hva ser du etter?"
              className="placeholder:text-muted-foreground h-auto w-auto flex-1 rounded-none border-0 bg-transparent p-0 shadow-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setActiveIndex(-1)
                }}
                className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                aria-label="Tøm søk"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </form>

        <AnimatePresence>
          {open && items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.14 }}
              className="border-border bg-card absolute top-full right-0 left-0 z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border py-2 shadow-xl"
            >
              {items.map((item, i) => {
                const Icon = item.icon
                const showHeader = item.section && item.section !== items[i - 1]?.section
                return (
                  <Fragment key={item.key}>
                    {showHeader &&
                      (item.section === 'browse' ? (
                        <div className="flex items-center gap-1 px-3 pt-2 pb-1.5">
                          {(['kategorier', 'merker'] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setBrowseTab(t)
                                setActiveIndex(-1)
                              }}
                              className={cn(
                                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                                browseTab === t
                                  ? 'bg-foreground text-background'
                                  : 'text-muted-foreground hover:bg-muted'
                              )}
                            >
                              {t === 'kategorier' ? 'Kategorier' : 'Merker'}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between px-4 pt-3 pb-1">
                          <span className="text-muted-foreground text-xs font-semibold">
                            {item.section}
                          </span>
                          {item.section === 'Nylig søkt' && (
                            <button
                              type="button"
                              onClick={clearRecent}
                              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                            >
                              Fjern alle
                            </button>
                          )}
                        </div>
                      ))}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={item.onSelect}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        i === activeIndex ? 'bg-muted' : 'hover:bg-muted'
                      )}
                    >
                      <Icon className="text-muted-foreground size-4 shrink-0" />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm">{item.primary}</span>
                        {item.secondary && (
                          <span className="text-muted-foreground truncate text-xs">
                            {item.secondary}
                          </span>
                        )}
                      </span>
                    </button>
                  </Fragment>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
