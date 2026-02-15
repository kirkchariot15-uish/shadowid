'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Wraps a component so it only renders on the client (ssr: false).
 * Use this for any component that depends on the Aleo wallet provider.
 */
export function clientOnly<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  return dynamic(importFn, {
    ssr: false,
    loading: () => (
      <>{fallback ?? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      )}</>
    ),
  });
}
