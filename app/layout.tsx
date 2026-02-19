import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { WalletProviderComponent } from '@/lib/wallet-provider'
import { Navigation } from '@/components/navigation'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'ShadowID - Zero-Knowledge Identity on Aleo',
  description: 'Create and manage your decentralized identity with zero-knowledge proofs on the Aleo blockchain.',
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
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <WalletProviderComponent>
          <Navigation />
          {children}
        </WalletProviderComponent>
      </body>
    </html>
  )
}
