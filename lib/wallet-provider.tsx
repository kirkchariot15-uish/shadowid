'use client';
import { ReactNode, useState } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

function WalletErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Wallet Connection Issue</h2>
          <p className="text-muted-foreground mb-4">Please try refreshing the page or using a different wallet.</p>
          <button
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  try {
    const AleoWalletProvider = require('@provablehq/aleo-wallet-adaptor-react').AleoWalletProvider;
    const WalletModalProvider = require('@provablehq/aleo-wallet-adaptor-react-ui').WalletModalProvider;
    const ShieldWalletAdapter = require('@provablehq/aleo-wallet-adaptor-shield').ShieldWalletAdapter;
    const LeoWalletAdapter = require('@provablehq/aleo-wallet-adaptor-leo').LeoWalletAdapter;
    const FoxWalletAdapter = require('@provablehq/aleo-wallet-adaptor-fox').FoxWalletAdapter;
    const PuzzleWalletAdapter = require('@provablehq/aleo-wallet-adaptor-puzzle').PuzzleWalletAdapter;
    const SoterWalletAdapter = require('@provablehq/aleo-wallet-adaptor-soter').SoterWalletAdapter;
    const { DecryptPermission } = require('@provablehq/aleo-wallet-adaptor-core');
    const { Network } = require('@provablehq/aleo-types');
    require('@provablehq/aleo-wallet-adaptor-react-ui/dist/styles.css');

    const wallets = [
      new ShieldWalletAdapter(),
      new LeoWalletAdapter(),
      new FoxWalletAdapter(),
      new PuzzleWalletAdapter(),
      new SoterWalletAdapter(),
    ];

    return (
      <AleoWalletProvider
        wallets={wallets}
        network={Network.TESTNET}
        decryptPermission={DecryptPermission.UponRequest}
        autoConnect={true}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </AleoWalletProvider>
    );
  } catch (error) {
    console.error('[v0] Wallet provider initialization failed:', error);
    setHasError(true);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Wallet Initialization Error</h2>
          <p className="text-muted-foreground mb-4">The wallet adapter failed to load. Please try again later.</p>
        </div>
      </div>
    );
  }
}

export function WalletProviderComponent({ children }: { children: ReactNode }) {
  return <WalletErrorBoundary>{children}</WalletErrorBoundary>;
}
