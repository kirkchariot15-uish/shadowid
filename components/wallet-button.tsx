'use client';

import dynamic from 'next/dynamic';
import '@provablehq/aleo-wallet-adaptor-react-ui/dist/styles.css';

const WalletMultiButton = dynamic(
  () =>
    import('@provablehq/aleo-wallet-adaptor-react-ui').then(
      (mod) => mod.WalletMultiButton
    ),
  { 
    ssr: false,
    loading: () => (
      <button disabled className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-accent/50 text-accent-foreground cursor-not-allowed">
        Loading...
      </button>
    ),
  }
);

export { WalletMultiButton };
