'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import '@provablehq/aleo-wallet-adaptor-react-ui/dist/styles.css';

const WalletMultiButtonComponent = dynamic(
  () =>
    import('@provablehq/aleo-wallet-adaptor-react-ui').then(
      (mod) => mod.WalletMultiButton
    ),
  { 
    ssr: false,
    loading: () => (
      <button className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90">
        Loading wallet...
      </button>
    ),
  }
);

export function WalletMultiButton() {
  return (
    <Suspense fallback={
      <button className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90">
        Connect Wallet
      </button>
    }>
      <WalletMultiButtonComponent />
    </Suspense>
  );
}
