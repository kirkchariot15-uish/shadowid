'use client'
import { WalletMultiButton as OfficialWalletMultiButton } from '@provablehq/aleo-wallet-adaptor-react-ui'
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'

export function WalletMultiButton() {
  const walletState = useWallet()
  
  console.log('[v0] WalletButton - publicKey:', walletState.publicKey, 'connected:', walletState.connected)

  return (
    <div className="[&>button]:bg-accent [&>button]:hover:bg-accent/90 [&>button]:text-accent-foreground">
      <OfficialWalletMultiButton />
    </div>
  )
}
