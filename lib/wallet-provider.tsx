'use client';
import { ReactNode, useMemo } from 'react';
import { AleoWalletProvider } from '@provablehq/aleo-wallet-adaptor-react';
import { WalletModalProvider } from '@provablehq/aleo-wallet-adaptor-react-ui';
import { DecryptPermission } from '@provablehq/aleo-wallet-adaptor-core';
import { Network } from '@provablehq/aleo-types';
import '@provablehq/aleo-wallet-adaptor-react-ui/dist/styles.css';

export function WalletProviderComponent({ children }: { children: ReactNode }) {
  const wallets = useMemo(() => {
    if (typeof window === 'undefined') return [];
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
}
