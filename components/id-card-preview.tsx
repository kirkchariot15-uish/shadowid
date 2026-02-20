'use client'

import { useAleoWallet } from '@/hooks/use-aleo-wallet'

export function IDCardPreview() {
  const { address } = useAleoWallet()
  const isConnected = !!address

  return (
    <div className="my-12 w-full max-w-md">
      <div className={`relative rounded-2xl transition-all duration-300 ${
        isConnected
          ? 'bg-gradient-to-br from-card via-muted to-background border-2 border-accent/30 shadow-2xl'
          : 'bg-gradient-to-br from-card to-muted border border-border shadow-lg'
      }`}>
        {/* Glowing accent effect when connected */}
        {isConnected && (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/40 rounded-full blur-3xl" />
          </div>
        )}

        {/* Card Content */}
        <div className="relative p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-xs uppercase tracking-widest font-semibold mb-1 transition-colors ${
                isConnected ? 'text-accent/70' : 'text-muted-foreground/50'
              }`}>
                Private Identity Credential
              </p>
              <h3 className={`text-2xl font-black transition-colors ${
                isConnected ? 'text-foreground' : 'text-muted-foreground/60'
              }`}>
                ShadowID
              </h3>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
              isConnected 
                ? 'bg-accent/20 border border-accent/40' 
                : 'bg-muted/20 border border-border/40'
            }`}>
              <span className={`text-lg font-bold ${
                isConnected ? 'text-accent' : 'text-muted-foreground/40'
              }`}>
                σ
              </span>
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Identity Info */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground/60">
              {isConnected ? 'Connected Wallet' : 'Connect Your Wallet'}
            </p>
            <p className={`font-mono text-sm font-semibold break-all ${
              isConnected 
                ? 'text-accent' 
                : 'text-muted-foreground/40'
            }`}>
              {isConnected ? address?.substring(0, 12) + '...' : '••••••••••••••'}
            </p>
          </div>

          <div className="h-px bg-border/50" />

          {/* Status */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-widest font-semibold">Status</span>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full transition-colors ${
                isConnected ? 'bg-accent' : 'bg-muted-foreground/30'
              }`} />
              <span className={isConnected ? 'text-accent' : 'text-muted-foreground/50'}>
                {isConnected ? 'Ready' : 'Waiting'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
