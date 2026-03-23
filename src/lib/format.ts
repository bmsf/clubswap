import type { CurrencyCode } from '@/types'

export function formatPrice(price: number, currency: CurrencyCode): string {
  const symbol = currency === 'EUR' ? '€' : 'kr'

  if (currency === 'EUR') {
    return `${symbol}${price.toLocaleString('nb-NO')}`
  }

  return `${price.toLocaleString('nb-NO')} ${symbol}`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'I dag'
  if (diffDays === 1) return 'I går'
  if (diffDays < 7) return `${diffDays} dager siden`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} uker siden`
  return formatDate(dateString)
}
