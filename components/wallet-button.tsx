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
      <button disabled className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-accent text-accent-foreground cursor-not-allowed">
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
      <style>{`
        /* Override wallet button colors to match accent brand color */
        .wallet-adapter-button {
          background-color: hsl(241 74% 52%) !important;
          color: hsl(0 0% 98%) !important;
          border: none !important;
        }
        .wallet-adapter-button:hover {
          background-color: hsl(241 74% 45%) !important;
        }
        .wallet-adapter-button:active {
          background-color: hsl(241 74% 40%) !important;
        }
        /* Multi button container */
        .wallet-adapter-button-trigger {
          background-color: hsl(241 74% 52%) !important;
          color: hsl(0 0% 98%) !important;
          border: none !important;
        }
        .wallet-adapter-button-trigger:hover {
          background-color: hsl(241 74% 45%) !important;
        }
      `}</style>
      <WalletMultiButtonComponent />
    </Suspense>
  );
}
);

export { WalletMultiButton };
