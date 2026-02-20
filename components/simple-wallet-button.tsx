'use client';
import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/wallet-context';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, AlertCircle } from 'lucide-react';

export function SimpleWalletButton() {
  const { address, isConnected, connect, disconnect, loading, error } = useWallet();
  const [walletNotFound, setWalletNotFound] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if Aleo wallet is installed
    const timer = setTimeout(() => {
      if (!(window as any).aleo) {
        setWalletNotFound(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-accent">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            disconnect();
          }}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  if (walletNotFound) {
    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <Button
          variant="outline"
          size="sm"
          disabled
          title="Install an Aleo wallet to connect"
          className="text-xs"
        >
          Wallet Not Found
        </Button>
      </div>
    );
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
  );
}
