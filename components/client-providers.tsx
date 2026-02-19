'use client';

import { ReactNode, useEffect, useState } from 'react';
import { WalletProviderComponent } from '@/lib/wallet-provider';
import { Navigation } from '@/components/navigation';

export function ClientProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // During SSR and initial hydration, render children without wallet provider
    // This prevents useWallet() from being called outside AleoWalletProvider
    return <>{children}</>;
  }

  return (
    <WalletProviderComponent>
      <Navigation />
      {children}
    </WalletProviderComponent>
  );
}
