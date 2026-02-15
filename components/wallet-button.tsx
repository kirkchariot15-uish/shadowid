'use client';

import dynamic from 'next/dynamic';

// Dynamically import WalletMultiButton with SSR disabled so the Aleo adapter
// package is never loaded during static prerendering.
const WalletMultiButton = dynamic(
  () =>
    import('@provablehq/aleo-wallet-adaptor-react-ui').then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false, loading: () => <span className="inline-block h-10 w-36 rounded-lg bg-muted/20 animate-pulse" /> }
);

export { WalletMultiButton };
