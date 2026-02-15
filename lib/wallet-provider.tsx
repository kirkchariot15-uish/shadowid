'use client';

import { ReactNode, useMemo, useState, useEffect } from 'react';

function WalletProviderInner({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const wallets = useMemo(() => {
    if (typeof window === 'undefined') return [];
    // Lazy-import wallet adapters only on client
    try {
      const { ShieldWalletAdapter } = require('@provablehq/aleo-wallet-adaptor-shield');
      const { LeoWalletAdapter } = require('@provablehq/aleo-wallet-adaptor-leo');
      const { FoxWalletAdapter } = require('@provablehq/aleo-wallet-adaptor-fox');
      const { PuzzleWalletAdapter } = require('@provablehq/aleo-wallet-adaptor-puzzle');
      const { SoterWalletAdapter } = require('@provablehq/aleo-wallet-adaptor-soter');
      return [
        new ShieldWalletAdapter(),
        new LeoWalletAdapter(),
        new FoxWalletAdapter(),
        new PuzzleWalletAdapter(),
        new SoterWalletAdapter(),
      ];
    } catch {
      return [];
    }
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  // Dynamic imports for Aleo wallet provider components
  const { AleoWalletProvider } = require('@provablehq/aleo-wallet-adaptor-react');
  const { WalletModalProvider } = require('@provablehq/aleo-wallet-adaptor-react-ui');
  const { DecryptPermission } = require('@provablehq/aleo-wallet-adaptor-core');
  const { Network } = require('@provablehq/aleo-types');

  return (
    <AleoWalletProvider
      wallets={wallets}
      network={Network.TESTNET}
      decryptPermission={DecryptPermission.UponRequest}
      autoConnect={false}
    >
      <WalletModalProvider>{children}</WalletModalProvider>
    </AleoWalletProvider>
  );
}

export function WalletProviderComponent({ children }: { children: ReactNode }) {
  return <WalletProviderInner>{children}</WalletProviderInner>;
}
