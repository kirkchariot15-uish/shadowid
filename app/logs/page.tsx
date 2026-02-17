'use client'

import dynamic from 'next/dynamic'

const LogsPageContent = dynamic(
  () => import('@/components/logs-page').then(mod => ({ default: mod.default })),
  { ssr: false, loading: () => <div className="min-h-screen bg-background" /> }
)

export default function Page() {
  return <LogsPageContent />
}
