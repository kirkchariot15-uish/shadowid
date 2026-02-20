'use client'
import { WalletMultiButton as OfficialWalletMultiButton } from '@provablehq/aleo-wallet-adaptor-react-ui'

export function WalletMultiButton() {
  return (
    <div className="[&>button]:bg-accent [&>button]:hover:bg-accent/90 [&>button]:text-accent-foreground">
      <OfficialWalletMultiButton />
    </div>
  )
}
