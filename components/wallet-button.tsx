'use client'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { WalletMultiButton as OfficialWalletMultiButton } from '@provablehq/aleo-wallet-adaptor-react-ui'

export function WalletMultiButton() {
  const { isConnected, address } = useAleoWallet()

  return (
    <div className="[&>button]:bg-accent [&>button]:hover:bg-accent/90 [&>button]:text-accent-foreground">
      <OfficialWalletMultiButton />
    </div>
  )
}
