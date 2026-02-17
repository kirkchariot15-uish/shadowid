'use client'

import dynamic from 'next/dynamic'

const SettingsPageContent = dynamic(
  () => import('@/components/settings-page').then(mod => ({ default: mod.default })),
  { ssr: false, loading: () => <div className="min-h-screen bg-background" /> }
)

export default function Page() {
  return <SettingsPageContent />
}
