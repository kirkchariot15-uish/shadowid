'use client'

import { ReactNode } from 'react'
import { AleoWalletProvider } from '@provablehq/aleo-wallet-adaptor-react'
import { WalletModalProvider } from '@provablehq/aleo-wallet-adaptor-react-ui'
import { ShieldWalletAdapter } from '@provablehq/aleo-wallet-adaptor-shield'
import { LeoWalletAdapter } from '@provablehq/aleo-wallet-adaptor-leo'
import { FoxWalletAdapter } from '@provablehq/aleo-wallet-adaptor-fox'
import { PuzzleWalletAdapter } from '@provablehq/aleo-wallet-adaptor-puzzle'
import { SoterWalletAdapter } from '@provablehq/aleo-wallet-adaptor-soter'
import { DecryptPermission } from '@provablehq/aleo-wallet-adaptor-core'
import { Network } from '@provablehq/aleo-types'
import '@provablehq/aleo-wallet-adaptor-react-ui/dist/styles.css'

const wallets = [
  new ShieldWalletAdapter(),
  new LeoWalletAdapter(),
  new FoxWalletAdapter(),
  new PuzzleWalletAdapter(),
  new SoterWalletAdapter(),
]

export function WalletProviderComponent({ children }: { children: ReactNode }) {
  return (
    <AleoWalletProvider
      wallets={wallets}
      network={Network.TESTNET}
      decryptPermission={DecryptPermission.UponRequest}
      autoConnect={false}
    >
      <WalletModalProvider>{children}</WalletModalProvider>
    </AleoWalletProvider>
  )
}

