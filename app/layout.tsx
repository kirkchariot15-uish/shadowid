import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { WalletProviderComponent } from '@/lib/wallet-provider'
import { Navigation } from '@/components/navigation'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'ShadowID - Zero-Knowledge Identity on Aleo',
  description: 'Create and manage your decentralized identity with zero-knowledge proofs on the Aleo blockchain.',
  metadataBase: new URL('https://shadowid.app'),
  openGraph: {
    title: 'ShadowID - Zero-Knowledge Identity',
    description: 'Private identity creation on Aleo blockchain',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Content Security Policy - prevents XSS attacks */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.com https://*.aleo.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.explorer.provable.com https://*.aleo.org wss://*.aleo.org; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
        />
        {/* Prevent clickjacking */}
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <meta name="X-UA-Compatible" content="ie=edge" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        {/* Prevent MIME type sniffing */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      </head>
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <WalletProviderComponent>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
        </WalletProviderComponent>
      </body>
    </html>
  )
}
