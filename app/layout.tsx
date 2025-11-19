import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'RedeTour - Plataforma de Turismo',
  description: 'Plataforma de turismo com sistema de afiliados',
  keywords: 'turismo, viagens, afiliados, hoteis, passeios',
  authors: [{ name: 'RedeTour Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'RedeTour - Plataforma de Turismo',
    description: 'Plataforma de turismo com sistema de afiliados',
    url: 'https://redetour.com.br',
    siteName: 'RedeTour',
    images: [
      {
        url: 'https://redetour.com.br/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RedeTour',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RedeTour - Plataforma de Turismo',
    description: 'Plataforma de turismo com sistema de afiliados',
    images: ['https://redetour.com.br/twitter-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  )
}