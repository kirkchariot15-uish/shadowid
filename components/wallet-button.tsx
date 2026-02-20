'use client'
import { WalletMultiButton as OfficialWalletMultiButton } from '@provablehq/aleo-wallet-adaptor-react-ui'
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'
import { useEffect, useState } from 'react'

export function WalletMultiButton() {
  const walletState = useWallet()
  const [walletsAvailable, setWalletsAvailable] = useState<string[]>([])

  useEffect(() => {
    // Check which wallets are available in the browser
    const available = []
    if ((window as any).aleo) available.push('Leo')
    if ((window as any).__PUZZLE__) available.push('Puzzle')
    if ((window as any).foxwallet) available.push('Fox')
    if ((window as any).shield) available.push('Shield')
    if ((window as any).soter) available.push('Soter')
    
    setWalletsAvailable(available)
    console.log('[v0] Available wallets in browser:', available.length ? available : 'NONE - Install an Aleo wallet extension')
  }, [])

  console.log('[v0] WalletButton - publicKey:', walletState.publicKey, 'connected:', walletState.connected)

  if (walletsAvailable.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">No wallet found -</span>
        <a 
          href="https://www.leo.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-accent hover:underline font-medium"
        >
          Install Leo Wallet
        </a>
      </div>
    )
  }

  return (
    <div className="[&>button]:bg-accent [&>button]:hover:bg-accent/90 [&>button]:text-accent-foreground">
      <OfficialWalletMultiButton />
    </div>
  )
}
