'use client'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { WalletMultiButton as OfficialWalletMultiButton } from '@provablehq/aleo-wallet-adaptor-react-ui'
import { Shield, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export function WalletMultiButton() {
  const { isConnected, address, isShieldWalletAvailable, error } = useAleoWallet()
  const [showInstallGuide, setShowInstallGuide] = useState(false)

  useEffect(() => {
    if (error?.includes('Shield Wallet not installed') || 
        (error?.includes('Could not establish connection') && !isConnected)) {
      setShowInstallGuide(true)
    }
  }, [error, isConnected])

  return (
    <div className="flex flex-col gap-2">
      {!isConnected && (
        <p className="text-xs text-muted-foreground text-center px-2">
          <Shield className="h-3 w-3 inline mr-1" />
          Shield Wallet Recommended
        </p>
      )}
      
      {showInstallGuide && !isConnected && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 text-xs text-yellow-700 dark:text-yellow-400">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Shield Wallet not found</p>
              <p className="mb-2">Install from Chrome Web Store: shield.xyz</p>
              <button 
                onClick={() => window.open('https://chrome.google.com/webstore/detail/shield-wallet', '_blank')}
                className="underline hover:no-underline text-xs font-medium"
              >
                Open Chrome Web Store
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="[&>button]:bg-accent [&>button]:hover:bg-accent/90 [&>button]:text-accent-foreground">
        <OfficialWalletMultiButton />
      </div>
    </div>
  )
}
