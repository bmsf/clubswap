// Norske, korte tidsformat for meldinger/lister.

export function relativTid(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'Nå'
  if (min < 60) return `${min} min`
  const t = Math.floor(min / 60)
  if (t < 24) return `${t} t`
  const d = Math.floor(t / 24)
  if (d < 7) return `${d} d`
  return new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })
}

export function klokkeslett(iso: string): string {
  return new Date(iso).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })
}
