import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import { LangProvider } from '@/context/LangContext'
import WhatsAppButton from '@/components/ui/WhatsAppButton'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Altona North — Shabla, Bulgaria',
  description:
    'A quiet retreat on the Black Sea coast. Fully renovated holiday home in Shabla, Bulgaria.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
        <LangProvider>
          {children}
          <WhatsAppButton />
        </LangProvider>
      </body>
    </html>
  )
}
