'use client';

import { ReactNode, useEffect, useState } from 'react';

export function WalletProviderComponent({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [walletProvider, setWalletProvider] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      // Only load wallet adapters on client side
      const { AleoWalletProvider } = await import(
        '@provablehq/aleo-wallet-adaptor-react'
      );
      const { WalletModalProvider } = await import(
        '@provablehq/aleo-wallet-adaptor-react-ui'
      );
      const { ShieldWalletAdapter } = await import(
        '@provablehq/aleo-wallet-adaptor-shield'
      );
      const { LeoWalletAdapter } = await import(
        '@provablehq/aleo-wallet-adaptor-leo'
      );
      const { FoxWalletAdapter } = await import(
        '@provablehq/aleo-wallet-adaptor-fox'
      );
      const { PuzzleWalletAdapter } = await import(
        '@provablehq/aleo-wallet-adaptor-puzzle'
      );
      const { SoterWalletAdapter } = await import(
        '@provablehq/aleo-wallet-adaptor-soter'
      );
      const { DecryptPermission } = await import(
        '@provablehq/aleo-wallet-adaptor-core'
      );
      const { Network } = await import('@provablehq/aleo-types');

      // Import CSS after modules load
      await import('@provablehq/aleo-wallet-adaptor-react-ui/dist/styles.css');

      const wallets = [
        new ShieldWalletAdapter(),
        new LeoWalletAdapter(),
        new FoxWalletAdapter(),
        new PuzzleWalletAdapter(),
        new SoterWalletAdapter(),
      ];

      setWalletProvider({
        AleoWalletProvider,
        WalletModalProvider,
        wallets,
        network: Network.TESTNET,
        decryptPermission: DecryptPermission.UponRequest,
      });
    } catch (err) {
      console.error('[v0] Wallet initialization error:', err);
      setError(
        'Wallet adapters failed to load. Some features may be unavailable.'
      );
    }
  };

  // During hydration, render children without wallet provider to avoid mismatch
  if (!isClient || !walletProvider) {
    return <>{children}</>;
  }

  const {
    AleoWalletProvider,
    WalletModalProvider,
    wallets,
    network,
    decryptPermission,
  } = walletProvider;

  return (
    <AleoWalletProvider
      wallets={wallets}
      network={network}
      decryptPermission={decryptPermission}
      autoConnect={true}
    >
      <WalletModalProvider>{children}</WalletModalProvider>
    </AleoWalletProvider>
  );
}
