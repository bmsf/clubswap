import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/shared/theme-provider'
import { QueryProvider } from '@/components/shared/query-provider'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'ClubSwap',
  description: '',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <QueryProvider>{children}</QueryProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
