'use client'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'

export function WalletMultiButton() {
  const { address, isConnected, connect, disconnect, loading } = useWallet()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-accent">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={connect}
      disabled={loading}
      className="bg-accent hover:bg-accent/90"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Connecting...
        </>
      ) : (
        'Connect Wallet'
      )}
    </Button>
  )
}
