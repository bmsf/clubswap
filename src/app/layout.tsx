import type { Metadata } from 'next'
import { Geist_Mono, Mona_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { cn } from '@/lib/utils'
import { Providers } from './providers'

const monaSans = Mona_Sans({ subsets: ['latin'], variable: '--font-mona-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Golftorget',
  description: '',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="nb"
      suppressHydrationWarning
      className={cn(monaSans.variable, geistMono.variable, 'font-sans')}
    >
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
