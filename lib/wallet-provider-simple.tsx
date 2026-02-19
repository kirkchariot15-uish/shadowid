'use client';
import { ReactNode } from 'react';
import { WalletProvider } from '@/lib/wallet-context';

export function WalletProviderComponent({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
