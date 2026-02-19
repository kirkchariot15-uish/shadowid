'use client';
import { ReactNode, useState } from 'react';

// Lazy load wallet provider only when needed to avoid HMR issues
const AleoWalletProvider = dynamic(() => import('@provablehq/aleo-wallet-adaptor-react').then(mod => ({ default: mod.AleoWalletProvider })), { ssr: false });
const WalletModalProvider = dynamic(() => import('@provablehq/aleo-wallet-adaptor-react-ui').then(mod => ({ default: mod.WalletModalProvider })), { ssr: false });

import dynamic from 'next/dynamic';
import { ShieldWalletAdapter } from '@provablehq/aleo-wallet-adaptor-shield';
import { LeoWalletAdapter } from '@provablehq/aleo-wallet-adaptor-leo';
import { FoxWalletAdapter } from '@provablehq/aleo-wallet-adaptor-fox';
import { PuzzleWalletAdapter } from '@provablehq/aleo-wallet-adaptor-puzzle';
import { SoterWalletAdapter } from '@provablehq/aleo-wallet-adaptor-soter';
import { DecryptPermission } from '@provablehq/aleo-wallet-adaptor-core';
import { Network } from '@provablehq/aleo-types';

const wallets = [
  new ShieldWalletAdapter(),
  new LeoWalletAdapter(),
  new FoxWalletAdapter(),
  new PuzzleWalletAdapter(),
  new SoterWalletAdapter(),
];

export function WalletProviderComponent({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Only render wallet providers on client after hydration
  if (!mounted && typeof window !== 'undefined') {
    setMounted(true);
  }

  if (!mounted) {
    return <>{children}</>;
  }

  try {
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
    console.error('[v0] Wallet provider error:', error);
    return <>{children}</>;
  }
}
